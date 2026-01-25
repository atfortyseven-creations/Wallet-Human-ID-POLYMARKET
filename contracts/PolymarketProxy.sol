// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ICTFExchange {
    // Simplified interface for Polymarket's CTF Exchange
    function fillOrders(
        bytes32[] calldata orderHashes,
        bytes[] calldata makerSignatures,
        uint256[] calldata makerBaseAmounts,
        uint256[] calldata takerBaseAmounts,
        uint256[] calldata takerQuoteAmounts
    ) external;
}

/**
 * @title PolymarketProxy
 * @notice Middleware to execute orders on Polymarket while tracking volume and collecting referral fees.
 */
contract PolymarketProxy is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public immutable ctfExchange;
    address public treasury;
    uint256 public constant REFERRAL_FEE_BPS = 10; // 0.1% (10/10000)

    mapping(address => uint256) public userVolume; // Tracks user lifetime volume in USDC

    event OrderExecuted(address indexed user, uint256 quoteAmount, uint256 fee);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    constructor(address _usdc, address _ctfExchange, address _treasury) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC");
        require(_ctfExchange != address(0), "Invalid Exchange");
        require(_treasury != address(0), "Invalid Treasury");
        
        usdc = IERC20(_usdc);
        ctfExchange = _ctfExchange;
        treasury = _treasury;

        // Approve CTF Exchange to spend infinite USDC from this proxy
        usdc.approve(_ctfExchange, type(uint256).max);
    }

    /**
     * @notice Execute a batch of orders on Polymarket via proxy.
     * @dev User must approve this contract to spend USDC.
     * @param totalQuoteAmount Total USDC amount for all orders.
     * @param orderHashes Hashes of orders to fill.
     * @param makerSignatures Signatures from makers.
     * @param makerBaseAmounts Base token amounts (outcome tokens).
     * @param takerBaseAmounts Taker base token amounts.
     * @param takerQuoteAmounts Taker quote amounts (USDC) per order.
     */
    function executeProxyOrders(
        uint256 totalQuoteAmount,
        bytes32[] calldata orderHashes,
        bytes[] calldata makerSignatures,
        uint256[] calldata makerBaseAmounts,
        uint256[] calldata takerBaseAmounts,
        uint256[] calldata takerQuoteAmounts
    ) external nonReentrant {
        require(totalQuoteAmount > 0, "Amount must be > 0");

        // 1. Calculate and Collect Fee
        uint256 fee = (totalQuoteAmount * REFERRAL_FEE_BPS) / 10000;
        uint256 totalRequired = totalQuoteAmount + fee;

        usdc.safeTransferFrom(msg.sender, address(this), totalRequired);
        
        // 2. Send Fee to Treasury
        if (fee > 0) {
            usdc.safeTransfer(treasury, fee);
        }

        // 3. Update User Volume
        userVolume[msg.sender] += totalQuoteAmount;

        // 4. Call Polymarket CTF Exchange
        // The funds are already in this contract, and this contract has approved the CTF Exchange.
        // We act as the taker.
        ICTFExchange(ctfExchange).fillOrders(
            orderHashes,
            makerSignatures,
            makerBaseAmounts,
            takerBaseAmounts,
            takerQuoteAmounts
        );

        // 5. Transfer any acquired outcome tokens back to user??
        // Note: The CTF Exchange typically sends outcome tokens to msg.sender (this proxy).
        // We would need to know WHICH tokens were bought to forward them.
        // For a generic proxy without decoding everything, this is tricky.
        // 
        // SIMPLIFIED ARCHITECTURE FOR MVP:
        // Since CTF Exchange might send tokens to 'taker', and here 'taker' is Proxy,
        // we'd need to implement ERC1155Receiver or check balances.
        // 
        // ALTERNATIVE: Use `delegatecall`? 
        // No, `delegatecall` keeps storage context of caller, so user would need to approve Exchange directly,
        // but then we can't easily capture the fee unless we pull it first.
        
        // For this architecture demo, we assume the Exchange sends tokens to `msg.sender`.
        // We would need to sweep tokens back. 
        // Given complexity, we will emit event and require off-chain sweeper or specific token ID input 
        // in a production version. For now, this logic demonstrates the fee capture flow.

        emit OrderExecuted(msg.sender, totalQuoteAmount, fee);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid Treasury");
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }
    
    // Function to rescue tokens stuck in proxy
    function rescueTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
