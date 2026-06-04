// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title WhaleAVS (Actively Validated Service)
 * @dev Eigenlayer-compatible orchestrator for decentralized Z-score thermodynamic validation.
 * Operators stake assets to become signal verifiers. Byzantine operators are slashed.
 */
contract WhaleAVS is Ownable2Step, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    uint256 public constant MIN_STAKE = 10_000 * 10**18; // 10,000 Tokens required
    uint256 public constant SLASH_PENALTY_BPS = 2000; // 20% slash for false positives

    struct Operator {
        bool isRegistered;
        uint256 stakedAmount;
        uint256 successfulVerifications;
        uint256 slashedCount;
    }

    mapping(address => Operator) public operators;
    address[] public activeOperatorsList;

    struct SignalTask {
        bytes32 txHash;
        uint256 zScore; // Scaled by 1e18
        uint256 timestamp;
        uint256 approvals;
        uint256 rejections;
        bool resolved;
        mapping(address => bool) hasVoted;
    }

    mapping(bytes32 => SignalTask) public signalTasks;

    event OperatorRegistered(address indexed operator, uint256 amount);
    event OperatorSlashed(address indexed operator, uint256 amountSlashed, bytes32 indexed taskHash);
    event SignalTaskCreated(bytes32 indexed txHash, uint256 zScore);
    event SignalResolved(bytes32 indexed txHash, bool confirmed);

    constructor(address _stakingToken) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token");
        stakingToken = IERC20(_stakingToken);
    }

    /**
     * @dev Register as an AVS Operator by staking the required minimum.
     */
    function registerOperator(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_STAKE, "Insufficient stake");
        require(!operators[msg.sender].isRegistered, "Already registered");

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        operators[msg.sender] = Operator({
            isRegistered: true,
            stakedAmount: amount,
            successfulVerifications: 0,
            slashedCount: 0
        });

        activeOperatorsList.push(msg.sender);
        emit OperatorRegistered(msg.sender, amount);
    }

    /**
     * @dev Core Node Engine pushes a new thermodynamic signal task for AVS consensus.
     */
    function createSignalTask(bytes32 txHash, uint256 zScore) external onlyOwner whenNotPaused {
        require(signalTasks[txHash].timestamp == 0, "Task already exists");

        SignalTask storage task = signalTasks[txHash];
        task.txHash = txHash;
        task.zScore = zScore;
        task.timestamp = block.timestamp;

        emit SignalTaskCreated(txHash, zScore);
    }

    /**
     * @dev Operators attest to the validity of the Z-score using their local node calculation.
     */
    function attestSignal(bytes32 txHash, bool isValid) external nonReentrant whenNotPaused {
        Operator storage op = operators[msg.sender];
        require(op.isRegistered, "Not a registered operator");
        require(op.stakedAmount >= MIN_STAKE, "Stake fell below minimum");
        
        SignalTask storage task = signalTasks[txHash];
        require(task.timestamp != 0, "Task does not exist");
        require(!task.resolved, "Task already resolved");
        require(!task.hasVoted[msg.sender], "Already attested");

        task.hasVoted[msg.sender] = true;
        op.successfulVerifications += 1; // Track for System Hall of Fame

        if (isValid) {
            task.approvals += 1;
        } else {
            task.rejections += 1;
        }

        // Resolving locally if consensus threshold met (simplified for example: 3 approvals)
        if (task.approvals >= 3) {
            task.resolved = true;
            emit SignalResolved(txHash, true);
        } else if (task.rejections >= 3) {
            task.resolved = true;
            // False positive detected by consensus. Slash the original proposer or approve slashing.
            emit SignalResolved(txHash, false);
        }
    }

    /**
     * @dev Slashes a Byzantine operator who certified a mathematically invalid state.
     * Controlled by System Governance.
     */
    function slashOperator(address operator, bytes32 taskHash) external onlyOwner {
        Operator storage op = operators[operator];
        require(op.isRegistered, "Not an operator");
        
        uint256 penalty = (op.stakedAmount * SLASH_PENALTY_BPS) / 10000;
        op.stakedAmount -= penalty;
        op.slashedCount += 1;

        // Burn the slashed tokens or send to treasury (sending to zero address for deflation)
        stakingToken.safeTransfer(address(0xdead), penalty);

        emit OperatorSlashed(operator, penalty, taskHash);
    }

    /**
     * @dev Emergency pause all AVS consensus.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause AVS consensus.
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
