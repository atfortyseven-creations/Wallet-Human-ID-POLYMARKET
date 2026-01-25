// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// World ID Interface
interface IWorldID {
    function verifyProof(
        uint256 root,
        uint256 group_id,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

/**
 * @title NewsGovernance
 * @notice Sybil-resistant governance using Quadratic Voting and World ID.
 */
contract NewsGovernance is Ownable2Step, ReentrancyGuard {
    
    struct NewsItem {
        uint256 id;
        uint256 upvotes;
        uint256 downvotes;
        uint256 totalCostSpent;
    }

    IWorldID public immutable worldId;
    uint256 public immutable externalNullifier;
    uint256 public immutable groupId = 1; // Always 1 for World ID Orb

    mapping(uint256 => NewsItem) public newsItems;
    mapping(uint256 => bool) public nullifierHashes; // Prevents double voting per signal (optional, depends on logic)

    // For Quadratic Voting, we track votes per user per item
    // Mapping: nullifierHash -> newsId -> votesCast
    mapping(uint256 => mapping(uint256 => uint256)) public userVotes;

    event VoteCast(uint256 indexed newsId, uint256 votes, uint256 cost, bool isUpvote);

    constructor(address _worldId, string memory _appId, string memory _actionId) Ownable(msg.sender) {
        worldId = IWorldID(_worldId);
        externalNullifier = abi.decode(
            abi.encodePacked(keccak256(abi.encodePacked(
                keccak256(abi.encodePacked(_appId)),
                _actionId
            )))
        , (uint256));
    }

    /**
     * @notice Cast a Quadratic Vote on a news item.
     * @dev 1 Human = 1 Voting Wallet (via Nullifier).
     *      Cost = votes * votes. (e.g., 1 vote = 1 credit, 2 votes = 4 credits, etc.)
     *      For this MVP, we assume "credits" are just tracked or free limits for simplicity,
     *      or we could integrate an ERC20 token for the cost.
     *      Here: simpler implementation -> Sybil limit + QV weight.
     */
    function vote(
        uint256 newsId,
        uint256 quantity,
        bool isUpvote,
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external nonReentrant {
        require(quantity > 0, "Quantity must be > 0");

        // 1. Verify World ID Proof
        // We use newsId as part of the signal to ensure the proof is for THIS vote??
        // Or we treat the user as a verified entity generally.
        // Best practice: verify they are human, then check nullifier for rate limits.
        
        worldId.verifyProof(
            root,
            groupId,
            abi.decode(abi.encodePacked(msg.sender), (uint256)), // Signal = user address
            nullifierHash,
            externalNullifier,
            proof
        );

        // 2. Quadratic Cost Logic (Simplified for MVP: No Token Burn, just limited power)
        // In a real QV system, you pay Token Cost.
        // Here, we limit a user to X votes per newsId based on verified status?
        // Let's implement: Max 10 votes per news item per human.
        
        uint256 currentVotes = userVotes[nullifierHash][newsId];
        uint256 newTotal = currentVotes + quantity;
        require(newTotal * newTotal <= 100, "Max voting power exceeded (10 votes)");

        // 3. Update State
        if (isUpvote) {
            newsItems[newsId].upvotes += quantity;
        } else {
            newsItems[newsId].downvotes += quantity;
        }
        
        userVotes[nullifierHash][newsId] = newTotal;
        
        // Cost calculation for display/analytics
        uint256 cost = (newTotal * newTotal) - (currentVotes * currentVotes);
        newsItems[newsId].totalCostSpent += cost;

        emit VoteCast(newsId, quantity, cost, isUpvote);
    }
}
