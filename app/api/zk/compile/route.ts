import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { getSession } from '@/lib/session';

// [SECURITY] Per-session compile rate limit: max 5 compilations per minute
const compileRateLimit = new Map<string, { count: number; resetAt: number }>();
function checkCompileLimit(userId: string): boolean {
  const now = Date.now();
  const WINDOW = 60_000;
  const MAX = 5;
  const entry = compileRateLimit.get(userId) ?? { count: 0, resetAt: now + WINDOW };
  if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + WINDOW; }
  entry.count++;
  compileRateLimit.set(userId, entry);
  return entry.count <= MAX;
}

const execAsync = promisify(exec);

// ─────────────────────────────────────────────────────────────
//  NARGO VERSION & BINARY MANAGEMENT
// ─────────────────────────────────────────────────────────────
const NARGO_VERSION = '0.36.0'; // Latest stable as of June 2026
const NARGO_DIR     = path.join(os.tmpdir(), `nargo-bin-${NARGO_VERSION}`);

let cachedNargoPath = '';

/** Returns the absolute path to a ready-to-execute nargo binary. */
async function getOrDownloadNargo(): Promise<string> {
  // 1. Cache hit
  if (cachedNargoPath && fs.existsSync(cachedNargoPath)) {
    return cachedNargoPath;
  }

  const platform = os.platform(); // 'linux' | 'darwin' | 'win32'
  const arch     = os.arch();     // 'x64' | 'arm64'
  const ext      = platform === 'win32' ? '.exe' : '';
  const binPath  = path.join(NARGO_DIR, `nargo${ext}`);

  // 2. Binary already downloaded (persisted across warm starts)
  if (fs.existsSync(binPath)) {
    // Quick sanity: binary must be executable
    try {
      if (platform !== 'win32') fs.accessSync(binPath, fs.constants.X_OK);
      cachedNargoPath = binPath;
      return binPath;
    } catch {
      // Permission bit lost — re-apply and return
      try { fs.chmodSync(binPath, 0o755); cachedNargoPath = binPath; return binPath; } catch {}
    }
  }

  fs.mkdirSync(NARGO_DIR, { recursive: true });

  // 3. Determine download URL for this platform
  const BASE = `https://github.com/noir-lang/noir/releases/download/v${NARGO_VERSION}`;
  let archiveName: string;
  if      (platform === 'win32')                        archiveName = 'nargo-x86_64-pc-windows-msvc.zip';
  else if (platform === 'darwin' && arch === 'arm64')   archiveName = 'nargo-aarch64-apple-darwin.tar.gz';
  else if (platform === 'darwin')                       archiveName = 'nargo-x86_64-apple-darwin.tar.gz';
  else                                                  archiveName = 'nargo-x86_64-unknown-linux-gnu.tar.gz';

  const downloadUrl   = `${BASE}/${archiveName}`;
  const archivePath   = path.join(NARGO_DIR, archiveName);

  console.log(`[ZK:Nargo] Downloading ${downloadUrl} …`);

  const res = await fetch(downloadUrl, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Nargo download failed: HTTP ${res.status}`);

  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(archivePath, buf);

  // 4. Extract
  if (platform === 'win32') {
    await execAsync(
      `powershell -NoProfile -Command "Expand-Archive -Force '${archivePath}' '${NARGO_DIR}'"`,
      { timeout: 120_000 }
    );
    // The zip contains a folder — find nargo.exe recursively
    const found = findFile(NARGO_DIR, 'nargo.exe');
    if (found && found !== binPath) fs.copyFileSync(found, binPath);
  } else {
    await execAsync(`tar -xzf "${archivePath}" -C "${NARGO_DIR}"`, { timeout: 120_000 });
    const found = findFile(NARGO_DIR, 'nargo');
    if (found && found !== binPath) {
      fs.copyFileSync(found, binPath);
      fs.chmodSync(binPath, 0o755);
    }
  }

  if (!fs.existsSync(binPath)) {
    throw new Error('Nargo binary extraction failed — binary not found after unpacking.');
  }
  if (platform !== 'win32') fs.chmodSync(binPath, 0o755);

  cachedNargoPath = binPath;
  console.log(`[ZK:Nargo] Binary ready at ${binPath}`);
  return binPath;
}

/** Recursive file-finder helper */
function findFile(dir: string, name: string): string | null {
  try {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const hit = findFile(full, name);
        if (hit) return hit;
      } else if (entry.name === name) {
        return full;
      }
    }
  } catch {}
  return null;
}

// ─────────────────────────────────────────────────────────────
//  CIRCUIT ANALYSIS — detect what kind of circuit is submitted
// ─────────────────────────────────────────────────────────────
interface CircuitAnalysis {
  hasMain:       boolean;
  isLibrary:     boolean;
  usesStd:       boolean;
  usesAztec:     boolean;
  hasModules:    boolean;
  estimatedType: 'bin' | 'lib';
}

function analyseCircuit(code: string): CircuitAnalysis {
  return {
    hasMain:       /\bfn\s+main\b/.test(code),
    isLibrary:     /^mod\s+\w+/m.test(code) || /^pub\s+mod\s+/m.test(code),
    usesStd:       /use\s+std::/.test(code),
    usesAztec:     /use\s+dep::aztec/.test(code) || /aztec::/.test(code),
    hasModules:    /^mod\s+/m.test(code),
    estimatedType: /\bfn\s+main\b/.test(code) ? 'bin' : 'lib',
  };
}

// ─────────────────────────────────────────────────────────────
//  ERROR HUMANISER — turn raw nargo stderr into developer-friendly messages
// ─────────────────────────────────────────────────────────────
function humaniseError(raw: string): string {
  if (!raw) return 'Compilation failed (no error output).';

  // nargo outputs ANSI colour codes — strip them
  const clean = raw.replace(/\x1b\[[0-9;]*m/g, '').trim();

  // Extract the most informative line
  const errorLine = clean
    .split('\n')
    .find(l => /error\[/i.test(l) || /^error:/i.test(l))
    ?? clean.split('\n')[0];

  // Common patterns → friendly messages
  if (/cannot find type/i.test(clean))
    return `Type not found.\n${errorLine}\n\nHint: Make sure all custom types are defined before use, or add the correct std import.`;
  if (/cannot find function/i.test(clean))
    return `Function not found.\n${errorLine}\n\nHint: Check function name spelling or add the required use statement.`;
  if (/expected .+ arguments.*found/i.test(clean))
    return `Wrong number of arguments.\n${errorLine}`;
  if (/mismatched types/i.test(clean) || /type mismatch/i.test(clean))
    return `Type mismatch.\n${errorLine}\n\nHint: Field vs u64 vs u32 must be consistent throughout the circuit.`;
  if (/unused variable/i.test(clean))
    return `Unused variable warning treated as error.\n${errorLine}\n\nHint: Prefix unused variables with _ (e.g. _my_var).`;
  if (/cannot apply unary operator/i.test(clean))
    return `Operator not applicable to this type.\n${errorLine}`;
  if (/assertion failed/i.test(clean))
    return `Assertion failed at compile time.\n${errorLine}\n\nHint: Check that constexpr values satisfy all assert() conditions.`;
  if (/cannot find module/i.test(clean) || /mod .+ not found/i.test(clean))
    return `Module not found.\n${errorLine}\n\nHint: Sandbox supports single-file circuits. Move all code into main.nr or paste the full module inline.`;
  if (/compiler_version/i.test(clean))
    return `Compiler version mismatch.\n${errorLine}\n\nHint: Remove the compiler_version field from Nargo.toml or use >=0.36.0.`;
  if (/timed out|timeout/i.test(clean))
    return 'Compilation timed out (circuit may be too complex). Try simplifying the circuit.';

  // Return cleaned raw output (limited to first 40 lines for UX)
  return clean.split('\n').slice(0, 40).join('\n');
}

// ─────────────────────────────────────────────────────────────
//  WORKSPACE BUILDER — supports single-file AND multi-module circuits
// ─────────────────────────────────────────────────────────────
interface WorkspaceFiles {
  [filePath: string]: string; // relative path → content
}

function buildWorkspace(workspaceDir: string, sourceCode: string, analysis: CircuitAnalysis): void {
  const srcDir = path.join(workspaceDir, 'src');
  fs.mkdirSync(srcDir, { recursive: true });

  const packageType = analysis.estimatedType;
  const entryFile   = packageType === 'lib' ? 'lib.nr' : 'main.nr';

  // Nargo.toml — minimal, no compiler_version to avoid version mismatch errors
  const toml = `[package]
name = "sandbox_circuit"
type = "${packageType}"
authors = ["Whale Network Sandbox"]
edition = "2024"

[dependencies]
`;
  fs.writeFileSync(path.join(workspaceDir, 'Nargo.toml'), toml);
  fs.writeFileSync(path.join(srcDir, entryFile), sourceCode);
}

// ─────────────────────────────────────────────────────────────
//  API ROUTE
// ─────────────────────────────────────────────────────────────
export const runtime = 'nodejs';
export const maxDuration = 120; // 2 min for heavy circuits on Railway

export async function POST(req: Request) {
  const startTime = Date.now();
  let workspaceDir = '';

  try {
    // [SECURITY HARDENING] Require authenticated session before triggering server-side compilation.
    // Previously unauthenticated — any internet actor could consume server CPU/memory
    // for 90 seconds per request with complex circuits (DoS attack vector).
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Authentication required to use the ZK Sandbox.' }, { status: 401 });
    }

    // Rate limit: max 5 compilations per minute per wallet
    if (!checkCompileLimit(session.userId)) {
      return NextResponse.json({ success: false, error: 'Rate limit exceeded: max 5 compilations per minute.' }, { status: 429 });
    }

    const body = await req.json();
    const sourceCode: string = body.sourceCode ?? '';

    // ── Validate input ───────────────────────────────────────
    if (!sourceCode.trim()) {
      return NextResponse.json({ success: false, error: 'No source code provided.' }, { status: 400 });
    }

    const analysis = analyseCircuit(sourceCode);

    if (!analysis.hasMain && !analysis.isLibrary) {
      return NextResponse.json({
        success: false,
        error: [
          'Circuit must contain a `fn main(…)` entry point (for binary circuits)',
          'or a module declaration (for library circuits).',
          '',
          'Example minimal circuit:',
          '',
          'fn main(x: Field, y: pub Field) {',
          '    assert(x != y);',
          '}',
        ].join('\n')
      }, { status: 400 });
    }

    if (analysis.usesAztec) {
      return NextResponse.json({
        success: false,
        error: [
          'This circuit uses aztec::* (Aztec.nr contracts).',
          'The sandbox currently supports pure Noir circuits (no Aztec contract runtime).',
          'Remove `use dep::aztec` imports and run the circuit as a standalone Noir program.',
        ].join('\n')
      }, { status: 400 });
    }

    // ── Get compiler ─────────────────────────────────────────
    let nargoPath: string;
    try {
      nargoPath = await getOrDownloadNargo();
    } catch (e: any) {
      console.error('[ZK:Nargo] Binary unavailable:', e.message);
      return NextResponse.json({
        success: false,
        error: 'Compiler backend temporarily unavailable. Please retry in a few seconds.',
      }, { status: 503 });
    }

    // ── Create isolated workspace ────────────────────────────
    const id = crypto.randomBytes(8).toString('hex');
    workspaceDir = path.join(os.tmpdir(), `noir-ws-${id}`);
    buildWorkspace(workspaceDir, sourceCode, analysis);

    // ── Compile ──────────────────────────────────────────────
    console.log(`[ZK:Nargo] Compiling workspace ${id} …`);
    let compileStdout = '';
    let compileStderr = '';
    try {
      const { stdout, stderr } = await execAsync(
        `"${nargoPath}" compile`,
        {
          cwd:     workspaceDir,
          timeout: 90_000,            // 90 s hard cap
          env:     { ...process.env, NARGO_BACKEND: 'barretenberg', HOME: os.tmpdir() },
        }
      );
      compileStdout = stdout ?? '';
      compileStderr = stderr ?? '';
    } catch (compileErr: any) {
      const rawError = compileErr.stderr || compileErr.stdout || compileErr.message || 'Unknown error';
      const friendly = humaniseError(rawError);
      console.warn(`[ZK:Nargo] Compile error for ${id}:\n${rawError}`);
      return NextResponse.json({ success: false, error: friendly }, { status: 400 });
    }

    // ── Read output artefact ─────────────────────────────────
    // nargo compile writes to target/<package_name>.json
    const targetDir  = path.join(workspaceDir, 'target');
    let artifactPath = path.join(targetDir, 'sandbox_circuit.json');

    // Fallback: find any .json in target/
    if (!fs.existsSync(artifactPath)) {
      const files = fs.existsSync(targetDir)
        ? fs.readdirSync(targetDir).filter(f => f.endsWith('.json') && !f.includes('debug'))
        : [];
      if (files.length > 0) {
        artifactPath = path.join(targetDir, files[0]);
      } else {
        throw new Error('Compilation artefact not found. The circuit compiled but produced no output file.');
      }
    }

    const artifact     = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
    const bytecodeB64  = artifact.bytecode ?? '';
    const abiJson      = artifact.abi ?? {};
    const bytecodeHex  = `0x${Buffer.from(bytecodeB64, 'base64').toString('hex')}`;
    const bytecodeSize = Math.floor(bytecodeHex.length / 2); // bytes

    // ── Summarise ABI for display ─────────────────────────────
    const params: { name: string; type: string; visibility: string }[] = [];
    if (Array.isArray(abiJson?.parameters)) {
      for (const p of abiJson.parameters) {
        params.push({
          name:       p.name ?? '?',
          type:       JSON.stringify(p.type ?? 'unknown'),
          visibility: p.visibility ?? 'private',
        });
      }
    }

    const elapsed = Date.now() - startTime;
    console.log(`[ZK:Nargo] ✓ ${id} compiled in ${elapsed} ms — ${bytecodeSize} bytes`);

    return NextResponse.json({
      success:      true,
      acir:         bytecodeHex,
      bytecodeSize,
      abi:          params,
      warnings:     compileStderr ? [compileStderr.split('\n')[0]] : [],
      compileMs:    elapsed,
      nargoVersion: NARGO_VERSION,
    });

  } catch (err: any) {
    console.error('[ZK:Nargo] Unexpected error:', err);
    return NextResponse.json({ success: false, error: err.message ?? 'Internal error' }, { status: 500 });

  } finally {
    // ── Cleanup workspace ─────────────────────────────────────
    if (workspaceDir) {
      try { fs.rmSync(workspaceDir, { recursive: true, force: true }); } catch {}
    }
  }
}
