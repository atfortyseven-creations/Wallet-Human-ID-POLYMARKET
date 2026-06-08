import { createFileManager, compile } from '@noir-lang/noir_wasm';

async function run() {
    const fm = createFileManager('/');
    
    // In Node 18+, ReadableStream is available globally.
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

    // fm.writeFile takes a readable stream
    await fm.writeFile('Nargo.toml', createStream(nargo));
    await fm.writeFile('src/main.nr', createStream('fn main() {}'));
    
    try {
        const res = await compile(fm, '/');
        console.log("SUCCESS!", res);
    } catch (e) {
        console.error("COMPILE ERROR", e);
    }
}
run();
