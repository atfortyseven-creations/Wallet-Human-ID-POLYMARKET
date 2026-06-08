import { createFileManager, compile } from '@noir-lang/noir_wasm';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

async function run() {
    const tmpDir = path.join(process.cwd(), 'tmp_noir');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    if (!fs.existsSync(path.join(tmpDir, 'src'))) fs.mkdirSync(path.join(tmpDir, 'src'));

    const fm = createFileManager(tmpDir);
    
    const nargo = `[package]
name = "test"
type = "bin"
authors = [""]
compiler_version = ">=0.36.0"
`;
    
    fs.writeFileSync(path.join(tmpDir, 'Nargo.toml'), nargo);
    fs.writeFileSync(path.join(tmpDir, 'src', 'main.nr'), 'fn main() {}');
    
    // Actually createFileManager doesn't even need us to use its writeFile if we just write to disk!
    try {
        const res = await compile(fm, tmpDir);
        console.log("SUCCESS!", res);
    } catch (e) {
        console.error(e);
    }
}
run();
