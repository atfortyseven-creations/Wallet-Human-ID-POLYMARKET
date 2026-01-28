// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IWorldID {
    function verifyProof(
        uint256 root,
        uint256 group_id,
        uint256 signal_hash,
        uint256 nullifier_hash,
        uint256 external_nullifier_hash,
        uint256[8] calldata proof
    ) external view;
}

/**
 * @title HumanFiGovernance
 * @dev Core Governance logic with World ID verification.
 *      Refactored for Mainnet with UUPS Upgradeability and Circuit Breakers.
 */
contract HumanFiGovernance is 
    Initializable, 
    AccessControlUpgradeable, 
    PausableUpgradeable, 
    ReentrancyGuardUpgradeable, 
    UUPSUpgradeable 
{
    using SafeERC20 for IERC20;

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    IERC20 public wldToken;
    IWorldID public worldIdRouter;
    uint256 public externalNullifier;
    
    // Treasury Address for Fee Routing
    address public treasury;

    mapping(address => uint256) public votingPower;
    mapping(uint256 => bool) public nullifierHasVoted;

    event ZapExecuted(address indexed user, uint256 amount);
    event Voted(address indexed user, uint256 nullifierHash);
    event TreasuryUpdated(address newTreasury);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _wldToken,
        address _worldIdRouter,
        string memory _appId,
        address _treasury,
        address _defaultAdmin,
        address _upgrader
    ) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        wldToken = IERC20(_wldToken);
        worldIdRouter = IWorldID(_worldIdRouter);
        externalNullifier = abi.decode(abi.encodePacked(keccak256(abi.encodePacked(_appId))), (uint256));
        treasury = _treasury;

        _grantRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _grantRole(UPGRADER_ROLE, _upgrader);
        _grantRole(EMERGENCY_ROLE, _defaultAdmin); // Initially admin
    }

    /**
     * @dev Users stake WLD to gain voting power.
     *      Includes simple Compliance Check via signature (Placeholder for now, enforced via Middleware).
     */
    function zap(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        
        // Transfer WLD to this contract (Governance Staking)
        // Note: In refined model, maybe we send fee to treasury? 
        // For now, full stake stays here for Voting Power.
        wldToken.safeTransferFrom(msg.sender, address(this), amount);
        
        votingPower[msg.sender] += amount;
        emit ZapExecuted(msg.sender, amount);
    }

    /**
     * @dev Vote using World ID ZK-Proof.
     *      protected by whenNotPaused modifier (Emergency Circuit Breaker).
     */
    function voteWithWorldID(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external whenNotPaused {
        require(votingPower[msg.sender] > 0, "No skin in the game (Zap first)");
        require(!nullifierHasVoted[nullifierHash], "Already voted");

        worldIdRouter.verifyProof(
            root,
            1, // Group ID (Orb)
            1, // Signal (Proposal ID placeholder)
            nullifierHash,
            externalNullifier,
            proof
        );

        nullifierHasVoted[nullifierHash] = true;
        emit Voted(msg.sender, nullifierHash);
    }

    /**
     * @dev Emergency Withdrawal - "Solo Salida".
     *      Even when Paused, users should be able to withdraw their stake eventually.
     *      (Simplified Logic: Withdraws all voting power).
     */
    function withdrawStake() external nonReentrant {
        // We do NOT use whenNotPaused here. Users must be able to flee if we pause.
        uint256 amount = votingPower[msg.sender];
        require(amount > 0, "No voting power");

        votingPower[msg.sender] = 0;
        wldToken.safeTransfer(msg.sender, amount);
    }

    // --- Admin Functions ---

    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function emergencyPause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    // Storage Gap
    uint256[50] private __gap;
}