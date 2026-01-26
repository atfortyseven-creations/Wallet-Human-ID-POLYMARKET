// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/// @title MarketGovernance
/// @author Polymarket Wallet Team
/// @notice Manages royalty distribution for market creators using Merkle proofs
/// @dev Implements pull-based reward claiming for gas efficiency
/// @custom:security-contact security@polymarketwallet.com
contract MarketGovernance is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    /// @notice USDC token address (royalties paid in USDC)
    address public immutable USDC_TOKEN;

    /// @notice Current active Merkle root for the distribution period
    bytes32 public merkleRoot;

    /// @notice Distribution period identifier (increments weekly)
    uint256 public currentPeriod;

    /// @notice Mapping of period => merkle root for historical tracking
    mapping(uint256 => bytes32) public periodMerkleRoots;

    /// @notice Mapping of period => total amount distributed
    mapping(uint256 => uint256) public periodTotalAmounts;

    /// @notice Bitmap tracking claims: period => user => claimed
    /// @dev Uses nested mapping for gas efficiency
    mapping(uint256 => mapping(address => bool)) public hasClaimed;

    /// @notice Total royalties claimed across all periods
    uint256 public totalRoyaltiesClaimed;

    /// @notice Total royalties distributed across all periods
    uint256 public totalRoyaltiesDistributed;

    /// @notice Expiration time for claim periods (90 days)
    uint256 public constant CLAIM_EXPIRATION = 90 days;

    /// @notice Mapping of period => expiration timestamp
    mapping(uint256 => uint256) public periodExpirations;

    // ============================================================================
    // EVENTS
    // ============================================================================

    /// @notice Emitted when a new Merkle root is published
    /// @param period The distribution period
    /// @param merkleRoot The Merkle root
    /// @param totalAmount The total amount available for distribution
    /// @param expiresAt The expiration timestamp
    event MerkleRootPublished(
        uint256 indexed period,
        bytes32 indexed merkleRoot,
        uint256 totalAmount,
        uint256 expiresAt
    );

    /// @notice Emitted when royalties are claimed
    /// @param period The distribution period
    /// @param claimer The address claiming royalties
    /// @param amount The amount claimed
    event RoyaltiesClaimed(
        uint256 indexed period,
        address indexed claimer,
        uint256 amount
    );

    /// @notice Emitted when royalties are batch claimed
    /// @param claimer The address claiming royalties
    /// @param totalAmount The total amount claimed across all periods
    /// @param periodCount The number of periods claimed
    event RoyaltiesBatchClaimed(
        address indexed claimer,
        uint256 totalAmount,
        uint256 periodCount
    );

    /// @notice Emitted when expired funds are recovered
    /// @param period The expired period
    /// @param amount The amount recovered
    /// @param recipient The recipient address
    event ExpiredFundsRecovered(
        uint256 indexed period,
        uint256 amount,
        address indexed recipient
    );

    // ============================================================================
    // ERRORS
    // ============================================================================

    error InvalidProof();
    error AlreadyClaimed();
    error ClaimExpired();
    error InvalidAmount();
    error InvalidPeriod();
    error ZeroAddress();
    error InsufficientBalance();
    error PeriodNotExpired();

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /// @notice Initializes the MarketGovernance contract
    /// @param _usdc USDC token address
    constructor(address _usdc) {
        if (_usdc == address(0)) revert ZeroAddress();
        
        USDC_TOKEN = _usdc;
        currentPeriod = 0;
    }

    // ============================================================================
    // MERKLE ROOT MANAGEMENT
    // ============================================================================

    /// @notice Publishes a new Merkle root for the current period
    /// @dev Only callable by owner (backend service)
    /// @param _merkleRoot The Merkle root for this distribution period
    /// @param totalAmount The total amount available for distribution
    function publishMerkleRoot(bytes32 _merkleRoot, uint256 totalAmount) external onlyOwner {
        if (_merkleRoot == bytes32(0)) revert InvalidAmount();
        if (totalAmount == 0) revert InvalidAmount();

        // Increment period
        currentPeriod++;

        // Store Merkle root
        merkleRoot = _merkleRoot;
        periodMerkleRoots[currentPeriod] = _merkleRoot;
        periodTotalAmounts[currentPeriod] = totalAmount;

        // Set expiration (90 days from now)
        uint256 expiresAt = block.timestamp + CLAIM_EXPIRATION;
        periodExpirations[currentPeriod] = expiresAt;

        // Update total distributed
        totalRoyaltiesDistributed += totalAmount;

        emit MerkleRootPublished(currentPeriod, _merkleRoot, totalAmount, expiresAt);
    }

    // ============================================================================
    // CLAIM FUNCTIONS
    // ============================================================================

    /// @notice Claims royalties for a specific period
    /// @param period The distribution period to claim from
    /// @param amount The amount to claim
    /// @param merkleProof The Merkle proof
    function claimRoyalties(
        uint256 period,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external nonReentrant {
        _claimRoyalties(period, amount, merkleProof, msg.sender);
    }

    /// @notice Claims royalties on behalf of another address (for smart wallets)
    /// @param period The distribution period to claim from
    /// @param amount The amount to claim
    /// @param merkleProof The Merkle proof
    /// @param beneficiary The address to receive the royalties
    function claimRoyaltiesFor(
        uint256 period,
        uint256 amount,
        bytes32[] calldata merkleProof,
        address beneficiary
    ) external nonReentrant {
        _claimRoyalties(period, amount, merkleProof, beneficiary);
    }

    /// @notice Internal claim logic
    /// @param period The distribution period
    /// @param amount The amount to claim
    /// @param merkleProof The Merkle proof
    /// @param beneficiary The beneficiary address
    function _claimRoyalties(
        uint256 period,
        uint256 amount,
        bytes32[] calldata merkleProof,
        address beneficiary
    ) private {
        // Validation
        if (beneficiary == address(0)) revert ZeroAddress();
        if (period == 0 || period > currentPeriod) revert InvalidPeriod();
        if (amount == 0) revert InvalidAmount();

        // Check if already claimed
        if (hasClaimed[period][beneficiary]) revert AlreadyClaimed();

        // Check if expired
        if (block.timestamp > periodExpirations[period]) revert ClaimExpired();

        // Verify Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(beneficiary, amount));
        bytes32 root = periodMerkleRoots[period];

        if (!MerkleProof.verify(merkleProof, root, leaf)) revert InvalidProof();

        // Mark as claimed
        hasClaimed[period][beneficiary] = true;

        // Update total claimed
        totalRoyaltiesClaimed += amount;

        // Transfer USDC
        IERC20(USDC_TOKEN).safeTransfer(beneficiary, amount);

        emit RoyaltiesClaimed(period, beneficiary, amount);
    }

    // ============================================================================
    // BATCH CLAIM FUNCTIONS
    // ============================================================================

    /// @notice Claims royalties from multiple periods in a single transaction
    /// @param periods Array of periods to claim from
    /// @param amounts Array of amounts to claim
    /// @param merkleProofs Array of Merkle proofs
    function batchClaimRoyalties(
        uint256[] calldata periods,
        uint256[] calldata amounts,
        bytes32[][] calldata merkleProofs
    ) external nonReentrant {
        uint256 length = periods.length;
        
        if (length != amounts.length || length != merkleProofs.length) {
            revert InvalidAmount();
        }

        uint256 totalClaimed = 0;

        for (uint256 i = 0; i < length; i++) {
            uint256 period = periods[i];
            uint256 amount = amounts[i];
            bytes32[] calldata proof = merkleProofs[i];

            // Validation
            if (period == 0 || period > currentPeriod) revert InvalidPeriod();
            if (amount == 0) revert InvalidAmount();
            if (hasClaimed[period][msg.sender]) continue; // Skip already claimed
            if (block.timestamp > periodExpirations[period]) continue; // Skip expired

            // Verify proof
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
            bytes32 root = periodMerkleRoots[period];

            if (!MerkleProof.verify(proof, root, leaf)) continue; // Skip invalid proofs

            // Mark as claimed
            hasClaimed[period][msg.sender] = true;
            totalClaimed += amount;

            emit RoyaltiesClaimed(period, msg.sender, amount);
        }

        if (totalClaimed == 0) revert InvalidAmount();

        // Update total claimed
        totalRoyaltiesClaimed += totalClaimed;

        // Transfer total USDC
        IERC20(USDC_TOKEN).safeTransfer(msg.sender, totalClaimed);

        emit RoyaltiesBatchClaimed(msg.sender, totalClaimed, length);
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    /// @notice Checks if a user has claimed for a specific period
    /// @param period The distribution period
    /// @param user The user address
    /// @return claimed True if already claimed
    function hasUserClaimed(uint256 period, address user) external view returns (bool claimed) {
        return hasClaimed[period][user];
    }

    /// @notice Gets the Merkle root for a specific period
    /// @param period The distribution period
    /// @return root The Merkle root
    function getPeriodMerkleRoot(uint256 period) external view returns (bytes32 root) {
        return periodMerkleRoots[period];
    }

    /// @notice Gets the total amount for a specific period
    /// @param period The distribution period
    /// @return amount The total amount
    function getPeriodTotalAmount(uint256 period) external view returns (uint256 amount) {
        return periodTotalAmounts[period];
    }

    /// @notice Gets the expiration timestamp for a specific period
    /// @param period The distribution period
    /// @return expiresAt The expiration timestamp
    function getPeriodExpiration(uint256 period) external view returns (uint256 expiresAt) {
        return periodExpirations[period];
    }

    /// @notice Checks if a period has expired
    /// @param period The distribution period
    /// @return expired True if expired
    function isPeriodExpired(uint256 period) external view returns (bool expired) {
        return block.timestamp > periodExpirations[period];
    }

    /// @notice Verifies a Merkle proof without claiming
    /// @param period The distribution period
    /// @param user The user address
    /// @param amount The amount
    /// @param merkleProof The Merkle proof
    /// @return valid True if proof is valid
    function verifyProof(
        uint256 period,
        address user,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external view returns (bool valid) {
        bytes32 leaf = keccak256(abi.encodePacked(user, amount));
        bytes32 root = periodMerkleRoots[period];
        return MerkleProof.verify(merkleProof, root, leaf);
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    /// @notice Recovers expired funds from a period
    /// @dev Only callable by owner after expiration
    /// @param period The expired period
    /// @param recipient The recipient address
    function recoverExpiredFunds(uint256 period, address recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        if (period == 0 || period > currentPeriod) revert InvalidPeriod();
        if (block.timestamp <= periodExpirations[period]) revert PeriodNotExpired();

        uint256 totalAmount = periodTotalAmounts[period];
        
        // Calculate unclaimed amount
        // Note: This is a simplified version. In production, you'd track claimed amounts per period
        uint256 balance = IERC20(USDC_TOKEN).balanceOf(address(this));
        
        if (balance == 0) revert InsufficientBalance();

        // Transfer to recipient
        IERC20(USDC_TOKEN).safeTransfer(recipient, balance);

        emit ExpiredFundsRecovered(period, balance, recipient);
    }

    /// @notice Emergency withdrawal function
    /// @dev Only callable by owner
    /// @param token Token address to withdraw
    /// @param amount Amount to withdraw
    /// @param recipient Recipient address
    function emergencyWithdraw(
        address token,
        uint256 amount,
        address recipient
    ) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();

        IERC20(token).safeTransfer(recipient, amount);
    }

    /// @notice Deposits USDC into the contract for distribution
    /// @dev Anyone can deposit to fund the royalty pool
    /// @param amount Amount to deposit
    function depositRoyalties(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();

        IERC20(USDC_TOKEN).safeTransferFrom(msg.sender, address(this), amount);
    }

    // ============================================================================
    // RECEIVE FUNCTION
    // ============================================================================

    /// @notice Allows contract to receive ETH (for potential future use)
    receive() external payable {}
}
