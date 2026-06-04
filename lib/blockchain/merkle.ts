import { createHash } from 'crypto';

//  System Architecture: Akashic Merkle Tree 
// Generates Cryptographic Proof-of-Inclusion for Mass Transfers.
// Ensures that no historical record in the Akashic Ledger can be altered 
// without invalidating the entire Root Hash (Zero-Trust Data Integrity).
// 

export class MerkleTree {
  private leaves: string[];
  private layers: string[][];

  constructor(dataPayloads: string[]) {
    // 1. Hash all raw payloads to form the leaf nodes
    this.leaves = dataPayloads.map(payload => this.hash(payload));
    
    // Sort leaves lexically to ensure deterministic tree generation regardless of input order
    this.leaves.sort();
    
    this.layers = [this.leaves];
    this.buildTree();
  }

  private hash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  private buildTree() {
    let currentLayer = this.leaves;
    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left; // Duplicate last if odd
        
        // Combine and hash
        const combined = [left, right].sort().join('');
        nextLayer.push(this.hash(combined));
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  public getRoot(): string {
    if (this.layers.length === 0 || this.layers[0].length === 0) return '';
    return this.layers[this.layers.length - 1][0];
  }

  public getProof(payload: string): string[] {
    const targetHash = this.hash(payload);
    let index = this.leaves.indexOf(targetHash);
    
    if (index === -1) return []; // Not in tree

    const proof: string[] = [];
    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRightNode = index % 2 === 1;
      const siblingIndex = isRightNode ? index - 1 : Math.min(index + 1, layer.length - 1);
      
      proof.push(layer[siblingIndex]);
      index = Math.floor(index / 2);
    }

    return proof;
  }

  public verifyProof(payload: string, proof: string[], root: string): boolean {
    let currentHash = this.hash(payload);

    for (const siblingHash of proof) {
      const combined = [currentHash, siblingHash].sort().join('');
      currentHash = this.hash(combined);
    }

    return currentHash === root;
  }
}
