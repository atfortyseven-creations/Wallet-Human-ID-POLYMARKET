/**
 * ============================================================
 * TOKEN DISCOVERY ENGINE — ERC-20 & ERC-721 Auto-Discovery
 * ============================================================
 * Scans the blockchain for Transfer events to discover tokens
 * held by the user's wallet. Same mechanism as MetaMask's
 * "Autodetect tokens" feature. Fully on-chain. No APIs.
 */

import { ethers } from 'ethers';
import { ERC20_ABI } from './onchain-engine';

// ERC-721 / ERC-1155 interface fragments
export const ERC721_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

export const ERC1155_ABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function uri(uint256 id) view returns (string)",
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
  "event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)",
];

// ERC-165 interface IDs for detection
export const INTERFACE_IDS = {
  ERC721: "0x80ac58cd",
  ERC1155: "0xd9b67a26",
} as const;

export const ERC165_ABI = [
  "function supportsInterface(bytes4 interfaceId) view returns (bool)",
];

// ─── Discovered Token Types ───────────────────────────────────────────────────
export interface DiscoveredERC20 {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceRaw: bigint;
}

export interface DiscoveredNFT {
  contractAddress: string;
  tokenId: string;
  name: string;
  symbol: string;
  tokenURI: string;
  type: 'ERC721' | 'ERC1155';
}

// ─── Core Discovery Functions ────────────────────────────────────────────────

/**
 * Discovers ERC-20 tokens held by `ownerAddress` by scanning Transfer event logs.
 * Scans the last `blockRange` blocks. The same strategy MetaMask uses.
 */
export async function discoverERC20Tokens(
  provider: ethers.Provider,
  ownerAddress: string,
  blockRange: number = 10000
): Promise<DiscoveredERC20[]> {
  const latestBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latestBlock - blockRange);

  // ERC-20 Transfer topic: keccak256("Transfer(address,address,uint256)")
  const transferTopic = ethers.id("Transfer(address,address,uint256)");
  const paddedAddress = ethers.zeroPadValue(ownerAddress.toLowerCase(), 32);

  // Query for all Transfer events TO this address
  const filter = {
    fromBlock,
    toBlock: 'latest',
    topics: [transferTopic, null, paddedAddress],
  };

  let logs: ethers.Log[] = [];
  try {
    logs = await provider.getLogs(filter as any);
  } catch (e) {
    console.warn("[TOKEN-DISCOVERY] Log scan failed — provider may not support eth_getLogs with this range:", e);
    return [];
  }

  // Deduplicate contract addresses
  const contractAddresses = [...new Set(logs.map(l => l.address.toLowerCase()))];

  const discovered: DiscoveredERC20[] = [];

  for (const contractAddress of contractAddresses) {
    try {
      const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);

      // Fetch all metadata in parallel
      const [name, symbol, decimals, rawBalance] = await Promise.all([
        contract.name().catch(() => 'Unknown'),
        contract.symbol().catch(() => '???'),
        contract.decimals().catch(() => 18),
        contract.balanceOf(ownerAddress).catch(() => 0n),
      ]);

      // Only include tokens with a non-zero balance
      if ((rawBalance as bigint) > 0n) {
        discovered.push({
          contractAddress,
          name: String(name),
          symbol: String(symbol),
          decimals: Number(decimals),
          balance: ethers.formatUnits(rawBalance as bigint, Number(decimals)),
          balanceRaw: rawBalance as bigint,
        });
      }
    } catch (e) {
      // Not a valid ERC-20 — skip silently
    }
  }

  return discovered.sort((a, b) => Number(b.balanceRaw - a.balanceRaw));
}

/**
 * Discovers NFTs (ERC-721) by scanning Transfer events.
 * Verifies the current owner is still `ownerAddress` before including.
 */
export async function discoverERC721NFTs(
  provider: ethers.Provider,
  ownerAddress: string,
  blockRange: number = 50000
): Promise<DiscoveredNFT[]> {
  const latestBlock = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latestBlock - blockRange);

  // ERC-721 Transfer is same signature but tokenId is indexed (3rd param)
  const transferTopic = ethers.id("Transfer(address,address,uint256)");
  const paddedAddress = ethers.zeroPadValue(ownerAddress.toLowerCase(), 32);

  const filter = {
    fromBlock,
    toBlock: 'latest',
    topics: [transferTopic, null, paddedAddress],
  };

  let logs: ethers.Log[] = [];
  try {
    logs = await provider.getLogs(filter as any);
  } catch (e) {
    console.warn("[TOKEN-DISCOVERY] NFT log scan failed:", e);
    return [];
  }

  const nfts: DiscoveredNFT[] = [];
  const seen = new Set<string>();

  for (const log of logs) {
    const tokenIdHex = log.topics[3];
    if (!tokenIdHex) continue;
    const tokenId = BigInt(tokenIdHex).toString();
    const key = `${log.address.toLowerCase()}-${tokenId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    try {
      const contract = new ethers.Contract(log.address, ERC721_ABI, provider);

      // Verify current owner
      const currentOwner = await contract.ownerOf(BigInt(tokenId)).catch(() => null);
      if (!currentOwner || currentOwner.toLowerCase() !== ownerAddress.toLowerCase()) continue;

      const [name, symbol, tokenURI] = await Promise.all([
        contract.name().catch(() => 'Unknown'),
        contract.symbol().catch(() => '???'),
        contract.tokenURI(BigInt(tokenId)).catch(() => ''),
      ]);

      nfts.push({
        contractAddress: log.address,
        tokenId,
        name: String(name),
        symbol: String(symbol),
        tokenURI: String(tokenURI),
        type: 'ERC721',
      });
    } catch {
      // Not a valid ERC-721 at this address
    }
  }

  return nfts;
}

/**
 * Validates and imports a custom ERC-20 token by reading its on-chain metadata.
 * Equivalent to MetaMask's "Import Token" flow.
 */
export async function importCustomToken(
  provider: ethers.Provider,
  contractAddress: string,
  ownerAddress: string
): Promise<DiscoveredERC20> {
  if (!ethers.isAddress(contractAddress)) {
    throw new Error(`Invalid contract address: ${contractAddress}`);
  }

  const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);

  const [name, symbol, decimals, rawBalance] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.balanceOf(ownerAddress),
  ]);

  return {
    contractAddress: contractAddress.toLowerCase(),
    name: String(name),
    symbol: String(symbol),
    decimals: Number(decimals),
    balance: ethers.formatUnits(rawBalance as bigint, Number(decimals)),
    balanceRaw: rawBalance as bigint,
  };
}
