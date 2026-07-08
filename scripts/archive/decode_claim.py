#!/usr/bin/env python3
# Decode the claim parameters from Log 2 (the FeeJuice bridge log)
# Log 2 address: 0x7c4176bff969c9417e42f9cb921100145911cc84 (Fee Juice Portal)
# topics[0]: event selector
# topics[1]: recipient (0x17aabf46...) = our relayer address
# data: claimAmount(32) + claimSecret(32) + contentHash(32) + messageLeafIndex(32)

data_hex = "0000000000000000000000000000000000000000000000056bc75e2d63100000253ce6a663b68df669f3db6c7dc9fd7360495da29aa2f804c742324126dee23600342b273b2f242b9af7fa0c98a6484ec19f75baf10c5de50e920c46a63ccddc0000000000000000000000000000000000000000000000000000000000d6a82e"

# Split into 32-byte chunks
chunks = [data_hex[i:i+64] for i in range(0, len(data_hex), 64)]
print(f"Number of chunks: {len(chunks)}")

claim_amount_hex = chunks[0] if len(chunks) > 0 else None
claim_secret_hex = chunks[1] if len(chunks) > 1 else None
content_hash_hex = chunks[2] if len(chunks) > 2 else None
message_leaf_index_hex = chunks[3] if len(chunks) > 3 else None

# claimAmount: convert from wei (18 decimals)
claim_amount_int = int(claim_amount_hex, 16)
claim_amount_field = hex(claim_amount_int)

# messageLeafIndex: also the topic[1] of log 1 = 0x000035ab = 13739
leaf_index_dec = int(message_leaf_index_hex, 16) if message_leaf_index_hex else None

print(f"")
print(f"=== DECODED CLAIM PARAMETERS ===")
print(f"claim-amount (as Fr hex):  0x{claim_amount_hex}")
print(f"claim-amount (decimal):    {claim_amount_int} wei = {claim_amount_int / 1e18} FeeJuice")
print(f"")
print(f"claim-secret (Fr hex):     0x{claim_secret_hex}")
print(f"")
print(f"content-hash:              0x{content_hash_hex}")
print(f"")
print(f"message-leaf-index (hex):  0x{message_leaf_index_hex}")
print(f"message-leaf-index (dec):  {leaf_index_dec}")
print(f"")
print(f"=== CLAIM COMMAND ===")
print(f"--claim-amount  0x{claim_amount_hex}")
print(f"--claim-secret  0x{claim_secret_hex}")
print(f"--message-leaf-index  {leaf_index_dec}")
