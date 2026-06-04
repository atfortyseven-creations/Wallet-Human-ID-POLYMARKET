// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

// "God-Mode" abstraction: Interface for the actual Smart Account implementation
interface IHumanAccount {
    function initialize(bytes32 _ownerPublicKeyX, bytes32 _ownerPublicKeyY) external;
}

contract HumanAccountFactory {
    address public immutable accountImplementation;

    event AccountCreated(address indexed account, bytes32 indexed ownerPublicKeyX, bytes32 indexed ownerPublicKeyY);

    constructor(address _implementation) {
        accountImplementation = _implementation;
    }

    /**
     * @dev Deploys a new Human Account deterministically using Create2.
     * The salt is derived from the User's WebAuthn Public Key (X, Y coordinates).
     * This ensures the same FaceID always generates the same Wallet Address.
     */
    function createAccount(bytes32 ownerPublicKeyX, bytes32 ownerPublicKeyY, uint256 salt) external returns (address ret) {
        address addr = getAddress(ownerPublicKeyX, ownerPublicKeyY, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return addr;
        }

        bytes memory initializer = abi.encodeCall(IHumanAccount.initialize, (ownerPublicKeyX, ownerPublicKeyY));
        
        // Deploy ERC1967 Proxy pointing to the Human Account logic
        ret = address(new ERC1967Proxy{salt: keccak256(abi.encode(ownerPublicKeyX, ownerPublicKeyY, salt))}(
            accountImplementation,
            initializer
        ));

        emit AccountCreated(ret, ownerPublicKeyX, ownerPublicKeyY);
    }

    /**
     * @dev Computes the counterfactual address of the Whale Alert Wallet before deployment.
     * This allows the database to "know" the user's wallet address just from their FaceID public key.
     */
    function getAddress(bytes32 ownerPublicKeyX, bytes32 ownerPublicKeyY, uint256 salt) public view returns (address) {
        bytes memory initializer = abi.encodeCall(IHumanAccount.initialize, (ownerPublicKeyX, ownerPublicKeyY));
        bytes memory bytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(accountImplementation, initializer)
        );
        
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                keccak256(abi.encode(ownerPublicKeyX, ownerPublicKeyY, salt)),
                keccak256(bytecode)
            )
        );
        
        return address(uint160(uint256(hash)));
    }
}

