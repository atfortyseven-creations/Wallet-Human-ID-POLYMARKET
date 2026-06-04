// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HumanTimeLock (EIP-1153 Preparado)
 * @notice Bóveda temporal bloqueada on-chain resistente a reentradas.
 */
contract HumanTimeLock {
    
    struct LockInfo {
        uint256 amount;
        uint256 unlockTime;
    }

    mapping(address => LockInfo) public locks;

    event Locked(address indexed user, uint256 amount, uint256 unlockTime);
    event Withdrawn(address indexed user, uint256 amount);

    /**
     * @notice Bloquea fondos estrictamente hasta la fecha objetivo.
     * @param _duration Temporalidad en segundos (ej. 31536000 para 1 año).
     */
    function lock(uint256 _duration) external payable {
        require(msg.value > 0, "Debe enviar valor");
        require(_duration > 0, "La duracion debe ser mayor a cero");

        LockInfo storage userLock = locks[msg.sender];
        userLock.amount += msg.value;
        userLock.unlockTime = block.timestamp + _duration;

        emit Locked(msg.sender, msg.value, userLock.unlockTime);
    }

    /**
     * @notice Libera los fondos. Revertirá si el tiempo no se ha cumplido.
     */
    function withdraw() external {
        LockInfo storage userLock = locks[msg.sender];
        require(userLock.amount > 0, "No hay fondos bloqueados");
        require(block.timestamp >= userLock.unlockTime, "Aun no es el tiempo de desbloqueo");

        uint256 transferAmount = userLock.amount;
        userLock.amount = 0; // Prevent re-entrancy
        
        (bool success, ) = msg.sender.call{value: transferAmount}("");
        require(success, "Fallo transferencia ETH");

        emit Withdrawn(msg.sender, transferAmount);
    }
}
