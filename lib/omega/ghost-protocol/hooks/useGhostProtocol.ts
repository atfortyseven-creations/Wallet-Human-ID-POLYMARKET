import { useState, useCallback } from 'react';

export type GhostProof = {
    proof: any;
    publicSignals: any;
};

export const useGhostProtocol = () => {
    const [isProving, setIsProving] = useState(false);
    const [proofData, setProofData] = useState<GhostProof | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateHumanityProof = useCallback(async (score: number, threshold: number = 50) => {
        setIsProving(true);
        setError(null);
        try {
            // "God-Mode": In a real implementation, these artifacts would be fetched from IPFS or a CDN edge.
            // For now, we assume they are in the public directory.
            const wasmPath = "/omega/ghost-protocol/proveHumanity.wasm";
            const zkeyPath = "/omega/ghost-protocol/circuit_final.zkey";

            const randomArray = new Uint32Array(1);
            window.crypto.getRandomValues(randomArray);
            const secret = BigInt(randomArray[0]); // Generating authentic cryptographic user secret

            // DYNAMIC IMPORT: Lazy load the heavy math library (snarkjs)
            // @ts-ignore
            const { groth16 } = await import('snarkjs');

            const { proof, publicSignals } = await groth16.fullProve(
                { score, secret, threshold },
                wasmPath,
                zkeyPath
            );

            console.log(" Ghost Protocol: Proof Generated", proof);
            setProofData({ proof, publicSignals });
            return { proof, publicSignals };
        } catch (err: any) {
            console.error(" Ghost Protocol: Proving Failed", err);
            setError(err.message || "Proving failed");
            throw err;
        } finally {
            setIsProving(false);
        }
    }, []);

    const verifyProofLocal = useCallback(async (proof: any, publicSignals: any) => {
        // This usually happens on-chain, but here's a client-side verification helper
        const vKeyPath = "/omega/ghost-protocol/verification_key.json";
        const vKey = await fetch(vKeyPath).then(res => res.json());

        // @ts-ignore
        const { groth16 } = await import('snarkjs');
        
        const res = await groth16.verify(vKey, publicSignals, proof);
        return res;
    }, []);

    return {
        generateHumanityProof,
        verifyProofLocal,
        proofData,
        isProving,
        error
    };
};

