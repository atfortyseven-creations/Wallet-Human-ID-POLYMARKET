const fs = require('fs');
const path = require('path');

const JARGON_MAP = [
    { regex: /Intelligence Matrix/gi, replacement: "System" },
    { regex: /Sovereign/gi, replacement: "Private" },
    { regex: /Live/g, replacement: "Active" },
    { regex: /Green Points/gi, replacement: "Metrics" },
    { regex: /Abysmal Complexity/gi, replacement: "Advanced Architecture" },
    { regex: /Absolute Zenith/gi, replacement: "Final Deployment" }
];

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;
    
    JARGON_MAP.forEach(rule => {
        content = content.replace(rule.regex, rule.replacement);
    });
    
    content = content.replace(EMOJI_REGEX, '');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Normalized: ${filePath}`);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file === 'node_modules' || file === '.git' || file === '.next') continue;
            traverse(fullPath);
        } else {
            if (fullPath.endsWith('.md') || fullPath.endsWith('.nr') || fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.sol') || fullPath.endsWith('.toml') || fullPath.endsWith('.yml') || fullPath.endsWith('.yaml')) {
                processFile(fullPath);
            }
        }
    }
}

traverse(process.cwd());
console.log("Normalization complete.");
