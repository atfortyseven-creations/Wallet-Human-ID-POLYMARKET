// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TipsManager
 * @notice Protocol to tip traders on the leaderboard with USDC.
 * @dev Takes a 5% protocol fee for the treasury.
 */
contract TipsManager is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public treasury;
    uint256 public constant PROTOCOL_FEE_BPS = 500; // 5% (Basis Points: 500/10000)

    event TipSent(address indexed from, address indexed to, uint256 amount, uint256 fee);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    constructor(address _usdc, address _treasury) Ownable(msg.sender) {
        require(_usdc != address(0), "Invalid USDC address");
        require(_treasury != address(0), "Invalid Treasury address");
        usdc = IERC20(_usdc);
        treasury = _treasury;
    }

    /**
     * @notice Send a tip to a trader.
     * @dev User must approve this contract to spend USDC first.
     * @param trader The address of the trader to tip.
     * @param amount The total amount of USDC to tip.
     */
    function tipTrader(address trader, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(trader != address(0), "Invalid trader address");

        uint256 fee = (amount * PROTOCOL_FEE_BPS) / 10000;
        uint256 afterFee = amount - fee;

        // Transfer USDC from user to contract (or directly to recipients if logic allows, 
        // but here we do transferFrom to safe execution)
        
        // 1. Fee to Treasury
        if (fee > 0) {
            usdc.safeTransferFrom(msg.sender, treasury, fee);
        }

        // 2. Tip to Trader
        usdc.safeTransferFrom(msg.sender, trader, afterFee);

        emit TipSent(msg.sender, trader, afterFee, fee);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid Treasury address");
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }
}
