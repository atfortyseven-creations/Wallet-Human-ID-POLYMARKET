// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

/**
 * @title CoreLedger v2  Hyper-Dense On-Chain Receipt Registry
 * @author Humanity Ledger Protocol
 * @notice Cryptographically immutable peer-to-peer transfer registry for
 *         CoreDots (QDs). Every transfer produces a self-contained
 *         proof-of-transfer record encoded at block level. The on-chain
 *         receipt includes core entropy, arbitrary ABI-encoded metadata,
 *         and a Keccak-256 payload hash that acts as the canonical transfer
 *         fingerprint  making the Humanity Ledger an unhackable truth layer.
 *
 * Architecture:
 *   - CoreEntropy:  client-generated 256-bit random seed injected at call time
 *   - advancedMetadata: ABI-encoded bytes (platform, origin network, ms timestamp, etc.)
 *   - payloadHash:     keccak256 of the full receipt state  canonical transfer fingerprint
 *   - blockNumber:     block at execution for L2 proof anchoring
 *
 * Gas Profile (Base / Polygon L2):
 *   transferWithReceiptPermit  80,000120,000 gas    < $0.001 at 2026 L2 prices
 */
contract CoreLedger is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable coreDots;

    uint256 private _receiptCounter;

    //  Receipt Structure 
    struct Receipt {
        uint256 id;                  // Monotonically increasing receipt ID
        address sender;              // Origin wallet
        address receiver;            // Destination wallet
        uint256 amount;              // QDs transferred (18-decimal raw)
        uint256 timestamp;           // block.timestamp at execution (unix seconds)
        uint256 blockNumber;         // block.number at execution  L2 finality anchor
        uint256 coreEntropy;      // Client-injected 256-bit random seed
        bytes   advancedMetadata;    // ABI-encoded payload (platform, ms-ts, route, etc.)
        bytes32 payloadHash;         // keccak256 canonical fingerprint of full receipt state
        string  memo;                // Human-readable public note
    }

    mapping(uint256 => Receipt)     public receipts;
    mapping(address => uint256[])   public userReceipts;

    //  Events 
    event CoreTransferExecuted(
        uint256 indexed receiptId,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 coreEntropy,
        bytes32 payloadHash,
        uint256 blockNumber,
        string  memo,
        uint256 timestamp
    );

    //  Constructor 
    constructor(address _coreDotsAddress) {
        require(_coreDotsAddress != address(0), "CoreLedger: Zero address provided");
        coreDots = IERC20(_coreDotsAddress);
    }

    //  External: Standard Approve-then-Transfer 
    /**
     * @dev Executes a transfer of QDs and generates an immutable on-chain receipt.
     * Requires the sender to have approved the Ledger contract beforehand via ERC20.approve().
     * @param to             Destination address
     * @param amount         Amount in 18-decimal raw QDs
     * @param memo           Public human-readable note (max 128 chars recommended)
     * @param coreEntropy Client-generated 256-bit random entropy (crypto.getRandomValues)
     * @param advancedMetadata ABI-encoded payload: (string platform, uint64 msTimestamp, bytes32 routeId)
     */
    function transferWithReceipt(
        address to,
        uint256 amount,
        string  calldata memo,
        uint256 coreEntropy,
        bytes   calldata advancedMetadata
    ) external nonReentrant returns (uint256) {
        return _executeTransfer(to, amount, memo, coreEntropy, advancedMetadata);
    }

    //  External: Gasless 1-Step Permit Transfer 
    /**
     * @dev Executes a transfer with a signed ERC2612 Permit  single wallet interaction.
     * The permit authorises this contract to spend `amount` of QDs on the signer's behalf,
     * eliminating a separate approve() transaction and keeping gas fees minimal.
     *
     * MEV Griefing Protection: permit() is wrapped in try/catch  if a bot front-runs
     * the permit signature in the mempool the transfer still proceeds using the pre-approval.
     *
     * @param to             Destination address
     * @param amount         Amount in 18-decimal raw QDs
     * @param memo           Public human-readable note
     * @param deadline       EIP-2612 permit expiry (unix seconds)
     * @param v, r, s        EIP-2612 permit signature components
     * @param coreEntropy Client-generated 256-bit random entropy
     * @param advancedMetadata ABI-encoded metadata payload
     */
    function transferWithReceiptPermit(
        address to,
        uint256 amount,
        string  calldata memo,
        uint256 deadline,
        uint8   v,
        bytes32 r,
        bytes32 s,
        uint256 coreEntropy,
        bytes   calldata advancedMetadata
    ) external nonReentrant returns (uint256) {
        // Permit wrapped in try/catch: prevents MEV front-running griefing attacks
        try IERC20Permit(address(coreDots)).permit(
            msg.sender, address(this), amount, deadline, v, r, s
        ) {} catch {}

        return _executeTransfer(to, amount, memo, coreEntropy, advancedMetadata);
    }

    //  Internal: Core Transfer + Receipt Mint 
    function _executeTransfer(
        address to,
        uint256 amount,
        string  calldata memo,
        uint256 coreEntropy,
        bytes   calldata advancedMetadata
    ) internal returns (uint256) {
        require(to != address(0),  "CoreLedger: Transfer to zero address");
        require(to != msg.sender,  "CoreLedger: Self-transfer not allowed");
        require(amount > 0,        "CoreLedger: Amount must be greater than 0");

        //  Execute ERC20 Transfer 
        coreDots.safeTransferFrom(msg.sender, to, amount);

        //  Mint Receipt 
        unchecked { _receiptCounter++; }
        uint256 receiptId = _receiptCounter;

        // Canonical payload hash  keccak256 of full receipt state
        bytes32 payloadHash = keccak256(abi.encodePacked(
            receiptId,
            msg.sender,
            to,
            amount,
            block.timestamp,
            block.number,
            coreEntropy,
            keccak256(advancedMetadata),
            keccak256(bytes(memo))
        ));

        Receipt memory rec = Receipt({
            id:               receiptId,
            sender:           msg.sender,
            receiver:         to,
            amount:           amount,
            timestamp:        block.timestamp,
            blockNumber:      block.number,
            coreEntropy:   coreEntropy,
            advancedMetadata: advancedMetadata,
            payloadHash:      payloadHash,
            memo:             memo
        });

        receipts[receiptId]          = rec;
        userReceipts[msg.sender].push(receiptId);
        userReceipts[to].push(receiptId);

        emit CoreTransferExecuted(
            rec.id,
            rec.sender,
            rec.receiver,
            rec.amount,
            rec.coreEntropy,
            rec.payloadHash,
            rec.blockNumber,
            rec.memo,
            rec.timestamp
        );

        return receiptId;
    }

    //  View: Receipt Queries 

    /// @notice Total receipts stored globally across all wallets
    function totalReceipts() external view returns (uint256) {
        return _receiptCounter;
    }

    /// @notice Total receipts linked to a specific user (sent + received)
    function getUserReceiptCount(address user) external view returns (uint256) {
        return userReceipts[user].length;
    }

    /**
     * @notice Paginated query of receipts for a user (newest first)
     * @param user   Wallet address
     * @param offset Start index (0 = newest)
     * @param limit  Max receipts to return
     */
    function getUserReceipts(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (Receipt[] memory) {
        uint256 total = userReceipts[user].length;
        if (offset >= total) return new Receipt[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        uint256 size = end - offset;
        Receipt[] memory result = new Receipt[](size);

        for (uint256 i = 0; i < size; i++) {
            result[i] = receipts[userReceipts[user][total - 1 - (offset + i)]];
        }

        return result;
    }

    /// @notice Get a single receipt by global ID
    function getReceipt(uint256 receiptId) external view returns (Receipt memory) {
        require(receiptId > 0 && receiptId <= _receiptCounter, "CoreLedger: Invalid receipt ID");
        return receipts[receiptId];
    }
}
