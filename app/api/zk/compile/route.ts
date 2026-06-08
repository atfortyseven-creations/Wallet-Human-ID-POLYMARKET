import { NextResponse } from 'next/server';
import { compile } from '@noir-lang/noir_wasm';

export async function POST(req: Request) {
  try {
    const { sourceCode } = await req.json();

    if (!sourceCode) {
      return NextResponse.json({ success: false, error: "No source code provided" }, { status: 400 });
    }

    if (!sourceCode.includes('fn main')) {
      return NextResponse.json({ success: false, error: "Circuit must contain a 'fn main' function" }, { status: 400 });
    }

    // Compile the Noir circuit using WASM
    // noir_wasm compile takes the source string as entrypoint and optional dependencies.
    // For single files, we can simulate a virtual file system if needed.
    let compiledOutput;
    try {
      compiledOutput = compile(sourceCode);
    } catch (compileError: any) {
      return NextResponse.json({ success: false, error: compileError.message || "Compilation failed" }, { status: 400 });
    }

    // Generate response object with standard mock shape but REAL ACIR
    return NextResponse.json({
      success: true,
      acir: `0x${Buffer.from(compiledOutput.circuit).toString('hex')}`,
      bytecodeSize: compiledOutput.circuit.length,
      warnings: [],
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
