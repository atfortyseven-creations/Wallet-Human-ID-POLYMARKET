// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

interface ICoreDots {
    function mint(address to, uint256 amount) external;
}

/**
 * @title CoreAirdrop
 * @dev Highly secure EIP-712 signature-based airdrop for CoreDots.
 * Ensures each wallet can only claim the 500 QD welcome bonus exactly once,
 * strictly authorized by the backend server signature.
 */
contract CoreAirdrop is AccessControl, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CLAIM_TYPEHASH = keccak256("Claim(address wallet,uint256 amount)");

    ICoreDots public immutable coreDots;
    address public signerAuthority;
    uint256 public constant CLAIM_AMOUNT = 500 * 10 ** 18;

    mapping(address => bool) public hasClaimed;

    event AirdropClaimed(address indexed wallet, uint256 amount);

    constructor(address _qdAddress, address _signerAuthority) EIP712("CoreAirdrop", "1") {
        require(_qdAddress != address(0), "Invalid token address");
        require(_signerAuthority != address(0), "Invalid signer address");

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        coreDots = ICoreDots(_qdAddress);
        signerAuthority = _signerAuthority;
    }

    /**
     * @dev Claim the 500 QDs welcome bonus using an EIP-712 signature from the server.
     */
    function claimWelcomeBonus(bytes calldata signature) external {
        require(!hasClaimed[msg.sender], "CoreAirdrop: Wallet has already claimed the bonus");

        // Verify EIP-712 Signature
        bytes32 structHash = keccak256(abi.encode(CLAIM_TYPEHASH, msg.sender, CLAIM_AMOUNT));
        bytes32 digest = _hashTypedDataV4(structHash);
        
        address recoveredSigner = ECDSA.recover(digest, signature);
        require(recoveredSigner == signerAuthority, "CoreAirdrop: Invalid server signature");

        // Mark as claimed BEFORE external call
        hasClaimed[msg.sender] = true;

        emit AirdropClaimed(msg.sender, CLAIM_AMOUNT);

        // External call LAST
        coreDots.mint(msg.sender, CLAIM_AMOUNT);
    }

    function setSignerAuthority(address _newSigner) external onlyRole(ADMIN_ROLE) {
        require(_newSigner != address(0), "Invalid signer address");
        signerAuthority = _newSigner;
    }
}
