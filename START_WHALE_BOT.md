# Start Whale Bot - Quick Guide

##  Simplest Method (Recommended)

1. Open a terminal in the project root.
2. Run the start script:
```bash
./start-bot.sh
```

## ️ Advanced Method (PM2 - High Availability)

If you have PM2 installed, use these commands to keep the bot running 24/7 even if the server restarts:

1. **Start the bot**:
```bash
pm2 start scripts/whale-telegram-bot.js --name "whale-bot"
```

2. **Check status**:
```bash
pm2 status
```

3. **View logs**:
```bash
pm2 logs whale-bot
```

4. **Save to start automatically**:
```bash
pm2 save
```

##  Alternative Method (Without PM2)

If you don't want to use PM2, you can run it directly with Node.js:

```bash
node scripts/whale-telegram-bot.js
```

**Note**: This method will NOT automatically restart if the bot crashes.

##  Useful Commands

*   **Stop bot (PM2)**: `pm2 stop whale-bot`
*   **Restart bot (PM2)**: `pm2 restart whale-bot`
*   **Delete from PM2**: `pm2 delete whale-bot`

##  Verification

How to know if it's working:
1. Run `pm2 logs whale-bot`.
2. You should see messages like:
```
[WhaleBot] Connecting to mempool...
[WhaleBot] Scanning for transactions > 50 BTC...
[WhaleBot] Telegram connected.
```

##  Troubleshooting

### Command 'pm2' not found
**Solution 1**: Close and reopen the terminal.
**Solution 2**: Reinstall PM2:
```bash
npm install -g pm2
```
**Solution 3**: Use the alternative method without PM2.

### Missing environment variables
Check that environment variables are configured:
```bash
echo $TELEGRAM_BOT_TOKEN
echo $TELEGRAM_CHAT_ID
```
If they are empty, configure them in `.env`.

### Bot not sending alerts to Telegram
1. Check that the Token and Chat ID are correct.
2. Verify that the bot is added to the `@HumanidFi` channel.
3. Ensure the bot has "Administrator" permissions to send messages.
