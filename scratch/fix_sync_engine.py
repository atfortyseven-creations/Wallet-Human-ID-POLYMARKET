file_path = "d:\\Projects\\Wallet Human Polymarket ID\\lib\\engine\\ChatSyncEngine.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

import_statement = "import { CallMetadataEngine } from './CallMetadataEngine';\n"
if "CallMetadataEngine" not in content:
    content = content.replace(
        "import { streamMessages, sendMessage as xmtpSend } from '@/lib/xmtp/client';",
        "import { streamMessages, sendMessage as xmtpSend } from '@/lib/xmtp/client';\n" + import_statement
    )

old_loop = """        const isMine = msg.senderInboxId === this.client.inboxId || msg.senderAddress === this.myAddress;
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);"""

new_loop = """        const isMine = msg.senderInboxId === this.client.inboxId || msg.senderAddress === this.myAddress;
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
        
        // INTERCEPT SYSTEM MESSAGES
        if (!isMine && CallMetadataEngine.interceptIncomingCall(content)) {
          continue; // Do not save system messages to UI database
        }
"""

content = content.replace(old_loop, new_loop)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("ChatSyncEngine: Interceptor added")