// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

// "God-Mode" Stub for Dead Man's Switch.
// Ensures the project survives even if the Founder disappears.

contract DeadMansSwitch is Ownable(msg.sender) {
    uint256 public lastHeartbeat;
    uint256 public constant TIMEOUT = 30 days;
    address public daoTreasury;

    event HeartbeatPulse(uint256 timestamp);
    event EmergencyTransfer(address newOwner);

    constructor(address _dao) {
        daoTreasury = _dao;
        lastHeartbeat = block.timestamp;
    }

    /**
     * @notice The Founder calls this to prove they are alive/active.
     */
    function heartbeat() external onlyOwner {
        lastHeartbeat = block.timestamp;
        emit HeartbeatPulse(block.timestamp);
    }

    /**
     * @notice Triggered by anyone if the Founder is silent for > 30 days.
     * Transfers all rights to the DAO.
     */
    function triggerFailsafe() external {
        require(block.timestamp > lastHeartbeat + TIMEOUT, "Founder is still alive");
        
        // Transfer Ownership of THIS contract (and potentially others linked)
        _transferOwnership(daoTreasury);
        
        emit EmergencyTransfer(daoTreasury);
    }
}

