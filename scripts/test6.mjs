import { createFileManager, compile } from '@noir-lang/noir_wasm';
import path from 'path';

async function run() {
    const dir = path.join(process.cwd(), 'tmp_noir_2');
    const fm = createFileManager(dir);
    
    const createStream = (str) => {
        return new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(str));
                controller.close();
            }
        });
    };

    const nargo = `[package]
name = "test"
type = "bin"
authors = [""]
compiler_version = ">=0.36.0"
`;

    await fm.writeFile('Nargo.toml', createStream(nargo));
    await fm.writeFile('src/main.nr', createStream('fn main() {}'));
    
    try {
        const res = await compile(fm, dir);
        console.log("SUCCESS!", Object.keys(res));
    } catch (e) {
        console.error("COMPILE ERROR", e);
    }
}
run();
