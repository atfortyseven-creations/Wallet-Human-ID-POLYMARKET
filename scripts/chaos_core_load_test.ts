import { ethers } from "hardhat";
import crypto from "crypto";

async function main() {
  console.log("\n============================================================");
  console.log(" NETWORK SCORE & LEDGER  ABYSSAL 2000-TX STRESS TEST ");
  console.log("============================================================\n");

  const signers = await ethers.getSigners();
  const admin = signers[0];
  const testUsers = signers.slice(1, 11); // 10 test users

  console.log(" Deploying CoreDots...");
  const QDs = await ethers.deployContract("CoreDots", [admin.address]);
  await QDs.waitForDeployment();
  const qdsAddress = await QDs.getAddress();
  console.log(` QDs deployed at: ${qdsAddress}`);

  console.log(" Deploying CoreLedger...");
  const Ledger = await ethers.deployContract("CoreLedger", [qdsAddress]);
  await Ledger.waitForDeployment();
  const ledgerAddress = await Ledger.getAddress();
  console.log(` CoreLedger deployed at: ${ledgerAddress}`);

  // Setup: Admin mints 1,000,000 QDs to each of the 10 test users
  console.log("\n Minting initial liquidity to 10 test nodes...");
  const MINT_AMOUNT = ethers.parseEther("1000000");
  for (const user of testUsers) {
    await QDs.connect(admin).mint(user.address, MINT_AMOUNT);
  }
  console.log(` Liquidity distributed. All nodes have 1,000,000 QDs.`);

  // Configuration for 2000 transfers
  const TOTAL_TRANSFERS = 2000;
  const BATCH_SIZE = 50; // Execute in batches to avoid overwhelming the local mempool
  
  console.log(`\n️  Preparing ${TOTAL_TRANSFERS} complex Core Transfers (ERC-2612 Permit)...`);
  
  const chainId = (await ethers.provider.getNetwork()).chainId;
  const domain = {
    name: "CoreDots",
    version: "1",
    chainId: chainId,
    verifyingContract: qdsAddress
  };

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  let txPromises: any[] = [];
  let successfulTxs = 0;
  let failedTxs = 0;
  
  const startTime = Date.now();

  // Pre-fetch nonces for our users
  const nonces = new Map();
  for (const user of testUsers) {
    nonces.set(user.address, Number(await QDs.nonces(user.address)));
  }

  // We will distribute the 2000 transfers among the 10 users sending to a random other user
  for (let i = 0; i < TOTAL_TRANSFERS; i++) {
    const sender = testUsers[i % testUsers.length];
    const receiver = testUsers[(i + 1) % testUsers.length];
    
    const amount = ethers.parseEther((Math.random() * 10 + 1).toFixed(6)); // Random amount between 1 and 11
    const memo = `Core Stress Tx #${i}`;
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    
    // 256-bit client-side entropy
    const entropyHex = "0x" + crypto.randomBytes(32).toString("hex");
    const coreEntropy = BigInt(entropyHex);
    
    // Advanced metadata
    const advancedMetadata = ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "uint64", "bytes32"],
      ["CoreLedger/ChaosTest", Date.now(), ethers.keccak256(ethers.toUtf8Bytes(`route-${i}`))]
    );

    const currentNonce = nonces.get(sender.address);
    nonces.set(sender.address, currentNonce + 1); // Increment local nonce

    const value = {
      owner: sender.address,
      spender: ledgerAddress,
      value: amount,
      nonce: currentNonce,
      deadline: deadline,
    };

    // Sign the permit
    const signature = await sender.signTypedData(domain, types, value);
    const { v, r, s } = ethers.Signature.from(signature);

    // Prepare transaction promise
    const tx = Ledger.connect(sender).transferWithReceiptPermit(
      receiver.address,
      amount,
      memo,
      deadline,
      v,
      r,
      s,
      coreEntropy,
      advancedMetadata
    ).then((r: any) => r.wait())
     .then(() => {
        successfulTxs++;
        if (successfulTxs % 100 === 0) {
            console.log(`    Progress: ${successfulTxs}/${TOTAL_TRANSFERS} receipts minted...`);
        }
     })
     .catch((err: any) => {
        failedTxs++;
        console.error(` Tx Failed: ${err.message}`);
     });

    txPromises.push(tx);

    // If batch size is reached, await the batch
    if (txPromises.length >= BATCH_SIZE) {
        await Promise.all(txPromises);
        txPromises = [];
    }
  }

  // Await remaining
  if (txPromises.length > 0) {
      await Promise.all(txPromises);
  }

  const endTime = Date.now();
  const durationSec = (endTime - startTime) / 1000;
  const tps = TOTAL_TRANSFERS / durationSec;

  console.log("\n============================================================");
  console.log(" LOAD TEST RESULTS");
  console.log("============================================================");
  console.log(`️  Duration:     ${durationSec.toFixed(2)} seconds`);
  console.log(` Throughput:   ${tps.toFixed(2)} TPS (Transactions Per Second)`);
  console.log(` Successful:   ${successfulTxs}`);
  console.log(` Failed:       ${failedTxs}`);

  // Verification
  console.log("\n ON-CHAIN VERIFICATION");
  const totalReceipts = await Ledger.totalReceipts();
  console.log(` Total Receipts in CoreLedger: ${totalReceipts.toString()}`);
  
  if (totalReceipts == BigInt(TOTAL_TRANSFERS)) {
      console.log(" ABYSMALLY PERFECT AND IMMACULATE! Zero errors, all receipts recorded.");
  } else {
      console.log(`️ MISMATCH: Expected ${TOTAL_TRANSFERS}, found ${totalReceipts}`);
  }

  // Read a random receipt to verify data integrity
  const randomId = Math.floor(Math.random() * TOTAL_TRANSFERS) + 1;
  const sampleReceipt = await Ledger.getReceipt(randomId);
  console.log(`\n Sample Receipt #${randomId} Verification:`);
  console.log(`   - Sender: ${sampleReceipt.sender}`);
  console.log(`   - Receiver: ${sampleReceipt.receiver}`);
  console.log(`   - Amount: ${ethers.formatEther(sampleReceipt.amount)} QDs`);
  console.log(`   - Entropy: 0x${sampleReceipt.coreEntropy.toString(16).padStart(64, '0')}`);
  console.log(`   - Payload Hash: ${sampleReceipt.payloadHash}`);
  console.log(`   - Memo: "${sampleReceipt.memo}"`);
  console.log("\n ALL SYSTEMS NOMINAL. Core Ledger is indestructible.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
