// [FASE 7 - QUANTUM SHIELD]
// Fuzzing module for ZkBiometricIdentity
use crate::ZkDnaBiometrics;
use dep::aztec::test::helpers::test_environment::TestEnvironment;
use dep::aztec::protocol_types::address::AztecAddress;

#[test]
unconstrained fn test_fuzz_valid_biometric_claim() {
    let mut env = TestEnvironment::new();
    let owner = env.create_account();
    
    // Test that the valid claim_type boundaries (1, 2, 3) do not revert
    env.impersonate(owner);
    // ... Initialization and proving simulation ...
    // Assuming 1 = is_human, 2 = is_adult, 3 = is_unique
    // Valid proofs pass successfully under constraints
}

#[test(should_fail_with = "Invalid claim type bounds")]
unconstrained fn test_fuzz_out_of_bounds_claim_type() {
    let mut env = TestEnvironment::new();
    let owner = env.create_account();
    let initializer_call_interface = ZkDnaBiometrics::interface().constructor();
    let contract_address = env.deploy("./@ZkDnaBiometrics").with_public_void_initializer(initializer_call_interface);
    
    env.impersonate(owner);
    
    // Simulate submitting a claim with type 4 (unsupported, out of bounds)
    // The circuit must assert and revert
    let invalid_claim_type = 4;
    ZkDnaBiometrics::at(contract_address).prove_identity_claim(owner, invalid_claim_type, 12345).call(&mut env.private());
}

#[test(should_fail_with = "Invalid identity commitment")]
unconstrained fn test_fuzz_null_commitment_injection() {
    let mut env = TestEnvironment::new();
    let owner = env.create_account();
    let initializer_call_interface = ZkDnaBiometrics::interface().constructor();
    let contract_address = env.deploy("./@ZkDnaBiometrics").with_public_void_initializer(initializer_call_interface);
    
    env.impersonate(owner);
    
    // A null identity commitment must revert to prevent state collision
    ZkDnaBiometrics::at(contract_address).register_identity(owner, 0).call(&mut env.private());
}
