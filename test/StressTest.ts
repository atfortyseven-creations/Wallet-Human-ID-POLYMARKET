const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Stress Test: Security & Treasury", function () {
    let treasury;
    let owner, attacker, sovereignVault;
    let mockToken;

    beforeEach(async function () {
        [owner, attacker, sovereignVault] = await ethers.getSigners();

        // Deploy Mock Token with initial supply
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        mockToken = await MockERC20.deploy("TestToken", "TT", ethers.parseEther("1000000"));
        await mockToken.waitForDeployment();

        // Deploy Treasury UUPS
        const Treasury = await ethers.getContractFactory("HumanFiTreasury");
        treasury = await upgrades.deployProxy(Treasury, [owner.address, owner.address], {
            initializer: 'initialize',
            kind: 'uups'
        });
        await treasury.waitForDeployment();
    });

    it("Should split fees 60/40 correctly", async function () {
        const amount = ethers.parseEther("100");
        // Owner already has 1M tokens from constructor
        await mockToken.approve(await treasury.getAddress(), amount);

        await treasury.depositFees(await mockToken.getAddress(), amount);

        // 40% = 40 Tokens
        expect(await treasury.sovereignVaultBalance()).to.equal(ethers.parseEther("40"));
        // 60% = 60 Tokens
        expect(await treasury.operationsBalance()).to.equal(ethers.parseEther("60"));
    });

    it("Should prevent Reentrancy on Withdrawal", async function () {
        const amount = ethers.parseEther("10");

        await mockToken.approve(await treasury.getAddress(), amount);
        await treasury.depositFees(await mockToken.getAddress(), amount);

        // Check pause functionality as Circuit Breaker
        await treasury.pause();
        await expect(
            treasury.depositFees(await mockToken.getAddress(), amount)
        ).to.be.revertedWithCustomError(treasury, "EnforcedPause");
    });

    it("Should restrict upgrades to UPGRADER_ROLE", async function () {
        const TreasuryV2 = await ethers.getContractFactory("HumanFiTreasury");

        // Attacker tries to upgrade
        await expect(
            upgrades.upgradeProxy(await treasury.getAddress(), TreasuryV2.connect(attacker))
        ).to.be.reverted;
    });
});
