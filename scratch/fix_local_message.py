import re

file_path = "d:\\Projects\\Wallet Human Polymarket ID\\lib\\sync\\chatDatabase.ts"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Add the missing properties to LocalMessage to satisfy LedgerChat's TS expectations
    replacement = """
export interface LocalMessage {
  id: string;
  peerAddress: string;
  senderAddress: string;
  content: string;
  sentAt: number;
  status: 'sending' | 'sent' | 'failed';
  isMine: boolean;
  isZkVerified?: boolean;
  type?: 'text' | 'voice' | 'payment' | 'system';
  
  // [AEGIS COMPATIBILITY SHIM] TS fixes for Legacy LedgerChat logic
  senderInboxId?: string;
  conversationId?: string;
  burnAtNs?: number;
  sentAtNs?: bigint | number;
  reactions?: any[];
  isPinned?: boolean;
  isDestructing?: boolean;
}
"""

    content = re.sub(
        r"export interface LocalMessage \{[\s\S]*?type\?: 'text' \| 'voice' \| 'payment' \| 'system';\n\}",
        replacement.strip(),
        content
    )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("chatDatabase.ts patched to include backwards compatible properties!")
except Exception as e:
    print(f"Error patching file: {e}")