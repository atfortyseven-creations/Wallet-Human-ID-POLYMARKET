import pathlib
path = pathlib.Path('d:/Projects/Wallet Human Polymarket ID/contracts/avs/LedgerAVS.sol')
content = path.read_text(encoding='utf-8')

# Fix CRIT-2: Dynamic Consensus
old_consensus = '''        // Resolving locally if consensus threshold met (simplified for example: 3 approvals)
        if (task.approvals >= 3) {
            task.resolved = true;
            emit SignalResolved(txHash, true);
        } else if (task.rejections >= 3) {
            task.resolved = true;
            // False positive detected by consensus. Slash the original proposer or approve slashing.
            emit SignalResolved(txHash, false);
        }'''

new_consensus = '''        // Dynamic consensus: 2/3 of active operators (BFT threshold)
        uint256 requiredQuorum = (activeOperatorsList.length * 2) / 3 + 1;
        
        if (task.approvals >= requiredQuorum) {
            task.resolved = true;
            emit SignalResolved(txHash, true);
        } else if (task.rejections >= requiredQuorum) {
            task.resolved = true;
            emit SignalResolved(txHash, false);
        }'''
content = content.replace(old_consensus, new_consensus)

# Insert internal removal function and Task Expiry (MED-11)
removal_logic = '''
    function _removeActiveOperator(address op) internal {
        for (uint256 i = 0; i < activeOperatorsList.length; i++) {
            if (activeOperatorsList[i] == op) {
                activeOperatorsList[i] = activeOperatorsList[activeOperatorsList.length - 1];
                activeOperatorsList.pop();
                break;
            }
        }
    }
'''
if "_removeActiveOperator" not in content:
    content = content.replace('function unregisterOperator() external nonReentrant whenNotPaused {', removal_logic + '\n    function unregisterOperator() external nonReentrant whenNotPaused {')

# Fix CRIT-3: Unregister
old_unregister = '''        uint256 amountToReturn = op.stakedAmount;
        op.isRegistered = false;
        op.stakedAmount = 0;

        stakingToken.safeTransfer(msg.sender, amountToReturn);'''
new_unregister = '''        uint256 amountToReturn = op.stakedAmount;
        op.isRegistered = false;
        op.stakedAmount = 0;
        
        _removeActiveOperator(msg.sender);

        stakingToken.safeTransfer(msg.sender, amountToReturn);'''
content = content.replace(old_unregister, new_unregister)

# Fix CRIT-4: Slash operator
old_slash = '''        uint256 penalty = (op.stakedAmount * SLASH_PENALTY_BPS) / 10000;
        op.stakedAmount -= penalty;
        op.slashedCount += 1;

        // Burn the slashed tokens or send to treasury (sending to zero address for deflation)
        stakingToken.safeTransfer(address(0xdead), penalty);'''
new_slash = '''        uint256 penalty = (op.stakedAmount * SLASH_PENALTY_BPS) / 10000;
        op.stakedAmount -= penalty;
        op.slashedCount += 1;

        if (op.stakedAmount < MIN_STAKE) {
            op.isRegistered = false;
            _removeActiveOperator(operator);
        }

        // Burn the slashed tokens or send to treasury (sending to zero address for deflation)
        stakingToken.safeTransfer(address(0xdead), penalty);'''
content = content.replace(old_slash, new_slash)

# Fix MED-11: Task Expiry
old_create_task = '''        SignalTask storage task = signalTasks[txHash];
        task.txHash = txHash;
        task.zScore = zScore;
        task.timestamp = block.timestamp;'''
new_create_task = '''        SignalTask storage task = signalTasks[txHash];
        task.txHash = txHash;
        task.zScore = zScore;
        task.timestamp = block.timestamp;'''
# Actually we need to add expiresAt
old_struct = '''        uint256 timestamp;
        uint256 approvals;'''
new_struct = '''        uint256 timestamp;
        uint256 expiresAt;
        uint256 approvals;'''
content = content.replace(old_struct, new_struct)

old_create2 = '''        task.zScore = zScore;
        task.timestamp = block.timestamp;'''
new_create2 = '''        task.zScore = zScore;
        task.timestamp = block.timestamp;
        task.expiresAt = block.timestamp + 1 hours;'''
content = content.replace(old_create2, new_create2)

old_attest = '''        require(task.timestamp != 0, "Task does not exist");
        require(!task.resolved, "Task already resolved");'''
new_attest = '''        require(task.timestamp != 0, "Task does not exist");
        require(!task.resolved, "Task already resolved");
        require(block.timestamp <= task.expiresAt, "Task expired");'''
content = content.replace(old_attest, new_attest)

path.write_text(content, encoding='utf-8')
print("Patched LedgerAVS.sol")
