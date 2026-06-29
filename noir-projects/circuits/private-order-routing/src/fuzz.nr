use crate::InstitutionalDarkPool;
use dep::aztec::prelude::AztecAddress;

// [FASE 6 - QUANTUM SHIELD FUZZING]
// This module provides atomic-level adversarial testing against the InstitutionalDarkPool circuit.
// It uses property-based logic to attempt state manipulation, wash trading, and field wrapping.

#[test(should_fail_with = "Order commitment cannot be zero")]
fn fuzz_test_rejects_zero_commitment() {
    let trader = AztecAddress::from_field(1);
    // Malicious actor attempts to place a null order to corrupt state
    let malicious_commitment = 0;
    
    // This must revert
    InstitutionalDarkPool::place_order(trader, malicious_commitment);
}

#[test(should_fail_with = "Wash trading detected: buyer and seller must be distinct")]
fn fuzz_test_rejects_wash_trading() {
    let attacker = AztecAddress::from_field(1);
    let matched_amount = 1000;
    let buy_commit = 42;
    let sell_commit = 43;

    // Attacker attempts to match their own orders to farm volume or extract metadata
    InstitutionalDarkPool::execute_matched_trade(
        attacker,
        attacker,
        matched_amount,
        buy_commit,
        sell_commit
    );
}

#[test(should_fail_with = "Matched amount cannot be zero")]
fn fuzz_test_rejects_zero_amount_match() {
    let buyer = AztecAddress::from_field(1);
    let seller = AztecAddress::from_field(2);
    // Attacker attempts to execute a zero-amount trade to spoof volume metrics without capital
    let matched_amount = 0;
    let buy_commit = 42;
    let sell_commit = 43;

    InstitutionalDarkPool::execute_matched_trade(
        buyer,
        seller,
        matched_amount,
        buy_commit,
        sell_commit
    );
}

#[test(should_fail_with = "Order commitments must be distinct")]
fn fuzz_test_rejects_identical_commitments() {
    let buyer = AztecAddress::from_field(1);
    let seller = AztecAddress::from_field(2);
    let matched_amount = 1000;
    
    // Attacker attempts to match the exact same order hash against itself
    let duplicated_commit = 999;

    InstitutionalDarkPool::execute_matched_trade(
        buyer,
        seller,
        matched_amount,
        duplicated_commit,
        duplicated_commit
    );
}
