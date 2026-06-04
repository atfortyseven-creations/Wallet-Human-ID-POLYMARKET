// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @title CoreDots (QDs)
 * @notice ERC-20 token for the Humanity Ledger ecosystem.
 * @dev Hard cap: 210,000,000 QDs total supply.
 *      Genesis allocation: 5,000,000 QDs to the System Vault wallet.
 *      Supports ERC-2612 Permit (gasless approve) and ERC-5805 Votes (on-chain governance).
 *      Minting is permissioned via MINTER_ROLE  only callable by the deployer or
 *      a future governance contract. The MAX_SUPPLY cap is enforced in every mint call.
 */
contract CoreDots is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ERC20Permit, ERC20Votes {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @dev 210,000,000 QDs  absolute hard cap, enforced on every mint.
    uint256 public constant MAX_SUPPLY = 210_000_000 * 10 ** 18;

    /// @dev System Vault wallet  receives the 5,000,000 QD genesis allocation.
    address public constant Private_VAULT = 0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a;

    /// @dev Genesis allocation to the System Vault at deploy time.
    uint256 public constant GENESIS_SUPPLY = 5_000_000 * 10 ** 18;

    constructor(address defaultAdmin)
        ERC20("CoreDots", "QDs")
        ERC20Permit("CoreDots")
    {
        require(defaultAdmin != address(0), "CoreDots: zero admin");

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);

        // Genesis mint: 5,000,000 QDs directly to the System Vault.
        // This is the initial circulating supply. Remaining ~205M can be minted
        // by MINTER_ROLE holders up to the 210M hard cap.
        _mint(Private_VAULT, GENESIS_SUPPLY);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice Mint additional QDs up to the 210M hard cap. Requires MINTER_ROLE.
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "CoreDots: 210M hard cap reached");
        _mint(to, amount);
    }

    //  Solidity overrides 

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
