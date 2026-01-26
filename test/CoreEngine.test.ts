import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

describe("Human-Fi Core Engine Tests", function () {

    // Fixture for reusable test setup
    async function deployFixture() {
        const [owner, user1, user2, treasury] = await ethers.getSigners();

        // 1. Deploy Mock Tokens
        const ERC20Factory = await ethers.getContractFactory("MockERC20");
        const wldToken = await ERC20Factory.deploy("Worldcoin", "WLD");
        const usdcToken = await ERC20Factory.deploy("USDC", "USDC");
        await wldToken.waitForDeployment();
        await usdcToken.waitForDeployment();

        // 2. Deploy Mock DEX and CTF
        const MockRouterFactory = await ethers.getContractFactory("MockSwapRouter");
        const swapRouter = await MockRouterFactory.deploy(await usdcToken.getAddress());

        const MockCTFFactory = await ethers.getContractFactory("MockCTFExchange");
        const ctfExchange = await MockCTFFactory.deploy(await usdcToken.getAddress());

        // 3. Deploy Zap Contract
        const ZapFactory = await ethers.getContractFactory("ZapContract");
        const zapContract = await ZapFactory.deploy(
            await wldToken.getAddress(),
            await usdcToken.getAddress(),
            await ctfExchange.getAddress(),
            await swapRouter.getAddress(),
            ethers.ZeroAddress, // No permit2 for basic tests
            treasury.address
        );
        await zapContract.waitForDeployment();

        // 4. Deploy Governance Contract
        const GovFactory = await ethers.getContractFactory("MarketGovernance");
        const governance = await GovFactory.deploy(await usdcToken.getAddress());
        await governance.waitForDeployment();

        return {
            zapContract, governance, wldToken, usdcToken, swapRouter, ctfExchange,
            owner, user1, user2, treasury
        };
    }

    describe("ZapContract Security & Atomicity", function () {

        it("Should execute atomic zap successfully", async function () {
            const { zapContract, wldToken, user1 } = await loadFixture(deployFixture);

            // Setup: Mint WLD to user
            await wldToken.mint(user1.address, ethers.parseEther("100"));
            await wldToken.connect(user1).approve(await zapContract.getAddress(), ethers.parseEther("100"));

            // Execute Zap
            const amountWLD = ethers.parseEther("10");
            const minUSDC = ethers.parseUnits("9", 6); // Mock swap is 1:1 but with decimals diff
            const conditionId = ethers.id("condition1");
            const outcomeIndex = 1;
            const minShares = 5;
            const deadline = Math.floor(Date.now() / 1000) + 3600;

            // We expect the mock router to return USDC and CTF to mint shares
            // Note: In a real fork test we'd check balance changes accurately.
            // Here we rely on the contract validation not reverting.

            await expect(zapContract.connect(user1).zapWLDToBinaryOutcome(
                amountWLD,
                minUSDC,
                conditionId,
                outcomeIndex,
                minShares,
                deadline
            )).to.not.be.reverted;
        });

        it("Should revert if slippage is too high (minUSDC check)", async function () {
            const { zapContract, wldToken, user1 } = await loadFixture(deployFixture);

            await wldToken.mint(user1.address, ethers.parseEther("100"));
            await wldToken.connect(user1).approve(await zapContract.getAddress(), ethers.parseEther("100"));

            const amountWLD = ethers.parseEther("10");
            const unrealisticMinUSDC = ethers.parseUnits("1000000", 6); // Impossible amount

            await expect(zapContract.connect(user1).zapWLDToBinaryOutcome(
                amountWLD,
                unrealisticMinUSDC,
                ethers.id("cond"),
                1,
                0,
                Math.floor(Date.now() / 1000) + 3600
            )).to.be.revertedWithCustomError(zapContract, "SlippageTooHigh");
        });
    });

    describe("MarketGovernance Merkle Claims", function () {

        it("Should allow valid Merkle claim", async function () {
            const { governance, usdcToken, owner, user1 } = await loadFixture(deployFixture);

            // 1. Setup Merkle Tree
            const amount = ethers.parseUnits("50", 6);
            const elements = [
                ethers.solidityPacked(["address", "uint256"], [user1.address, amount])
            ];
            const leaves = elements.map(e => keccak256(e));
            const tree = new MerkleTree(leaves, keccak256, { sort: true });
            const root = tree.getHexRoot();
            const proof = tree.getHexProof(leaves[0]);

            // 2. Fund contract
            await usdcToken.mint(await governance.getAddress(), ethers.parseUnits("1000", 6));

            // 3. Publish Root
            await governance.publishMerkleRoot(root, amount);

            // 4. Claim
            // Period is 1 (first period)
            await expect(governance.connect(user1).claimRoyalties(1, amount, proof))
                .to.emit(governance, "RoyaltiesClaimed")
                .withArgs(1, user1.address, amount);

            // Verify balance
            expect(await usdcToken.balanceOf(user1.address)).to.equal(amount);
        });

        it("Should prevent double claims (Replay Attack)", async function () {
            const { governance, user1 } = await loadFixture(deployFixture);

            // Setup identical to previous test...
            const amount = ethers.parseUnits("50", 6);
            const elements = [ethers.solidityPacked(["address", "uint256"], [user1.address, amount])];
            const tree = new MerkleTree(elements.map(e => keccak256(e)), keccak256, { sort: true });
            const proof = tree.getHexProof(keccak256(elements[0]));

            await governance.publishMerkleRoot(tree.getHexRoot(), amount);
            await governance.connect(user1).claimRoyalties(1, amount, proof);

            // Attempt second claim
            await expect(
                governance.connect(user1).claimRoyalties(1, amount, proof)
            ).to.be.revertedWithCustomError(governance, "AlreadyClaimed");
        });

        it("Should reject invalid proofs", async function () {
            const { governance, user1, user2 } = await loadFixture(deployFixture);

            const amount = ethers.parseUnits("50", 6);
            const elements = [ethers.solidityPacked(["address", "uint256"], [user1.address, amount])];
            const tree = new MerkleTree(elements.map(e => keccak256(e)), keccak256, { sort: true });

            await governance.publishMerkleRoot(tree.getHexRoot(), amount);

            // User 2 tries to claim User 1's proof
            const proof = tree.getHexProof(keccak256(elements[0]));

            await expect(
                governance.connect(user2).claimRoyalties(1, amount, proof)
            ).to.be.revertedWithCustomError(governance, "InvalidProof");
        });
    });
});

// Mock Contracts for Testing (Internal use)
// Usually these would be in separate files contracts/mocks/
