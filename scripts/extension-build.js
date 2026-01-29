const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🤖 Building Extension...');

const appApiDir = path.join(__dirname, '../app/api');
const backupApiDir = path.join(__dirname, '../api_backup');
const srcActionsDir = path.join(__dirname, '../src/actions');
const backupActionsDir = path.join(__dirname, '../actions_backup');

let movedApi = false;
let movedActions = false;

try {
    // 1. Temporarily move API routes
    if (fs.existsSync(appApiDir)) {
        console.log('📦 Stashing API routes...');
        fs.renameSync(appApiDir, backupApiDir);
        movedApi = true;
    }

    // 2. Temporarily move Server Actions
    if (fs.existsSync(srcActionsDir)) {
        console.log('📦 Stashing Server Actions...');
        fs.renameSync(srcActionsDir, backupActionsDir);
        movedActions = true;
    }

    // 3. Run Next.js Build
    execSync('next build', { stdio: 'inherit', env: { ...process.env, EXT_BUILD: 'true' } });

} catch (e) {
    console.error('Build warning/error:', e.message);
    // Don't exit yet, ensure cleanup runs
} finally {
    // 4. Restore everything
    if (movedApi && fs.existsSync(backupApiDir)) {
        console.log('♻️ Restoring API routes...');
        fs.renameSync(backupApiDir, appApiDir);
    }
    if (movedActions && fs.existsSync(backupActionsDir)) {
        console.log('♻️ Restoring Server Actions...');
        fs.renameSync(backupActionsDir, srcActionsDir);
    }
}

const outDir = path.join(__dirname, '../out');
const nextDir = path.join(outDir, '_next');
const newNextDir = path.join(outDir, 'next');

// 4. Rename _next to next (Chrome Extensions hate underscores)
if (fs.existsSync(nextDir)) {
    console.log('🧹 Sanitizing _next folder...');
    fs.renameSync(nextDir, newNextDir);
}

// 5. Update references in HTML files
function updateHtmlFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            updateHtmlFiles(filePath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');
            // Replace /_next/ with /next/
            if (content.includes('/_next/')) {
                content = content.replace(/\/_next\//g, '/next/');
                fs.writeFileSync(filePath, content);
                console.log(`✨ Patched ${file}`);
            }
        }
    }
}

updateHtmlFiles(outDir);

console.log('✅ Extension Build Complete! Load "out" folder in Chrome.');
