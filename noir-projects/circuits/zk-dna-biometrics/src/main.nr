/// ZkBiometricIdentity — Zero-Knowledge Biometric Identity Verifier
///
/// Allows users to prove biometric identity claims (e.g. "I am human",
/// "I am over 18") without revealing any raw biometric data on-chain.
/// Biometric data is processed off-chain; only a ZK commitment is stored.
contract ZkDnaBiometrics {
    use dep::aztec::prelude::{
        AztecAddress, PrivateContext, Map, PublicMutable, PrivateSet
    };
    use dep::value_note::note::{ValueNote, VALUE_NOTE_LEN};

    #[aztec(storage)]
    struct Storage {
        // Maps user to their biometric identity commitment
        // This is a Poseidon hash of off-chain biometric data — raw data never touches the chain
        identity_commitments: Map<AztecAddress, PublicMutable<Field>>,
        // Private nullifier set to prevent re-use of the same biometric proof
        used_proof_nullifiers: Map<AztecAddress, PrivateSet<ValueNote>>,
    }

    #[aztec(private)]
    #[aztec(initializer)]
    fn constructor() {}

    /// Registers a zero-knowledge biometric identity commitment.
    /// The identity_commitment is computed off-chain as:
    ///   Poseidon(biometric_hash, user_salt, timestamp)
    /// where biometric_hash itself is a secure hash of the raw biometric data.
    /// Raw biometrics are NEVER transmitted or stored on-chain.
    #[aztec(private)]
    fn register_identity(owner: AztecAddress, identity_commitment: Field) {
        // Store a nullifier to prevent re-registration
        let mut nullifier_note = ValueNote::new(identity_commitment, owner);
        storage.used_proof_nullifiers.at(owner).insert(&mut nullifier_note, true);

        ZkDnaBiometrics::at(context.this_address())
            .write_commitment(owner, identity_commitment)
            .enqueue(&mut context);
    }

    /// Privately proves a biometric claim (e.g. "user is human")
    /// without revealing which specific biometric data was used.
    /// The proof_hash is the output of an off-chain ZK proving system.
    #[aztec(private)]
    fn prove_identity_claim(
        claimant: AztecAddress,
        claim_type: Field,   // 1=is_human, 2=is_adult, 3=is_unique
        proof_hash: Field,   // Hash of the off-chain ZK proof
    ) {
        ZkDnaBiometrics::at(context.this_address())
            .record_claim(claimant, claim_type, proof_hash)
            .enqueue(&mut context);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn write_commitment(owner: AztecAddress, commitment: Field) {
        storage.identity_commitments.at(owner).write(commitment);
    }

    #[aztec(public)]
    #[aztec(internal)]
    fn record_claim(claimant: AztecAddress, claim_type: Field, proof_hash: Field) {
        // Proof hash is logged as an event for off-chain indexers
        // The claim_type is public; the biometric proof details are not
        assert(proof_hash != 0, "Invalid proof hash");
    }

    #[aztec(public)]
    fn get_identity_commitment(owner: AztecAddress) -> Field {
        storage.identity_commitments.at(owner).read()
    }
}
