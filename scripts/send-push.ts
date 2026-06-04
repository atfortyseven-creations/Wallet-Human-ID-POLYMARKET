const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv(): Record<string, string> {
    const envPath = path.join(__dirname, '../.env');
    if (!fs.existsSync(envPath)) return {};
    
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    const env: Record<string, string> = {};
    
    for (const line of lines) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = match[2] || '';
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            env[match[1]] = value;
        }
    }
    return env;
}

async function sendTo(botToken: string, chatId: string, message: string) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            }),
        });
        const result: any = await response.json();
        if (response.ok) {
            console.log(` Success: Message sent to ${chatId}`);
            return true;
        } else {
            console.error(` Failed: ${chatId} ->`, result.description || result);
            return false;
        }
    } catch (e: any) {
        console.error(` Critical Error for ${chatId}:`, e.message);
        return false;
    }
}

async function broadcastUpdate() {
    const env = loadEnv();
    const botToken = env['TELEGRAM_BOT_TOKEN'];

    if (!botToken) {
        console.error(" TELEGRAM_BOT_TOKEN missing in .env");
        return;
    }

    const message = `
 *SISTEMA ESTABILIZADO: WHALE ALERT v6.12.0 ONLINE* 

We have completed Elite-grade optimization for our analytics network.

 *RPC Multiplexer*: Multi-key failover active with 6 redundant GetBlock endpoints.
 *Full Multi-Chain*: Real-time monitoring on *Ethereum*, *BSC*, and *Base*.
 *System Handshake*: iOS & Android mobile synchronization fully operational.
 *Extreme Resilience*:Blacklist cooldowns optimized for 100% uptime.

The alert grid is fully operational and shielded. The legendary monitoring continues. ️
    `.trim();

    console.log(" Initiating legendary broadcast...");

    const targets = ["@HumanidFi", "7247569356"];
    
    for (const target of targets) {
        await sendTo(botToken, target, message);
    }
}

broadcastUpdate();
