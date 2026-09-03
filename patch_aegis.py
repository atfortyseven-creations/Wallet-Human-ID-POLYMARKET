import pathlib
path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/contracts/AegisCircuitBreaker.sol')
content = path.read_text(encoding='utf-8')

# Fix HIGH-1: Virtual _currentTvl
tvl_virtual = '''
    /**
     * @dev Child contracts must override this to return the unmanipulable Total Value Locked.
     * e.g., return address(this).balance; OR return token.balanceOf(address(this));
     */
    function _currentTvl() internal view virtual returns (uint256);
'''
content = content.replace('address public aegisGuardian;', 'address public aegisGuardian;\n' + tvl_virtual)

# Replace _checkAegisVelocity signature and logic
old_check = '''    function _checkAegisVelocity(uint256 amount, uint256 currentTvl) internal {
        // 1. Check if we need to reset the rolling window
        if (block.timestamp >= windowStartTimestamp + VELOCITY_WINDOW) {
            windowStartTimestamp = block.timestamp;
            outflowInCurrentWindow = 0;
        }

        // 2. Calculate max allowable outflow (5% of TVL)
        uint256 maxOutflow = (currentTvl * MAX_OUTFLOW_PERCENT) / 100;'''
new_check = '''    function _checkAegisVelocity(uint256 amount) internal {
        // 1. Check if we need to reset the window (Fixed slot to prevent MED-1 boundary games)
        uint256 currentSlot = (block.timestamp / VELOCITY_WINDOW) * VELOCITY_WINDOW;
        if (currentSlot > windowStartTimestamp) {
            windowStartTimestamp = currentSlot;
            outflowInCurrentWindow = 0;
        }

        // 2. Calculate max allowable outflow (5% of TVL) safely via virtual override (HIGH-1)
        uint256 currentTvl = _currentTvl();
        uint256 maxOutflow = (currentTvl * MAX_OUTFLOW_PERCENT) / 100;'''
content = content.replace(old_check, new_check)

# Fix HIGH-2: Guardian controls and rotation
old_guardian = '''    function emergencyPause() external onlyGuardian {
        lockedUntilTimestamp = type(uint256).max; // Freeze forever until lifted
        emit GuardianPauseEngaged();
    }'''
new_guardian = '''    address public pendingGuardian;
    uint256 public guardianTransferTimestamp;

    event GuardianTransferInitiated(address newGuardian, uint256 effectiveTime);
    event GuardianTransferCompleted(address newGuardian);

    function initiateGuardianTransfer(address newGuardian) external onlyGuardian {
        require(newGuardian != address(0), "Invalid guardian");
        pendingGuardian = newGuardian;
        guardianTransferTimestamp = block.timestamp + 48 hours;
        emit GuardianTransferInitiated(newGuardian, guardianTransferTimestamp);
    }

    function completeGuardianTransfer() external {
        require(msg.sender == pendingGuardian, "Only pending guardian");
        require(block.timestamp >= guardianTransferTimestamp, "Timelock active");
        aegisGuardian = pendingGuardian;
        pendingGuardian = address(0);
        emit GuardianTransferCompleted(aegisGuardian);
    }

    function emergencyPause() external onlyGuardian {
        lockedUntilTimestamp = block.timestamp + 7 days; // Max 7 days freeze to prevent permanent brick (HIGH-2)
        emit GuardianPauseEngaged();
    }'''
content = content.replace(old_guardian, new_guardian)

path.write_text(content, encoding='utf-8')
print("Patched AegisCircuitBreaker.sol")
