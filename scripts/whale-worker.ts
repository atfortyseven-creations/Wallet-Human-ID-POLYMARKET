const { ethers } = require("ethers");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const prisma = new PrismaClient();

// Configuration
const BASE_RPC_URL = process.env.BASE_MAINNET_RPC_URL || `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'p2MK6Y8eQyHPbS5gQZ7TU'}`;
const BTC_RPC_URL = process.env.NEXT_PUBLIC_BITCOIN_RPC_URL || "https://go.getblock.io/3648ec097a0e447fa4eb8d92b81e5230";
const WHALE_THRESHOLD_USD = 50000;

// Telegram Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8400528150:AAGtzfSpSvD6HgauHwg7Nw3sGElQx1Ug4rg";
const TARGET_CHAT_ID = "@HumanidFi"; 
const TOPIC_ID = 1367;

// Token Addresses on BASE
const TOKENS = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  mUSDC: "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA", // Bridged USDbC
  WETH: "0x4200000000000000000000000000000000000006",
  DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
  cbETH: "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22",
};

// ERC20 Transfer Event Topic
const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

async function sendTelegram(text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  try {
    const res = await axios.post(url, {
      chat_id: TARGET_CHAT_ID,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      message_thread_id: TOPIC_ID
    });
    return res.data.ok;
  } catch (e: any) {
    console.error("❌ [Whale Worker] Telegram Error:", e.response?.data || e.message);
    return false;
  }
}

const formatMoney = (val: number) => {
  const eurVal = val * 0.96;
  const millions = (eurVal / 1_000_000).toFixed(2);
  return `€${millions} Millones de euros`;
};

async function startWorker() {
  console.log("🐋 [Whale Worker] Starting with robust RPC...");
  
  const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
  
  // Start EVM Worker (Base)
  startEvmWorker(provider).catch(e => console.error("❌ [EVM Worker] Failed:", e));

  // Start Bitcoin Worker
  startBtcWorker().catch(e => console.error("❌ [BTC Worker] Failed:", e));
}

async function startEvmWorker(provider: any) {
  let lastProcessedBlock;
  try {
    lastProcessedBlock = await provider.getBlockNumber();
    console.log(`📡 [EVM Worker] Connected to Base. Starting from block: ${lastProcessedBlock}`);
  } catch (err: any) {
    console.error("❌ [EVM Worker] Failed to connect to RPC:", err.message);
    return;
  }

  while (true) {
    try {
      const currentBlock = await provider.getBlockNumber();
      
      if (currentBlock > lastProcessedBlock) {
        console.log(`🔍 [EVM Worker] Scanning blocks ${lastProcessedBlock + 1} to ${currentBlock}...`);

        // 1. Check Native ETH Transfers
        try {
            const block = await provider.getBlock(currentBlock, true);
            if (block && block.prefetchedTransactions) {
                for (const tx of block.prefetchedTransactions) {
                    const valueEth = parseFloat(ethers.formatEther(tx.value));
                    const usdValue = valueEth * 3300; 
                    
                    if (usdValue >= WHALE_THRESHOLD_USD) {
                        await processWhaleTx(tx.hash, tx.from, tx.to, "ETH", valueEth, usdValue, currentBlock, 'BASE');
                    }
                }
            }
        } catch (e: any) {
            console.warn("⚠️ [EVM Worker] Could not fetch (ETH) block txs:", e.message);
        }

        // 2. Check ERC20 Transfers (Logs)
        const logs = await provider.getLogs({
          fromBlock: lastProcessedBlock + 1,
          toBlock: currentBlock,
          topics: [TRANSFER_TOPIC]
        });

        for (const log of logs) {
          try {
            // Identify Token
            let tokenSymbol = "Unknown";
            let decimals = 18;
            let price = 0;

            if (log.address.toLowerCase() === TOKENS.USDC.toLowerCase() || log.address.toLowerCase() === TOKENS.mUSDC.toLowerCase()) {
                tokenSymbol = "USDC";
                decimals = 6;
                price = 1;
            } else if (log.address.toLowerCase() === TOKENS.WETH.toLowerCase()) {
                tokenSymbol = "WETH";
                decimals = 18;
                price = 3300;
            } else if (log.address.toLowerCase() === TOKENS.cbETH.toLowerCase()) {
                tokenSymbol = "cbETH";
                decimals = 18;
                price = 3400; 
            } else if (log.address.toLowerCase() === TOKENS.DAI.toLowerCase()) {
                tokenSymbol = "DAI";
                decimals = 18;
                price = 1;
            } else {
                continue; 
            }

            // Parse Value
            const parsedLog = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], log.data);
            const rawValue = parsedLog[0];
            const tokenAmount = parseFloat(ethers.formatUnits(rawValue, decimals));
            const usdValue = tokenAmount * price;

            if (usdValue >= WHALE_THRESHOLD_USD) {
                const from = ethers.AbiCoder.defaultAbiCoder().decode(["address"], log.topics[1])[0];
                const to = ethers.AbiCoder.defaultAbiCoder().decode(["address"], log.topics[2])[0];
                
                await processWhaleTx(log.transactionHash, from, to, tokenSymbol, tokenAmount, usdValue, currentBlock, 'BASE');
            }

          } catch (err) {
            // Silent catch
          }
        }

        lastProcessedBlock = currentBlock;
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10s Poll
    } catch (error: any) {
      console.error("❌ [EVM Worker] Loop Error:", error.message);
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
}

// Bitcoin Configuration (BTC Worker uses BTC_RPC_URL constant defined at top)

async function btcRpcCall(method: string, params: any[] = []) {
    const response = await axios.post(BTC_RPC_URL, {
        jsonrpc: "1.0",
        id: "btc-worker",
        method: method,
        params: params
    }, {
        headers: { 'Content-Type': 'application/json' }
    });
    return response.data.result;
}

async function startBtcWorker() {
    let lastBlock = 0;
    try {
        lastBlock = await btcRpcCall("getblockcount");
        console.log(`asd [BTC Worker] Connected. Starting from block height: ${lastBlock}`);
    } catch (e: any) {
        console.error("❌ [BTC Worker] Connection failed:", e.message);
        return;
    }

    while (true) {
        try {
            const currentBlock = await btcRpcCall("getblockcount");
            
            if (currentBlock > lastBlock) {
                 console.log(`🔍 [BTC Worker] New Bitcoin block: ${currentBlock}`);
                 
                 const blockHash = await btcRpcCall("getblockhash", [currentBlock]);
                 // verbosity 2 for full tx details
                 const block = await btcRpcCall("getblock", [blockHash, 2]); 

                 if (block && block.tx) {
                     for (const tx of block.tx) {
                         // Simple heuristic: Sum output values
                         // Real "whale" logic needs to track input vs output to find actual transfer value
                         // But for tracking *movements*, monitoring large outputs is a good start.
                         
                         let totalOutputBtc = 0;
                         // Check outputs
                         for (const vout of tx.vout) {
                             totalOutputBtc += vout.value;
                         }

                         const btcPrice = 98000; // Mock/Approx Price - In prod use fetch
                         const usdValue = totalOutputBtc * btcPrice;

                         if (usdValue >= WHALE_THRESHOLD_USD) {
                             // Using the first input address as 'sender' heuristic (not always 100% accurate in UTXO but sufficient for alert)
                             const sender = tx.vin[0]?.coinbase ? "COINBASE" : "Unknown (UTXO)"; // extracting input address requires looking up prevout, simplified here
                             // For notifictions, we can just show the Transaction ID
                             
                             await processWhaleTx(tx.txid, sender, "Multiple Outputs", "BTC", totalOutputBtc, usdValue, currentBlock, 'BITCOIN');
                         }
                     }
                 }
                 lastBlock = currentBlock;
            }

            await new Promise(resolve => setTimeout(resolve, 60000)); // Bitcoin blocks are slow (10m), poll every 1m
        } catch (e: any) {
            console.error("❌ [BTC Worker] Error:", e.message);
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    }
}

async function processWhaleTx(hash: string, from: string, to: string, asset: string, amount: number, usdValue: number, blockNumber: number, chain: string = 'BASE') {
    // Dedup check (optional but good practice)
    const exists = await prisma.whaleActivity.findUnique({ where: { transactionHash: hash } });
    if (exists) return;

    console.log(`🌊 [${chain}] WHALE: ${usdValue.toFixed(2)} USD (${asset})`);

    // Save DB
    await prisma.whaleActivity.create({
        data: {
            walletAddress: from,
            type: "TRANSFER",
            token: asset,
            amount: amount,
            usdValue: usdValue,
            fromAddress: from,
            toAddress: to || "Contract",
            transactionHash: hash,
            blockNumber: BigInt(blockNumber),
            timestamp: new Date(),
        }
    }).catch(e => console.error("DB Error:", e.message));

    // Telegram
    const shortFrom = `${from.slice(0, 4)}...${from.slice(-4)}`;
    const shortTo = to ? `${to.slice(0, 4)}...${to.slice(-4)}` : 'Contract';
    
    // Auto-detect explorer based on chain
    const explorer = chain === 'BITCOIN' ? `https://mempool.space/tx/${hash}` : `https://basescan.org/tx/${hash}`;

    const msg = `
🐳 <b>ALERTA WHALE DETECTADA</b> | ${chain}

💶 <b>${formatMoney(usdValue)}</b>
Transferencia de <b>${amount.toLocaleString()} ${asset}</b> detectada.

👤 <code>${shortFrom}</code> ➡️ <code>${shortTo}</code>

🔗 <a href="${explorer}">Ver Transacción</a>
`.trim();

    await sendTelegram(msg);
}

module.exports = { startWorker };

// Only run if called directly (CLI)
if (require.main === module) {
  startWorker().catch((err: any) => {
    console.error("💀 [Whale Worker] Fatal error:", err);
    process.exit(1);
  });
}



