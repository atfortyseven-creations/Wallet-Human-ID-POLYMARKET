pragma circom 2.1.0;

// 
// HumanDefi - System Identity Circuit
// Version: 2.0.0  PLONK-compatible, Poseidon-native
// Purpose: Zero-Knowledge proof of humanity without revealing score
//
// Architecture:
//   - Private: score (numerical WorldID/humanity score), secret (random salt)
//   - Public:  threshold (minimum score to pass)
//   - Output:  isHuman (1 if system, 0 if bot), nullifierHash (anti-replay)
//   - Bonus:   tierLevel (0=Standard, 1=Premium, 2=APEX) for tiered access
// 

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/bitify.circom";

// 
// Template: TierClassifier
// Converts a continuous score into a discrete tier (0, 1, 2)
// 
template TierClassifier() {
    signal input score;
    signal output tier; // 0 = Excluded, 1 = Standard, 2 = APEX

    // Thresholds: 50 for Standard, 80 for APEX
    component gtApex = GreaterThan(64);
    gtApex.in[0] <== score;
    gtApex.in[1] <== 79; // score > 79  APEX

    component gtStandard = GreaterThan(64);
    gtStandard.in[0] <== score;
    gtStandard.in[1] <== 49; // score > 49  Standard

    // Tier = gtApex * 2 + (gtStandard - gtApex)
    // This yields: 0 if below both, 1 if standard only, 2 if apex
    tier <== gtApex.out * 2 + (gtStandard.out - gtApex.out);
}

// 
// Template: TimestampBound
// Commits to a timestamp to create time-scoped proofs (anti-replay)
// 
template TimestampBound() {
    signal input secret;
    signal input epochTimestamp; // Unix epoch div 86400 (day granularity)
    signal output epochCommitment;

    component bind = Poseidon(2);
    bind.inputs[0] <== secret;
    bind.inputs[1] <== epochTimestamp;
    epochCommitment <== bind.out;
}

// 
// Main Template: HumanityCheck (Full System Identity Circuit)
// 
template HumanityCheck() {
    //  Private Signals 
    signal input score;          // Humanity score (0-100), hidden from verifier
    signal input secret;         // Random salt, prevents rainbow table attacks
    signal input epochTimestamp; // Day index for time-bounded nullifiers

    //  Public Signals 
    signal input threshold;      // Minimum score (publicly known cutoff)

    //  Outputs 
    signal output isHuman;       // 1 if score > threshold, else 0
    signal output nullifierHash; // Unique, deterministic, privacy-preserving ID
    signal output tier;          // 0=Excluded, 1=Standard, 2=APEX
    signal output epochCommit;   // Day-scoped commitment for time-bounded access

    //  Step 1: Humanity Gate 
    component gt = GreaterThan(64);
    gt.in[0] <== score;
    gt.in[1] <== threshold;
    isHuman <== gt.out;

    //  Step 2: Tier Classification 
    component classifier = TierClassifier();
    classifier.score <== score;
    tier <== classifier.tier;

    //  Step 3: Nullifier (Poseidon 3-input) 
    // Binding: (secret, score_rounded_bin, epoch) prevents cross-epoch replay
    // while preserving score privacy (we quantize score to 10s to avoid exact leak)
    component quantizer = Num2Bits(7); // Extracts bits from score
    quantizer.in <== score;

    // Combine MSBs of score with secret for quantized commit (not revealing exact score)
    component nullifier = Poseidon(3);
    nullifier.inputs[0] <== secret;
    nullifier.inputs[1] <== quantizer.out[6] * 64 + quantizer.out[5] * 32 + quantizer.out[4] * 16; // top 3 bits only
    nullifier.inputs[2] <== epochTimestamp;
    nullifierHash <== nullifier.out;

    //  Step 4: Epoch Commitment 
    component timeBound = TimestampBound();
    timeBound.secret <== secret;
    timeBound.epochTimestamp <== epochTimestamp;
    epochCommit <== timeBound.epochCommitment;

    //  Constraint: Force fail if not human (strict mode) 
    // When deployed with this constraint, the prover CANNOT generate a
    // valid proof for isHuman=0. The circuit itself becomes the gate.
    // Comment out for flexible proofs where verifier handles rejection.
    // isHuman === 1;
}

component main {public [threshold]} = HumanityCheck();

