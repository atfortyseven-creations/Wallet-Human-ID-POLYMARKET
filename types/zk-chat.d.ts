export type PostCoreSecurity<T extends number = 512> = `ML-KEM-${T}` & { readonly __brand: unique symbol };
export type UtilityFunction = (lambda: number, latency: number) => number;

interface ZKStatement {
  institution: string;
  jurisdiction: 'Singapore' | 'EU' | 'MAS';
  AUM_threshold: bigint;
  whale_score: number;
  last_seen_zk: number;
}

export interface ZK_Payload {
  proof: Uint8Array;
  crs: Uint8Array;
  statement: ZKStatement;
  pi: string;
  readonly __onChainSettlement: 'Arbitrum/Nitro' | 'zk-rollup-dedicated';
  readonly utility: UtilityFunction;
}

export type ZKMessage<T = ZK_Payload> = T & {
  readonly __security: PostCoreSecurity;
  readonly differentialPrivacyEpsilon: 0.0001;
};
