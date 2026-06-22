import { createFileManager, compile } from '@noir-lang/noir_wasm';
import fs from 'fs';
import path from 'path';

async function run() {
    // Read the Sandbox component
    const sandboxPath = path.join(process.cwd(), 'components', 'developer', 'NoirCircuitSandbox.tsx');
    const content = fs.readFileSync(sandboxPath, 'utf8');
    
    // Extract the examples using regex
    const regex = /code:\s*`([\s\S]*?)`,/g;
    let match;
    let index = 0;
    let allSuccess = true;
    
    while ((match = regex.exec(content)) !== null) {
        let code = match[1];
        console.log(`\nCompiling Example ${index + 1}...`);
        
        const dir = path.join(process.cwd(), `tmp_compile_test_${index}`);
        fs.mkdirSync(dir, { recursive: true });
        fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
        
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
name = "test_circuit"
type = "bin"
authors = [""]
compiler_version = ">=0.36.0"
`;

        await fm.writeFile('Nargo.toml', createStream(nargo));
        await fm.writeFile('src/main.nr', createStream(code));
        
        try {
            const res = await compile(fm, dir);
            console.log(`✅ Example ${index + 1} SUCCESS! Bytecode Size: ${res.bytecodeSize}`);
        } catch (e) {
            console.error(`❌ Example ${index + 1} COMPILE ERROR:`, e);
            allSuccess = false;
        }
        index++;
    }
    
    if (allSuccess) {
        console.log("\nALL EXAMPLES COMPILED PERFECTLY!");
    } else {
        console.log("\nSOME EXAMPLES FAILED TO COMPILE!");
    }
}

run();
