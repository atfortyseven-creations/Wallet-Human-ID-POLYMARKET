// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Phase 6: Cross-Chain System & Deployment
// EVM L1 Oracle to bridge public mempool data to Aztec L2

interface IAztecInbox {
    function sendL2Message(bytes32 recipient, bytes32 content) external returns (bytes32);
}

contract AztecOracleL1 {
    address public aztecInboxAddress;
    
    event IntelligenceRouted(bytes32 indexed l2Recipient, bytes32 indexed contentHash);
    
    constructor(address _aztecInbox) {
        aztecInboxAddress = _aztecInbox;
    }
    
    // Bridge verified Whale alerts into the Private Shielded Pool
    function pushWhaleAlertToAztec(bytes32 l2Recipient, bytes32 txDataHash) external {
        // Enforce System rules
        require(txDataHash != bytes32(0), "Invalid Active Data");
        
        bytes32 messageHash = IAztecInbox(aztecInboxAddress).sendL2Message(
            l2Recipient,
            txDataHash
        );
        
        emit IntelligenceRouted(l2Recipient, messageHash);
    }
}
