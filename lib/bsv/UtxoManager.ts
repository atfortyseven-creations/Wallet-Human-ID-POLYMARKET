import axios from 'axios';
import { Transaction, P2PKH } from '@bsv/sdk';

export interface UTXO {
  txid: string;
  vout: number;
  value: number;
  script: string;
}

/**
 * UTXO MANAGER (Phase 35)
 * 100% Real Code for BSV Mainnet Orchestration.
 */
export class UtxoManager {
  private baseUrl = 'https://api.whatsonchain.com/v1/bsv/main';

  /**
   * Fetches unspent transaction outputs for a given address.
   */
  public async getUtxos(address: string): Promise<UTXO[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/address/${address}/unspent`, { timeout: 10000 });
      return response.data.map((u: any) => ({
        txid: u.tx_hash,
        vout: u.tx_pos,
        value: u.value,
        script: '' // Scripts are fetched per-UTXO if needed for complex scripts, but P2PKH is standard
      }));
    } catch (e) {
      console.error('UtxoManager: Failed to fetch UTXOs', e);
      return [];
    }
  }

  /**
   * Fetches the raw transaction hex by TXID.
   */
  public async getRawTx(txid: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/tx/${txid}/hex`, { timeout: 10000 });
      return response.data;
    } catch (e) {
      console.error(`UtxoManager: Failed to fetch Raw TX for ${txid}`, e);
      throw new Error(`Failed to fetch source transaction ${txid}`);
    }
  }

  /**
   * Broadcasts a raw transaction hex to the mainnet.
   */
  public async broadcastTransaction(rawTx: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/tx/raw`, {
        txhex: rawTx
      }, { timeout: 15000 });
      return response.data; // txid
    } catch (e: any) {
      console.error('UtxoManager: Broadcast failed', e.response?.data || e.message);
      throw new Error(e.response?.data || 'Failed to broadcast transaction to Mainnet.');
    }
  }

  /**
   * Selects optimal UTXOs for a transaction of a given amount.
   * Logic: FIFO (First In First Out) for simplicity, or "Smallest First" for consolidation.
   */
  public selectUtxos(utxos: UTXO[], amount: number, feeRate: number = 1): UTXO[] {
    let selected: UTXO[] = [];
    let currentTotal = 0;
    
    // Sort by value (Smallest First) to consolidate dust
    const sorted = [...utxos].sort((a, b) => a.value - b.value);

    for (const utxo of sorted) {
      selected.push(utxo);
      currentTotal += utxo.value;
      if (currentTotal >= amount + (selected.length * 148 + 34) * feeRate) {
        break;
      }
    }

    if (currentTotal < amount) {
      throw new Error('Insufficient Funds for this magnitude.');
    }

    return selected;
  }
}
