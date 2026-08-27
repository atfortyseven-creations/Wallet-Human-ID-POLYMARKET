import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LedgerKnowledgeGraphModule = buildModule("LedgerKnowledgeGraphModule", (m) => {
  // Deploy the Knowledge Graph contract
  const oracle = m.contract("LedgerKnowledgeGraph", []);

  return { oracle };
});

export default LedgerKnowledgeGraphModule;

