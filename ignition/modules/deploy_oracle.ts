import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WhaleKnowledgeGraphModule = buildModule("WhaleKnowledgeGraphModule", (m) => {
  // Deploy the Knowledge Graph contract
  const oracle = m.contract("WhaleKnowledgeGraph", []);

  return { oracle };
});

export default WhaleKnowledgeGraphModule;

