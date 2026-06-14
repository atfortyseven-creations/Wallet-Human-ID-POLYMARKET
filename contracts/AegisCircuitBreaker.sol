// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AegisCircuitBreaker
 * @dev Quantum-Grade Smart Contract Fortification
 * 
 * LESSON FROM AZTEC EXPLOIT: Immutable contracts without velocity limits are vulnerable to fuzzing.
 * This contract enforces an automatic, immutable time-lock circuit breaker if outflows exceed
 * a specified percentage of total value locked (TVL) within a 1-hour window.
 */
abstract contract AegisCircuitBreaker {
    // ------------------------------------------------------------------------
    // STATE VARIABLES
    // ------------------------------------------------------------------------
    uint256 public constant VELOCITY_WINDOW = 1 hours;
    uint256 public constant MAX_OUTFLOW_PERCENT = 5; // Max 5% of TVL can exit per hour
    
    uint256 private windowStartTimestamp;
    uint256 private outflowInCurrentWindow;
    uint256 private lockedUntilTimestamp;
    
    address public aegisGuardian; // Multi-Sig that can manually pause/unpause

    // ------------------------------------------------------------------------
    // EVENTS
    // ------------------------------------------------------------------------
    event CircuitBreakerTripped(uint256 amountTripped, uint256 lockedUntil);
    event GuardianPauseEngaged();
    event GuardianPauseLifted();

    // ------------------------------------------------------------------------
    // MODIFIERS
    // ------------------------------------------------------------------------
    modifier notTripped() {
        require(block.timestamp >= lockedUntilTimestamp, "AEGIS: Circuit Breaker Tripped - Withdrawals frozen");
        _;
    }

    modifier onlyGuardian() {
        require(msg.sender == aegisGuardian, "AEGIS: Unauthorized Guardian");
        _;
    }

    constructor(address _guardian) {
        require(_guardian != address(0), "Guardian cannot be zero address");
        aegisGuardian = _guardian;
        windowStartTimestamp = block.timestamp;
    }

    // ------------------------------------------------------------------------
    // INTERNAL FUNCTIONS (To be called before token transfers)
    // ------------------------------------------------------------------------
    /**
     * @dev Must be called BEFORE any ETH or ERC20 leaves the contract.
     * @param amount The amount attempting to leave.
     * @param currentTvl The total value currently in the contract (before withdrawal).
     */
    function _checkAegisVelocity(uint256 amount, uint256 currentTvl) internal {
        // 1. Check if we need to reset the rolling window
        if (block.timestamp >= windowStartTimestamp + VELOCITY_WINDOW) {
            windowStartTimestamp = block.timestamp;
            outflowInCurrentWindow = 0;
        }

        // 2. Calculate max allowable outflow (5% of TVL)
        uint256 maxOutflow = (currentTvl * MAX_OUTFLOW_PERCENT) / 100;
        
        // 3. Project new outflow
        uint256 projectedOutflow = outflowInCurrentWindow + amount;

        // 4. Trip Circuit Breaker if breached
        if (projectedOutflow > maxOutflow) {
            lockedUntilTimestamp = block.timestamp + 24 hours; // Auto-freeze for 24h
            emit CircuitBreakerTripped(amount, lockedUntilTimestamp);
            revert("AEGIS: Velocity Limit Exceeded. Circuit Breaker Engaged.");
        }

        // 5. Register outflow
        outflowInCurrentWindow = projectedOutflow;
    }

    // ------------------------------------------------------------------------
    // GUARDIAN FUNCTIONS (Manual Emergency controls)
    // ------------------------------------------------------------------------
    function emergencyPause() external onlyGuardian {
        lockedUntilTimestamp = type(uint256).max; // Freeze forever until lifted
        emit GuardianPauseEngaged();
    }

    function emergencyUnpause() external onlyGuardian {
        lockedUntilTimestamp = 0;
        windowStartTimestamp = block.timestamp;
        outflowInCurrentWindow = 0;
        emit GuardianPauseLifted();
    }
}
