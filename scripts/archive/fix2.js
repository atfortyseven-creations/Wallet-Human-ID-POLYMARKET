const fs = require('fs');

function replaceFile(path, replacer) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    content = replacer(content);
    fs.writeFileSync(path, content);
}

replaceFile('app/registry/page.tsx', c => c.replace(/zksyncSepoliaTestnetTestnet/g, 'zksyncSepoliaTestnet'));

replaceFile('components/passport/PassportView.tsx', c => {
    return c.replace(/\{ev\.payload\?\.location && \(/g, '{!!(ev.payload as any)?.location && (')
            .replace(/\{ev\.payload\?\.note && \(/g, '{!!(ev.payload as any)?.note && (')
            .replace(/\{anchorEvent\?\.payload\?\.confirmedAt && \(/g, '{!!(anchorEvent?.payload as any)?.confirmedAt && (');
});

replaceFile('components/rainbow/PortfolioView.tsx', c => {
    return c.replace(/const \[historyLoading, setHistoryLoading\] = useState\(false\);/g, '/* useState removed */')
            .replace(/setHistoryLoading\(/g, '// setHistoryLoading(');
});

replaceFile('lib/blockchain/ExecutionEngine.ts', c => {
    return c.replace(/private executionQueue: ExecutionTask\[\];/g, 'private executionQueue: ExecutionTask[] = [];')
            .replace(/private worker: Worker;/g, 'private worker!: Worker;');
});

replaceFile('lib/blockchain/getblock-engine.ts', c => {
    return c.replace(/activeEndpoint\.url/g, '(activeEndpoint as any).url')
            .replace(/endpoint\.url/g, '(endpoint as any).url');
});

replaceFile('lib/services/SearchAnalyticsService.ts', c => {
    return c.replace(/action\.value/g, '(action as any).value')
            .replace(/action\.from_address/g, '(action as any).from_address')
            .replace(/\.\.\.action,/g, '...(action as any),');
});

replaceFile('lib/store/wallet-store.ts', c => {
    return c.replace(/baseCurrency: val,/g, 'baseCurrency: val as any,');
});

console.log("Fixes applied.");
