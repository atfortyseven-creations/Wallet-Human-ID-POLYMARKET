declare module 'snarkjs' {
    export const groth16: {
        fullProve: (input: any, wasmPath: string, zkeyPath: string) => Promise<{ proof: any; publicSignals: any }>;
        verify: (vKey: any, publicSignals: any, proof: any) => Promise<boolean>;
    };
}
