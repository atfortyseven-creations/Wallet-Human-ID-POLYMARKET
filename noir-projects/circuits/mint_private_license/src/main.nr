// Humanity Ledger - ZK-KYC Smart Contract
// Circuit: mint_private_license
// Framework: Aztec Noir (aztec_nr)
// Version: 1.0.0 (Quantum-Grade Precision)

contract PrivateLicense {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::protocol_types::traits::{Serialize, Deserialize};
    use dep::aztec::context::{PrivateContext, Context};
    use dep::aztec::state_vars::{Map, PrivateSet};
    use dep::value_note::value_note::ValueNote;
    use std::schnorr::verify_signature;
    use std::hash::pedersen_hash;

    // 1. STATE DEFINITION
    // The contract uses a PrivateSet to store individual private License Notes.
    // The user will generate a note in their PXE (Private Execution Environment).
    #[aztec(storage)]
    struct Storage {
        // A set of private notes mapped to the user's address. 
        // Note: KYC tier is encoded within the custom struct, but for simplicity here we map 
        // to Aztec's native ValueNote to represent the "tier value" (e.g., 1 = Standard, 2 = Institutional).
        licenses: Map<AztecAddress, PrivateSet<ValueNote>>,
    }

    // 2. HARDCODED COMPLIANCE AUTHORITY
    // Public Key (x, y) of Humanity Ledger S.L.'s Sumsub Verification backend.
    // In a production scenario, this key could be updatable via an Admin pattern.
    // For absolute security, we lock it at compile-time to prevent key-hijacking.
    global COMPLIANCE_PUB_KEY_X: Field = 0x2287abdfbd18c3b1ea278f219fdfb74950eef5f3d3d6dd2e01dfd60e7e00f91a;
    global COMPLIANCE_PUB_KEY_Y: Field = 0x1174fbbf4f04c632ea51efdfb74950eef5f3d3d6dd2e01dfd60e7e00f91abced;

    // 3. MINT PRIVATE LICENSE (KYC INITIALIZATION)
    // This private function is invoked by the user to claim their ZK-KYC license.
    // The user provides a payload signed by the Compliance Authority using Schnorr.
    #[aztec(private)]
    fn mint_private_license(
        user: AztecAddress,
        kyc_tier: Field,
        // Schnorr signature (r, s) array
        signature: [u8; 64]
    ) {
        // --- A. CRYPTOGRAPHIC VERIFICATION (SCHNORR) ---
        
        // Construct the message payload that the server signed.
        // It strictly binds the user's Aztec address and the approved KYC tier.
        let payload_hash = pedersen_hash([user.to_field(), kyc_tier], 0);
        let message_bytes = payload_hash.to_be_bytes(32);

        // Verify the Schnorr signature against the hardcoded Humanity Ledger Compliance Key.
        // If the signature is invalid, the Barretenberg prover constraint system halts.
        let is_valid = verify_signature(
            COMPLIANCE_PUB_KEY_X,
            COMPLIANCE_PUB_KEY_Y,
            signature,
            message_bytes
        );
        assert(is_valid == true, "INVALID_COMPLIANCE_SIGNATURE");

        // --- B. DETERMINISTIC ANTI-DUPLICATION NULLIFIER ---
        
        // To ensure the user cannot mint multiple licenses and bypass tier logic,
        // we emit a deterministic nullifier bounded to their address and this specific contract action.
        // Once this nullifier is added to the global Aztec nullifier tree, any subsequent
        // attempt by the same user to mint a license will fail at the sequencer level.
        let license_nullifier = pedersen_hash([
            context.this_address().to_field(), 
            user.to_field(), 
            1 // Constant distinguishing the 'mint' action
        ], 0);
        
        context.push_new_nullifier(license_nullifier, 0);

        // --- C. STATE MUTATION (PRIVATE EXECUTION) ---
        
        // Insert a new private Note into the user's Note Commitment Tree.
        // The value represents the KYC Tier.
        let mut note = ValueNote::new(kyc_tier, user);
        storage.licenses.at(user).insert(&mut note, true);
    }

    // 4. VERIFY LICENSE (COMPOSABILITY)
    // This function can be called internally by other contracts (e.g. QDs Token Transfer)
    // to assert that a user holds a valid KYC license of at least the required tier.
    #[aztec(private)]
    fn verify_license(user: AztecAddress, min_required_tier: Field) {
        // Retrieve the user's private notes
        let notes = storage.licenses.at(user).get_notes();
        
        // Ensure they have at least one valid license
        assert(notes.len() > 0, "NO_VALID_KYC_LICENSE_FOUND");
        
        // We evaluate the first valid note
        let user_tier = notes[0].unwrap_unchecked().value;
        
        // Enforce threshold constraint (e.g. if transferring > 1000 QDs, min_required_tier = 2)
        assert(user_tier as u64 >= min_required_tier as u64, "INSUFFICIENT_KYC_TIER");
    }
}
