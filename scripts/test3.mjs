import { createFileManager, compile } from '@noir-lang/noir_wasm';
import { Readable } from 'stream';

const fm = createFileManager('/');
// Try writing via stream
const stream = new ReadableStream({
    start(controller) {
        controller.enqueue(new TextEncoder().encode('fn main() {}'));
        controller.close();
    }
});

fm.writeFile('src/main.nr', stream).then(() => {
    return compile(fm, '/');
}).then(res => {
    console.log("SUCCESS!", res);
}).catch(console.error);
