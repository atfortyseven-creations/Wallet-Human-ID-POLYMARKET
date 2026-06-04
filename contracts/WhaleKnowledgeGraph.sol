// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title WhaleKnowledgeGraph
 * @dev Decentralized Oracle storing On-Chain Forensics data 
 * about Whale Entities, their Risk Score and associated Categories.
 * Only the Root Intel Node (Admin) can append or modify data to maintain accuracy.
 */
contract WhaleKnowledgeGraph is AccessControl {
    bytes32 public constant INTEL_NODE_ROLE = keccak256("INTEL_NODE_ROLE");
    
    // Multisig Quorum Requirements
    uint256 public requiredSignatures = 3;
    mapping(bytes32 => mapping(address => bool)) public hasSigned;
    mapping(bytes32 => uint256) public signatureCount;

    struct EntityAnalytics {
        string name;          // e.g., "Binance Hot Wallet 6"
        string category;      // e.g., "Exchange", "OTC Bot", "MEV Searcher"
        uint8 riskScore;      // 0 to 100 (100 = High Risk / Dump trajectory)
        uint8 confidence;     // 0 to 100 (Algorithm confidence)
        uint256 lastUpdated;  // Timestamp
        bool exists;          // True if the entity has been indexed
    }

    // Mapping from an Ethereum address to its Analytics Profile
    mapping(address => EntityAnalytics) private _knowledgeGraph;

    // Events for off-chain indexing (TheGraph / WebSockets)
    event EntityUpdated(address indexed targetProxy, string name, string category, uint8 riskScore);
    event EntityRemoved(address indexed targetProxy);

    /**
     * @dev Sets up the initial `DEFAULT_ADMIN_ROLE` and `INTEL_NODE_ROLE`
     * for the deployer.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(INTEL_NODE_ROLE, msg.sender);
    }

    /**
     * @dev Updates or creates an Analytics Profile for a specific address.
     * Restricted to addresses holding the `INTEL_NODE_ROLE`.
     * 
     * @param target The tracked blockchain address
     * @param name Human-readable name
     * @param category Entity classification
     * @param riskScore Scale 0-100
     * @param confidence Algorithm precision scale 0-100
     */
    function updateEntityAnalytics(
        address target,
        string calldata name,
        string calldata category,
        uint8 riskScore,
        uint8 confidence
    ) external onlyRole(INTEL_NODE_ROLE) {
        require(riskScore <= 100, "Risk score must be <= 100");
        require(confidence <= 100, "Confidence score must be <= 100");

        // Multisig Validation
        bytes32 updateHash = keccak256(abi.encodePacked(target, name, category, riskScore, confidence, block.timestamp / 1 hours));
        require(!hasSigned[updateHash][msg.sender], "Already signed");
        
        hasSigned[updateHash][msg.sender] = true;
        signatureCount[updateHash]++;
        
        if (signatureCount[updateHash] >= requiredSignatures) {
            _knowledgeGraph[target] = EntityAnalytics({
                name: name,
                category: category,
                riskScore: riskScore,
                confidence: confidence,
                lastUpdated: block.timestamp,
                exists: true
            });

            emit EntityUpdated(target, name, category, riskScore);
        }
    }

    /**
     * @dev Removes an entity from the Knowledge Graph.
     */
    function removeEntity(address target) external onlyRole(INTEL_NODE_ROLE) {
        require(_knowledgeGraph[target].exists, "Entity does not exist");
        delete _knowledgeGraph[target];
        emit EntityRemoved(target);
    }

    /**
     * @dev Public read function to fetch Analytics on any address.
     * Returns an empty struct if the address hasn't been tracked.
     */
    function getEntityAnalytics(address target) 
        external 
        view 
        returns (
            string memory name,
            string memory category,
            uint8 riskScore,
            uint8 confidence,
            uint256 lastUpdated,
            bool exists
        ) 
    {
        EntityAnalytics memory intel = _knowledgeGraph[target];
        return (
            intel.name,
            intel.category,
            intel.riskScore,
            intel.confidence,
            intel.lastUpdated,
            intel.exists
        );
    }

    /**
     * @dev Batch fetch multiple entities to save RPC calls from the frontend
     */
    function getBatchEntityAnalytics(address[] calldata targets) 
        external 
        view 
        returns (EntityAnalytics[] memory) 
    {
        EntityAnalytics[] memory batch = new EntityAnalytics[](targets.length);
        for (uint256 i = 0; i < targets.length; i++) {
            batch[i] = _knowledgeGraph[targets[i]];
        }
        return batch;
    }
}

