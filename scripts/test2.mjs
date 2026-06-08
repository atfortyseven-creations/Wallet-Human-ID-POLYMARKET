import { createFileManager, compile } from '@noir-lang/noir_wasm';

const fm = createFileManager('/');
console.log('FileManager keys:', Object.keys(fm));
fm.writeFile('src/main.nr', 'fn main() {}').then(() => {
    return compile(fm);
}).then(console.log).catch(console.error);
