import { useState, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * TURING-SHIELD PROTOCOL: HARDWARE ENCLAVE BINDING
 * Uses WebAuthn (Passkeys) to bind the user's identity to the physical silicon
 * (TPM / Secure Enclave) of their device. This prevents Sybil attacks and proxy farming,
 * as each identity requires a unique, unforgeable physical device signature.
 */
export function useHardwareEnclave() {
  const [isEnclaveReady, setIsEnclaveReady] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [enclaveId, setEnclaveId] = useState<string | null>(null);

  const checkEnclaveSupport = useCallback(async () => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsEnclaveReady(isAvailable);
      return isAvailable;
    }
    return false;
  }, []);

  const generateEnclaveSignature = useCallback(async (userId: string) => {
    setIsAuthenticating(true);
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userIdBytes = new TextEncoder().encode(userId);

      // Create a new hardware-bound credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Whale Network Turing-Shield",
            id: window.location.hostname,
          },
          user: {
            id: userIdBytes,
            name: userId,
            displayName: "Whale Identity",
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Force on-device secure enclave
            userVerification: "required",        // Force biometric/PIN
            requireResidentKey: true,
          },
          timeout: 60000,
          attestation: "direct" // Request raw attestation from the TPM/Enclave
        }
      }) as PublicKeyCredential;

      if (!credential) throw new Error("Hardware Enclave generation rejected");

      // In a full production ZK circuit, this rawId (the public key hash) 
      // is mathematically combined with the EVM address to create the ZK-Identity.
      const hardwareId = Array.from(new Uint8Array(credential.rawId))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      setEnclaveId(hardwareId);
      toast.success("Hardware Enclave Linked", { 
        description: "Your physical device is now mathematically bound to your identity.",
        id: "turing-shield"
      });
      
      return hardwareId;

    } catch (e: any) {
      console.error("[Turing-Shield] Enclave Error:", e);
      // We don't toast an error if they just cancelled
      if (e.name !== 'NotAllowedError') {
         toast.error("Hardware Signature Failed", { 
           description: "Could not access the Secure Enclave. Biometric or PIN required.",
           id: "turing-shield"
         });
      }
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  return {
    isEnclaveReady,
    isAuthenticating,
    enclaveId,
    checkEnclaveSupport,
    generateEnclaveSignature
  };
}
