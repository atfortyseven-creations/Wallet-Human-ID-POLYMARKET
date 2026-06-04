// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DeadMansSwitch
 * @notice Mecanismo de herencia Whale-grade. Si el titular no ejecuta un ping en X tiempo, el beneficiario designado puede drenar los fondos.
 */
contract DeadMansSwitch {
    struct Switch {
        address beneficiary;
        uint256 lastPing;
        uint256 inactivityPeriod;
        uint256 balance;
    }

    mapping(address => Switch) public switches;

    event Setup(address indexed owner, address beneficiary, uint256 inactivityPeriod);
    event Ping(address indexed owner, uint256 timestamp);
    event Recovered(address indexed beneficiary, uint256 amount);

    /**
     * @notice Activa el protocolo de herencia con los fondos en el contrato.
     */
    function setupSwitch(address _beneficiary, uint256 _inactivityPeriod) external payable {
        require(_beneficiary != address(0), "Beneficiario nulo");
        require(_inactivityPeriod > 1 days, "Periodo muy corto (min 1 dia)");
        
        switches[msg.sender] = Switch({
            beneficiary: _beneficiary,
            lastPing: block.timestamp,
            inactivityPeriod: _inactivityPeriod,
            balance: msg.value
        });

        emit Setup(msg.sender, _beneficiary, _inactivityPeriod);
    }

    /**
     * @notice El usuario principal prolonga la vida del contrato al demostrar actividad.
     */
    function ping() external {
        Switch storage s = switches[msg.sender];
        require(s.beneficiary != address(0), "Switch no configurado");
        s.lastPing = block.timestamp;

        emit Ping(msg.sender, block.timestamp);
    }

    /**
     * @notice El beneficiario drena si se cumplio el inactivity period.
     */
    function triggerRecovery(address _owner) external {
        Switch storage s = switches[_owner];
        require(msg.sender == s.beneficiary, "No autorizado");
        require(block.timestamp > s.lastPing + s.inactivityPeriod, "El propietario sigue vivo (Ping reciente)");
        
        uint256 amount = s.balance;
        require(amount > 0, "Boveda vacia");
        s.balance = 0; // Prevent re-entrancy

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Fallo en la recuperacion");

        emit Recovered(msg.sender, amount);
    }
}
