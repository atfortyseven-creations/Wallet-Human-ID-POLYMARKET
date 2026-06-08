import { FileManager } from '@noir-lang/noir_wasm';
import { compile } from '@noir-lang/noir_wasm';
import fs from 'fs';
import path from 'path';

async function run() {
    const tmpDir = path.join(process.cwd(), 'tmp_noir_3');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    if (!fs.existsSync(path.join(tmpDir, 'src'))) fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });

    const nargo = `[package]
name = "test"
type = "bin"
authors = [""]
compiler_version = ">=0.36.0"
`;
    fs.writeFileSync(path.join(tmpDir, 'Nargo.toml'), nargo);
    fs.writeFileSync(path.join(tmpDir, 'src', 'main.nr'), 'fn main() {}');

    const fm = new FileManager({
        existsSync: fs.existsSync,
        mkdir: fs.mkdirSync,
        writeFile: fs.writeFileSync,
        readFile: (p) => {
            const buf = fs.readFileSync(p);
            // return stream or string depending on what it expects?
            // Wait, Rust usually expects Uint8Array or String.
            return new ReadableStream({
                start(controller) {
                    controller.enqueue(buf);
                    controller.close();
                }
            });
        },
        rename: fs.renameSync,
        readdir: fs.readdirSync,
    }, tmpDir);

    try {
        const res = await compile(fm, tmpDir);
        console.log("SUCCESS!", Object.keys(res));
    } catch (e) {
        console.error("COMPILE ERROR", e);
    }
}
run();
