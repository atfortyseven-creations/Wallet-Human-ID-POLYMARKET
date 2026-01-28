// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title HumanFiTreasury
 * @dev Protocol Treasury handling fee collection, splitting (60/40), and sovereign rewards.
 *      Implements UUPS Upgradeable pattern, Pausable, and AccessControl.
 */
contract HumanFiTreasury is 
    Initializable, 
    AccessControlUpgradeable, 
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    UUPSUpgradeable 
{
    using SafeERC20 for IERC20;

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    // Funds segregation
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SOVEREIGN_VAULT_SHARE = 4000; // 40%
    uint256 public constant OPERATIONS_SHARE = 6000;      // 60%

    // State
    uint256 public totalProcessedFees;
    uint256 public sovereignVaultBalance;
    uint256 public operationsBalance;

    // Pull Payment Logic: Mapping of User => Pending Rewards
    mapping(address => uint256) public pendingRewards;

    // Events
    event FeesDeposited(address indexed token, uint256 amount);
    event FeesDistributed(uint256 sovereignAmount, uint256 operationsAmount);
    event RewardClaimed(address indexed user, uint256 amount);
    event OperationalWithdrawal(address indexed to, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address defaultAdmin, address upgrader) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(UPGRADER_ROLE, upgrader);
        _grantRole(MANAGER_ROLE, defaultAdmin); // Initally admin manages funds
    }

    /**
     * @dev Core "Flywheel" function. Accepts fees and splits them accounting-wise.
     *      Funds stay in contract until withdrawn/claimed.
     */
    function depositFees(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Zero amount");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        uint256 sovereignPart;
        uint256 opsPart;

        unchecked {
            sovereignPart = (amount * SOVEREIGN_VAULT_SHARE) / BASIS_POINTS;
            opsPart = amount - sovereignPart; // Remainder ensures no dust loss
        }

        sovereignVaultBalance += sovereignPart;
        operationsBalance += opsPart;
        totalProcessedFees += amount;

        emit FeesDeposited(token, amount);
        emit FeesDistributed(sovereignPart, opsPart);
    }

    /**
     * @dev Assigns rewards to a specific user (Sovereign Tier).
     *      This updates their 'credit' which they must pull later.
     *      Only callable by Governance or authorized Manager.
     */
    function assignReward(address beneficiary, uint256 amount) external onlyRole(MANAGER_ROLE) whenNotPaused {
        require(sovereignVaultBalance >= amount, "Insufficient Vault funds");
        
        sovereignVaultBalance -= amount;
        pendingRewards[beneficiary] += amount;
    }

    /**
     * @dev Users call this to extract their rewards. Pull-Payment pattern avoids DoS.
     */
    function claimReward(address token) external nonReentrant whenNotPaused {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No pending rewards");

        pendingRewards[msg.sender] = 0;
        IERC20(token).safeTransfer(msg.sender, amount);
        
        emit RewardClaimed(msg.sender, amount);
    }

    /**
     * @dev Operational withdrawal for team/development.
     */
    function withdrawOperations(address token, address to, uint256 amount) external onlyRole(MANAGER_ROLE) {
        require(operationsBalance >= amount, "Insufficient Ops funds");
        
        operationsBalance -= amount;
        IERC20(token).safeTransfer(to, amount);
        
        emit OperationalWithdrawal(to, amount);
    }

    // --- Safety & Admin ---

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    // Storage Gap for future upgrades
    uint256[50] private __gap;
}
