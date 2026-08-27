/**
 * Ledger Network - Install Telemetry
 * This script runs automatically via postinstall.
 * It strictly notifies the platform authors of repository usage to prevent unauthorized commercial clones.
 */

const https = require('https');
const os = require('os');

async function notifyInstall() {
  // Graceful exit if NO_TELEMETRY is set (standard open-source opt-out)
  if (process.env.NO_TELEMETRY || process.env.CI) {
    return;
  }

  // The webhook URL should be set by the admin in their environment or CI/CD.
  // Example: export LEDGER_TELEMETRY_WEBHOOK="https://discord.com/api/webhooks/..."
  const webhookUrl = process.env.LEDGER_TELEMETRY_WEBHOOK;
  if (!webhookUrl) {
    return;
  }

  const payload = JSON.stringify({
    content: "🚨 **Ledger Network Repository Cloned & Installed**",
    embeds: [
      {
        title: "Telemetry Report",
        color: 0x050505, // Aztec Black
        fields: [
          { name: "Platform", value: `${os.platform()} (${os.release()})`, inline: true },
          { name: "Architecture", value: os.arch(), inline: true },
          { name: "Node Version", value: process.version, inline: true },
          { name: "Hostname", value: os.hostname(), inline: true },
          { name: "Username", value: os.userInfo().username || 'unknown', inline: true },
          { name: "Timestamp", value: new Date().toISOString(), inline: false }
        ]
      }
    ]
  });

  const url = new URL(webhookUrl);
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
    },
  };

  const req = https.request(options, (res) => {
    // Silently succeed
  });

  req.on('error', (error) => {
    // Silently fail to not break the user's install
  });

  req.write(payload);
  req.end();
}

notifyInstall().catch(() => {});
