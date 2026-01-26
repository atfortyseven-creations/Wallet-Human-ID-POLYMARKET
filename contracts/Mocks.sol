// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../contracts/ZapContract.sol"; // Import to ensure interfaces match

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}
    
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}

contract MockSwapRouter is ISwapRouter {
    address public immutable tokenOut;

    constructor(address _tokenOut) {
        tokenOut = _tokenOut;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut) {
        // Mock swap: 1 input = 0.9 output (simulating price/fee) unless it's WLD->USDC where we do 1:1 for simplicity
        // Just mint output tokens to recipient to simulate swap
        amountOut = params.amountIn; // 1:1 ratio
        
        MockERC20(tokenOut).mint(params.recipient, amountOut);
        
        // Burn input tokens (optional, but good for realism)
        // MockERC20(params.tokenIn).burnFrom(msg.sender, params.amountIn); -- MockERC20 doesn't have burnFrom by default
        
        return amountOut;
    }
}

contract MockCTFExchange is ICTFExchange {
    address public immutable collateralToken;

    constructor(address _collateralToken) {
        collateralToken = _collateralToken;
    }

    function buyFromMinter(
        bytes32 conditionId,
        uint256 outcomeIndex,
        uint256 amount
    ) external returns (uint256 shares) {
        // Mock buy: 1 collateral = 1 share
        shares = amount;
        
        // Transfer collateral from caller to self (simulating payment)
        IERC20(collateralToken).transferFrom(msg.sender, address(this), amount);
        
        return shares;
    }
}
