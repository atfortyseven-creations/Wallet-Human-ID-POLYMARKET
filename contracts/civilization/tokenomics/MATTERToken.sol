// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// "God-Mode" Stub for $MATTER (The Body) & Bonding Curve
// Price = Function of Total Supply (Bancor Formula).

contract MATTERToken is ERC20, Ownable(msg.sender) {
    uint32 public constant RESERVE_RATIO = 500000; // 50%
    ERC20 public reserveToken; // e.g., USDC or ETH

    constructor(address _reserveToken) ERC20("Matter", "MATTER") {
        reserveToken = ERC20(_reserveToken);
    }

    /**
     * @notice Buy $MATTER by depositing Reserve Token.
     */
    function buy(uint256 depositAmount) external {
        require(depositAmount > 0, "Deposit amount must be > 0");
        uint256 tokensToMint = calculatePurchaseReturn(totalSupply(), reserveBalance(), RESERVE_RATIO, depositAmount);
        
        // Transfer USDC from user to contract (Bonding Curve Reserve)
        require(reserveToken.transferFrom(msg.sender, address(this), depositAmount), "Transfer failed");
        
        _mint(msg.sender, tokensToMint);
    }

    /**
     * @notice Sell $MATTER for Reserve Token.
     */
    function sell(uint256 sellAmount) external {
        require(sellAmount > 0, "Sell amount must be > 0");
        require(balanceOf(msg.sender) >= sellAmount, "Insufficient MATTER balance");
        
        uint256 reserveReturn = calculateSaleReturn(totalSupply(), reserveBalance(), RESERVE_RATIO, sellAmount);
        
        _burn(msg.sender, sellAmount);
        
        // Transfer USDC from Reserve to User
        require(reserveToken.transfer(msg.sender, reserveReturn), "Transfer failed");
    }

    // Simplified Bancor Formula Stub
    function calculatePurchaseReturn(uint256 /*_supply*/, uint256 /*_reserveBalance*/, uint32 /*_reserveRatio*/, uint256 _depositAmount) public pure returns (uint256) {
        return _depositAmount; // Real formula is complex power function
    }

    function calculateSaleReturn(uint256 /*_supply*/, uint256 /*_reserveBalance*/, uint32 /*_reserveRatio*/, uint256 _sellAmount) public pure returns (uint256) {
        return _sellAmount; // Real formula is complex power function
    }

    function reserveBalance() public view returns (uint256) {
        return reserveToken.balanceOf(address(this));
    }
}

