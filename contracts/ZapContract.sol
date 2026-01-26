// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title ISwapRouter - Uniswap V3 Router Interface
/// @notice Minimal interface for exact input swaps
interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another token
    /// @param params The parameters necessary for the swap, encoded as `ExactInputSingleParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

/// @title ICTFExchange - Polymarket Conditional Token Framework Interface
/// @notice Minimal interface for buying outcome shares
interface ICTFExchange {
    /// @notice Buy outcome tokens from the minter
    /// @param conditionId The condition identifier
    /// @param outcomeIndex The outcome index (0 or 1 for binary markets)
    /// @param amount The amount of collateral to spend
    /// @return shares The amount of outcome shares received
    function buyFromMinter(
        bytes32 conditionId,
        uint256 outcomeIndex,
        uint256 amount
    ) external returns (uint256 shares);
}

/// @title IPermit2 - Uniswap Permit2 Interface
/// @notice Minimal interface for gasless approvals
interface IPermit2 {
    /// @notice Transfer tokens from user to recipient using permit signature
    /// @param from The address to transfer from
    /// @param to The address to transfer to
    /// @param amount The amount to transfer
    /// @param token The token address
    /// @param nonce The permit nonce
    /// @param deadline The permit deadline
    /// @param signature The permit signature
    function permitTransferFrom(
        address from,
        address to,
        uint160 amount,
        address token,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external;
}

/// @title ZapContract
/// @author Polymarket Wallet Team
/// @notice Atomically converts WLD tokens to Polymarket outcome shares
/// @dev Implements "House Money Effect" psychology with strict atomicity guarantees
/// @custom:security-contact security@polymarketwallet.com
contract ZapContract is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============================================================================
    // IMMUTABLE STATE VARIABLES
    // ============================================================================

    /// @notice Worldcoin token address on Optimism
    address public immutable WLD_TOKEN;

    /// @notice USDC token address on Optimism
    address public immutable USDC_TOKEN;

    /// @notice Polymarket CTF Exchange address
    address public immutable CTF_EXCHANGE;

    /// @notice Uniswap V3 Swap Router address
    address public immutable SWAP_ROUTER;

    /// @notice Permit2 contract address (optional, can be address(0))
    address public immutable PERMIT2;

    /// @notice Uniswap V3 pool fee tier (3000 = 0.3%)
    uint24 public constant POOL_FEE = 3000;

    /// @notice Maximum slippage tolerance in basis points (200 = 2%)
    uint256 public constant MAX_SLIPPAGE_BPS = 200;

    /// @notice Basis points denominator
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Maximum deadline window (5 minutes)
    uint256 public constant MAX_DEADLINE_WINDOW = 300;

    // ============================================================================
    // MUTABLE STATE VARIABLES
    // ============================================================================

    /// @notice Protocol fee in basis points (50 = 0.5%)
    uint256 public protocolFeeBps = 50;

    /// @notice Treasury address for fee collection
    address public treasury;

    /// @notice Emergency pause flag
    bool public paused;

    // ============================================================================
    // EVENTS
    // ============================================================================

    /// @notice Emitted when a zap is successfully executed
    /// @param user The user who initiated the zap
    /// @param wldAmount The amount of WLD tokens zapped
    /// @param usdcReceived The amount of USDC received from swap
    /// @param conditionId The Polymarket condition ID
    /// @param outcomeIndex The outcome index purchased
    /// @param sharesReceived The amount of outcome shares received
    /// @param protocolFee The protocol fee charged
    event ZapExecuted(
        address indexed user,
        uint256 wldAmount,
        uint256 usdcReceived,
        bytes32 indexed conditionId,
        uint256 outcomeIndex,
        uint256 sharesReceived,
        uint256 protocolFee
    );

    /// @notice Emitted when protocol fee is updated
    /// @param oldFee The old fee in basis points
    /// @param newFee The new fee in basis points
    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);

    /// @notice Emitted when treasury address is updated
    /// @param oldTreasury The old treasury address
    /// @param newTreasury The new treasury address
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    /// @notice Emitted when contract is paused/unpaused
    /// @param isPaused The new pause state
    event PauseToggled(bool isPaused);

    /// @notice Emitted when dust tokens are recovered
    /// @param token The token address
    /// @param amount The amount recovered
    /// @param recipient The recipient address
    event DustRecovered(address indexed token, uint256 amount, address indexed recipient);

    // ============================================================================
    // ERRORS
    // ============================================================================

    error ContractPaused();
    error InvalidAmount();
    error InvalidDeadline();
    error SlippageTooHigh();
    error InsufficientOutput();
    error SwapFailed();
    error SharePurchaseFailed();
    error InvalidFee();
    error ZeroAddress();

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    /// @notice Initializes the ZapContract
    /// @param _wld WLD token address
    /// @param _usdc USDC token address
    /// @param _ctfExchange Polymarket CTF Exchange address
    /// @param _swapRouter Uniswap V3 Swap Router address
    /// @param _permit2 Permit2 address (can be address(0) if not using)
    /// @param _treasury Treasury address for fee collection
    constructor(
        address _wld,
        address _usdc,
        address _ctfExchange,
        address _swapRouter,
        address _permit2,
        address _treasury
    ) {
        if (_wld == address(0) || _usdc == address(0) || _ctfExchange == address(0) || 
            _swapRouter == address(0) || _treasury == address(0)) {
            revert ZeroAddress();
        }

        WLD_TOKEN = _wld;
        USDC_TOKEN = _usdc;
        CTF_EXCHANGE = _ctfExchange;
        SWAP_ROUTER = _swapRouter;
        PERMIT2 = _permit2;
        treasury = _treasury;
    }

    // ============================================================================
    // MODIFIERS
    // ============================================================================

    /// @notice Ensures contract is not paused
    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    // ============================================================================
    // MAIN ZAP FUNCTION
    // ============================================================================

    /// @notice Atomically converts WLD to Polymarket outcome shares
    /// @dev ALL STEPS MUST SUCCEED OR ENTIRE TRANSACTION REVERTS
    /// @param amountWLD Amount of WLD tokens to zap
    /// @param minUSDC Minimum USDC to receive from swap (slippage protection)
    /// @param conditionId Polymarket condition ID
    /// @param outcomeIndex Outcome index to purchase (0 or 1 for binary markets)
    /// @param minSharesOut Minimum shares to receive (additional slippage protection)
    /// @param deadline Transaction deadline timestamp
    /// @return sharesReceived Amount of outcome shares received
    function zapWLDToBinaryOutcome(
        uint256 amountWLD,
        uint256 minUSDC,
        bytes32 conditionId,
        uint256 outcomeIndex,
        uint256 minSharesOut,
        uint256 deadline
    ) external nonReentrant whenNotPaused returns (uint256 sharesReceived) {
        // ====================================================================
        // VALIDATION
        // ====================================================================

        if (amountWLD == 0) revert InvalidAmount();
        if (block.timestamp > deadline) revert InvalidDeadline();
        if (deadline > block.timestamp + MAX_DEADLINE_WINDOW) revert InvalidDeadline();
        if (outcomeIndex > 1) revert InvalidAmount(); // Binary markets only

        // ====================================================================
        // STEP 1: TRANSFER WLD FROM USER
        // ====================================================================

        IERC20(WLD_TOKEN).safeTransferFrom(msg.sender, address(this), amountWLD);

        // ====================================================================
        // STEP 2: SWAP WLD → USDC
        // ====================================================================

        // Approve Uniswap router to spend WLD
        IERC20(WLD_TOKEN).safeApprove(SWAP_ROUTER, amountWLD);

        // Execute swap
        uint256 usdcReceived;
        try ISwapRouter(SWAP_ROUTER).exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: WLD_TOKEN,
                tokenOut: USDC_TOKEN,
                fee: POOL_FEE,
                recipient: address(this),
                deadline: deadline,
                amountIn: amountWLD,
                amountOutMinimum: minUSDC,
                sqrtPriceLimitX96: 0 // No price limit
            })
        ) returns (uint256 amount) {
            usdcReceived = amount;
        } catch {
            // Reset approval and revert
            IERC20(WLD_TOKEN).safeApprove(SWAP_ROUTER, 0);
            revert SwapFailed();
        }

        // Reset approval
        IERC20(WLD_TOKEN).safeApprove(SWAP_ROUTER, 0);

        // Verify slippage
        if (usdcReceived < minUSDC) revert SlippageTooHigh();

        // ====================================================================
        // STEP 3: DEDUCT PROTOCOL FEE
        // ====================================================================

        uint256 protocolFee = (usdcReceived * protocolFeeBps) / BPS_DENOMINATOR;
        uint256 usdcForShares = usdcReceived - protocolFee;

        // Transfer fee to treasury
        if (protocolFee > 0) {
            IERC20(USDC_TOKEN).safeTransfer(treasury, protocolFee);
        }

        // ====================================================================
        // STEP 4: BUY OUTCOME SHARES
        // ====================================================================

        // Approve CTF Exchange to spend USDC
        IERC20(USDC_TOKEN).safeApprove(CTF_EXCHANGE, usdcForShares);

        // Purchase shares
        try ICTFExchange(CTF_EXCHANGE).buyFromMinter(
            conditionId,
            outcomeIndex,
            usdcForShares
        ) returns (uint256 shares) {
            sharesReceived = shares;
        } catch {
            // Reset approval and revert
            IERC20(USDC_TOKEN).safeApprove(CTF_EXCHANGE, 0);
            revert SharePurchaseFailed();
        }

        // Reset approval
        IERC20(USDC_TOKEN).safeApprove(CTF_EXCHANGE, 0);

        // Verify minimum shares received
        if (sharesReceived < minSharesOut) revert InsufficientOutput();

        // ====================================================================
        // STEP 5: RETURN DUST TO USER
        // ====================================================================

        // Check for any remaining WLD dust
        uint256 wldDust = IERC20(WLD_TOKEN).balanceOf(address(this));
        if (wldDust > 0) {
            IERC20(WLD_TOKEN).safeTransfer(msg.sender, wldDust);
        }

        // Check for any remaining USDC dust
        uint256 usdcDust = IERC20(USDC_TOKEN).balanceOf(address(this));
        if (usdcDust > 0) {
            IERC20(USDC_TOKEN).safeTransfer(msg.sender, usdcDust);
        }

        // ====================================================================
        // EMIT EVENT
        // ====================================================================

        emit ZapExecuted(
            msg.sender,
            amountWLD,
            usdcReceived,
            conditionId,
            outcomeIndex,
            sharesReceived,
            protocolFee
        );

        return sharesReceived;
    }

    // ============================================================================
    // PERMIT2 INTEGRATION (OPTIONAL)
    // ============================================================================

    /// @notice Zap using Permit2 for gasless approval
    /// @dev Same as zapWLDToBinaryOutcome but uses Permit2 for initial transfer
    /// @param amountWLD Amount of WLD tokens to zap
    /// @param minUSDC Minimum USDC to receive from swap
    /// @param conditionId Polymarket condition ID
    /// @param outcomeIndex Outcome index to purchase
    /// @param minSharesOut Minimum shares to receive
    /// @param deadline Transaction deadline
    /// @param permitNonce Permit2 nonce
    /// @param permitDeadline Permit2 deadline
    /// @param permitSignature Permit2 signature
    /// @return sharesReceived Amount of outcome shares received
    function zapWithPermit(
        uint256 amountWLD,
        uint256 minUSDC,
        bytes32 conditionId,
        uint256 outcomeIndex,
        uint256 minSharesOut,
        uint256 deadline,
        uint256 permitNonce,
        uint256 permitDeadline,
        bytes calldata permitSignature
    ) external nonReentrant whenNotPaused returns (uint256 sharesReceived) {
        if (PERMIT2 == address(0)) revert ZeroAddress();

        // Transfer WLD using Permit2
        IPermit2(PERMIT2).permitTransferFrom(
            msg.sender,
            address(this),
            uint160(amountWLD),
            WLD_TOKEN,
            permitNonce,
            permitDeadline,
            permitSignature
        );

        // Continue with normal zap flow (internal call to avoid code duplication)
        return _executeZap(amountWLD, minUSDC, conditionId, outcomeIndex, minSharesOut, deadline);
    }

    /// @notice Internal zap execution (shared logic)
    /// @dev Assumes WLD is already in contract
    function _executeZap(
        uint256 amountWLD,
        uint256 minUSDC,
        bytes32 conditionId,
        uint256 outcomeIndex,
        uint256 minSharesOut,
        uint256 deadline
    ) private returns (uint256 sharesReceived) {
        // Validation
        if (amountWLD == 0) revert InvalidAmount();
        if (block.timestamp > deadline) revert InvalidDeadline();
        if (outcomeIndex > 1) revert InvalidAmount();

        // Swap WLD → USDC
        IERC20(WLD_TOKEN).safeApprove(SWAP_ROUTER, amountWLD);
        
        uint256 usdcReceived = ISwapRouter(SWAP_ROUTER).exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: WLD_TOKEN,
                tokenOut: USDC_TOKEN,
                fee: POOL_FEE,
                recipient: address(this),
                deadline: deadline,
                amountIn: amountWLD,
                amountOutMinimum: minUSDC,
                sqrtPriceLimitX96: 0
            })
        );

        IERC20(WLD_TOKEN).safeApprove(SWAP_ROUTER, 0);

        if (usdcReceived < minUSDC) revert SlippageTooHigh();

        // Deduct fee
        uint256 protocolFee = (usdcReceived * protocolFeeBps) / BPS_DENOMINATOR;
        uint256 usdcForShares = usdcReceived - protocolFee;

        if (protocolFee > 0) {
            IERC20(USDC_TOKEN).safeTransfer(treasury, protocolFee);
        }

        // Buy shares
        IERC20(USDC_TOKEN).safeApprove(CTF_EXCHANGE, usdcForShares);
        
        sharesReceived = ICTFExchange(CTF_EXCHANGE).buyFromMinter(
            conditionId,
            outcomeIndex,
            usdcForShares
        );

        IERC20(USDC_TOKEN).safeApprove(CTF_EXCHANGE, 0);

        if (sharesReceived < minSharesOut) revert InsufficientOutput();

        // Return dust
        uint256 wldDust = IERC20(WLD_TOKEN).balanceOf(address(this));
        if (wldDust > 0) IERC20(WLD_TOKEN).safeTransfer(msg.sender, wldDust);

        uint256 usdcDust = IERC20(USDC_TOKEN).balanceOf(address(this));
        if (usdcDust > 0) IERC20(USDC_TOKEN).safeTransfer(msg.sender, usdcDust);

        emit ZapExecuted(msg.sender, amountWLD, usdcReceived, conditionId, outcomeIndex, sharesReceived, protocolFee);

        return sharesReceived;
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    /// @notice Update protocol fee
    /// @param newFeeBps New fee in basis points (max 100 = 1%)
    function setProtocolFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > 100) revert InvalidFee(); // Max 1%
        
        uint256 oldFee = protocolFeeBps;
        protocolFeeBps = newFeeBps;
        
        emit ProtocolFeeUpdated(oldFee, newFeeBps);
    }

    /// @notice Update treasury address
    /// @param newTreasury New treasury address
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert ZeroAddress();
        
        address oldTreasury = treasury;
        treasury = newTreasury;
        
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /// @notice Toggle pause state
    function togglePause() external onlyOwner {
        paused = !paused;
        emit PauseToggled(paused);
    }

    /// @notice Recover stuck tokens (emergency only)
    /// @param token Token address to recover
    /// @param amount Amount to recover
    /// @param recipient Recipient address
    function recoverDust(address token, uint256 amount, address recipient) external onlyOwner {
        if (recipient == address(0)) revert ZeroAddress();
        
        IERC20(token).safeTransfer(recipient, amount);
        
        emit DustRecovered(token, amount, recipient);
    }
}
