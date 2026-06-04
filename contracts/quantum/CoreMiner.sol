// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

interface ICoreDots {
    function mint(address to, uint256 amount) external;
    function totalSupply() external view returns (uint256);
    function MAX_SUPPLY() external view returns (uint256);
}

/**
 * @title CoreMiner
 * @dev Replicates the Proof of Work (PoW) consensus for CoreDots.
 * Requires actual CPU hash calculation matching a dynamically adjusting difficulty.
 */
contract CoreMiner is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    ICoreDots public immutable coreDots;

    bytes32 public currentChallenge;
    uint256 public targetDifficulty; // Target threshold for the hash
    uint256 public currentReward; // QDs rewarded per solved block
    uint256 public blocksMined;
    
    // Difficulty adjustment parameters
    uint256 public lastAdjustmentBlock;
    uint256 public lastAdjustmentTime;
    uint256 public constant ADJUSTMENT_INTERVAL = 100; // Adjust difficulty every 100 blocks
    uint256 public constant TARGET_TIME_PER_BLOCK = 600; // 10 minutes per block target

    event BlockMined(address indexed miner, uint256 reward, bytes32 newChallenge);
    event DifficultyAdjusted(uint256 newDifficulty);

    constructor(address _qdAddress, uint256 _initialDifficulty, uint256 _initialReward) {
        require(_qdAddress != address(0), "Invalid token address");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        coreDots = ICoreDots(_qdAddress);
        currentChallenge = blockhash(block.number - 1);
        targetDifficulty = _initialDifficulty;
        currentReward = _initialReward;
        
        lastAdjustmentBlock = 0;
        lastAdjustmentTime = block.timestamp;
    }

    /**
     * @dev The core mining function. Users must submit a nonce that, when hashed
     * with the currentChallenge and their address, results in a value LESS than targetDifficulty.
     */
    function mine(uint256 nonce) external {
        // Calculate the hash using SHA-256 to match WebWorker crypto.subtle.digest natively
        bytes32 hash = sha256(abi.encodePacked(currentChallenge, msg.sender, nonce));

        // Verify Proof of Work: Check if the numerical value of the hash is less than the difficulty target
        require(uint256(hash) <= targetDifficulty, "CoreMiner: Invalid Proof of Work");

        // Update state BEFORE external call (CEI Pattern to prevent reentrancy)
        blocksMined++;
        currentChallenge = hash;

        emit BlockMined(msg.sender, currentReward, currentChallenge);

        // Adjust difficulty
        _adjustDifficulty();

        // Calculate maximum allowed reward to prevent Hard Cap Revert (21M Limit boundary check)
        uint256 currentSupply = coreDots.totalSupply();
        uint256 maxSupply = coreDots.MAX_SUPPLY();
        
        uint256 rewardToMint = currentReward;
        if (currentSupply + rewardToMint > maxSupply) {
            rewardToMint = maxSupply - currentSupply;
        }

        // External Call LAST
        if (rewardToMint > 0) {
            coreDots.mint(msg.sender, rewardToMint);
        }
    }

    function _adjustDifficulty() internal {
        if (blocksMined - lastAdjustmentBlock >= ADJUSTMENT_INTERVAL) {
            uint256 timePassed = block.timestamp - lastAdjustmentTime;
            uint256 expectedTime = ADJUSTMENT_INTERVAL * TARGET_TIME_PER_BLOCK;

            // Cap the adjustment to prevent massive swings (max 4x or min 0.25x)
            if (timePassed < expectedTime / 4) {
                timePassed = expectedTime / 4;
            } else if (timePassed > expectedTime * 4) {
                timePassed = expectedTime * 4;
            }

            // Calculate new target (lower target = higher difficulty)
            uint256 newTarget = (targetDifficulty * timePassed) / expectedTime;
            
            // Critical Fix: Prevent targetDifficulty from collapsing to zero (which would permanently halt mining)
            if (newTarget == 0) {
                newTarget = 1;
            }

            targetDifficulty = newTarget;
            lastAdjustmentBlock = blocksMined;
            lastAdjustmentTime = block.timestamp;

            emit DifficultyAdjusted(targetDifficulty);
        }
    }

    function adminSetReward(uint256 _newReward) external onlyRole(ADMIN_ROLE) {
        currentReward = _newReward;
    }
}
