// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// "God-Mode" Stub for The Ascension
// The mechanism to burn the keys and free the protocol.

contract Ascension is Ownable(msg.sender) {
    uint256 public constant ASCENSION_THRESHOLD = 10_000_000;
    uint256 public activeCitizenCount;
    
    address[] public systemsToLiberate;

    event ProtocolAscended(uint256 timestamp);

    function registerSystem(address system) external onlyOwner {
        systemsToLiberate.push(system);
    }

    function updateCitizenCount(uint256 count) external onlyOwner {
        activeCitizenCount = count;
        checkAscension();
    }

    /**
     * @notice Triggers the end of the Founding Era.
     */
    function checkAscension() public {
        if (activeCitizenCount >= ASCENSION_THRESHOLD) {
            _ascend();
        }
    }

    function _ascend() internal {
        // Renounce ownership of all registered systems
        for (uint256 i = 0; i < systemsToLiberate.length; i++) {
            Ownable(systemsToLiberate[i]).renounceOwnership();
        }
        
        // Burn own keys
        renounceOwnership();
        
        emit ProtocolAscended(block.timestamp);
    }
}

