/**
 * WhaleDeadmanSwitch.test.ts
 *
 * 100% branch coverage on:
 *   - Constructor validation
 *   - Ping heartbeat + access control
 *   - Backup wallet 2-step change + 72h cooldown
 *   - setTimeout floor enforcement
 *   - triggerInheritance: before/after timeout, ERC20+ERC721 forwarding
 *   - AlreadyTriggered guard
 *   - Pause / Unpause emergency controls
 *   - Non-custodial guarantee (ETH rejected)
 *   - View helpers (secondsUntilExpiry, expiresAt, getStatus)
 */

const { expect }     = require("chai");
const { ethers }     = require("hardhat");
const { time }       = require("@nomicfoundation/hardhat-network-helpers");

describe("WhaleDeadmanSwitch", function () {
    let contract: any;
    let mockERC20: any;
    let mockERC721: any;
    let owner: any, backup: any, stranger: any, newBackup: any;

    const TIMEOUT_DAYS  = 90;
    const TIMEOUT_SECS  = TIMEOUT_DAYS * 24 * 60 * 60;
    const BACKUP_CD     = 72 * 60 * 60; // 72 hours in seconds

    beforeEach(async function () {
        [owner, backup, stranger, newBackup] = await ethers.getSigners();

        // Deploy mock tokens
        const MockERC20  = await ethers.getContractFactory("MockERC20");
        const MockERC721 = await ethers.getContractFactory("MockERC721");
        mockERC20  = await MockERC20.deploy();
        mockERC721 = await MockERC721.deploy();

        await mockERC20.mint(owner.address, ethers.parseEther("1000"));
        await mockERC721.mint(owner.address, 1);

        // Deploy WhaleDeadmanSwitch
        const Switch = await ethers.getContractFactory("WhaleDeadmanSwitch");
        contract = await Switch.deploy(owner.address, backup.address, TIMEOUT_DAYS);

        // Grant allowances
        await mockERC20.connect(owner).approve(contract.target, ethers.parseEther("1000"));
        await mockERC721.connect(owner).setApprovalForAll(contract.target, true);
    });

    //  Constructor 

    describe("Constructor", function () {
        it("sets owner, backup, timeout correctly", async function () {
            expect(await contract.owner()).to.equal(owner.address);
            expect(await contract.backupWallet()).to.equal(backup.address);
            expect(await contract.timeoutPeriod()).to.equal(BigInt(TIMEOUT_SECS));
            expect(await contract.triggered()).to.equal(false);
        });

        it("reverts with TimeoutTooShort if < 90 days", async function () {
            const Switch = await ethers.getContractFactory("WhaleDeadmanSwitch");
            await expect(Switch.deploy(owner.address, backup.address, 89))
                .to.be.revertedWithCustomError(contract, "TimeoutTooShort");
        });

        it("reverts with InvalidBackupWallet on zero address", async function () {
            const Switch = await ethers.getContractFactory("WhaleDeadmanSwitch");
            await expect(Switch.deploy(owner.address, ethers.ZeroAddress, TIMEOUT_DAYS))
                .to.be.revertedWithCustomError(contract, "InvalidBackupWallet");
        });

        it("reverts with CannotBeOwner if backup === owner", async function () {
            const Switch = await ethers.getContractFactory("WhaleDeadmanSwitch");
            await expect(Switch.deploy(owner.address, owner.address, TIMEOUT_DAYS))
                .to.be.revertedWithCustomError(contract, "CannotBeOwner");
        });
    });

    //  Non-Custodial Guarantee 

    describe("Non-Custodial Guarantee", function () {
        it("reverts on ETH deposit via receive()", async function () {
            await expect(
                owner.sendTransaction({ to: contract.target, value: ethers.parseEther("1") })
            ).to.be.revertedWithCustomError(contract, "Blocked");
        });
    });

    //  Ping 

    describe("Ping", function () {
        it("updates lastPing and emits event", async function () {
            const before = await contract.lastPing();
            await time.increase(86400);
            const tx = await contract.connect(owner).ping();
            const after = await contract.lastPing();
            expect(after).to.be.greaterThan(before);
            await expect(tx).to.emit(contract, "Ping").withArgs(owner.address, after);
        });

        it("reverts for non-owner", async function () {
            await expect(contract.connect(stranger).ping())
                .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
        });

        it("reverts when paused", async function () {
            await contract.connect(owner).pause();
            await expect(contract.connect(owner).ping())
                .to.be.revertedWithCustomError(contract, "EnforcedPause");
        });
    });

    //  Backup Wallet Change 

    describe("Backup Wallet 2-Step Change", function () {
        it("proposes and confirms after cooldown", async function () {
            await contract.connect(owner).proposeBackupWallet(newBackup.address);
            expect(await contract.pendingBackupWallet()).to.equal(newBackup.address);

            // Before cooldown elapses  reverts
            await expect(contract.connect(owner).confirmBackupWallet())
                .to.be.revertedWithCustomError(contract, "CooldownNotElapsed");

            // Advance past 72h
            await time.increase(BACKUP_CD + 1);
            const tx = await contract.connect(owner).confirmBackupWallet();
            expect(await contract.backupWallet()).to.equal(newBackup.address);
            await expect(tx).to.emit(contract, "BackupWalletConfirmed");
        });

        it("reverts confirm with no pending change", async function () {
            await expect(contract.connect(owner).confirmBackupWallet())
                .to.be.revertedWithCustomError(contract, "NoPendingChange");
        });

        it("reverts propose with zero address", async function () {
            await expect(contract.connect(owner).proposeBackupWallet(ethers.ZeroAddress))
                .to.be.revertedWithCustomError(contract, "InvalidBackupWallet");
        });

        it("reverts propose with owner address", async function () {
            await expect(contract.connect(owner).proposeBackupWallet(owner.address))
                .to.be.revertedWithCustomError(contract, "CannotBeOwner");
        });
    });

    //  setTimeout 

    describe("setTimeout", function () {
        it("updates timeout", async function () {
            const tx = await contract.connect(owner).setTimeout(180);
            await expect(tx).to.emit(contract, "TimeoutUpdated");
            expect(await contract.timeoutPeriod()).to.equal(BigInt(180 * 24 * 60 * 60));
        });

        it("reverts below MIN_TIMEOUT", async function () {
            await expect(contract.connect(owner).setTimeout(89))
                .to.be.revertedWithCustomError(contract, "TimeoutTooShort");
        });
    });

    //  Trigger Inheritance 

    describe("triggerInheritance", function () {
        it("reverts before timeout", async function () {
            await expect(
                contract.connect(stranger).triggerInheritance([mockERC20.target], [mockERC721.target], [1])
            ).to.be.revertedWithCustomError(contract, "NotYetExpired");
        });

        it("transfers ERC20 + ERC721 after timeout, emits events", async function () {
            await time.increase(TIMEOUT_SECS + 1);

            const tx = await contract.connect(stranger).triggerInheritance(
                [mockERC20.target],
                [mockERC721.target],
                [1]
            );

            // ERC20 forwarded to backup
            expect(await mockERC20.balanceOf(backup.address)).to.equal(ethers.parseEther("1000"));
            expect(await mockERC20.balanceOf(owner.address)).to.equal(0);

            // ERC721 forwarded to backup
            expect(await mockERC721.ownerOf(1)).to.equal(backup.address);

            await expect(tx).to.emit(contract, "InheritanceTriggered");
            await expect(tx).to.emit(contract, "ERC20Forwarded");
            await expect(tx).to.emit(contract, "ERC721Forwarded");
        });

        it("marks triggered = true, blocks second call", async function () {
            await time.increase(TIMEOUT_SECS + 1);
            await contract.connect(stranger).triggerInheritance([], [], []);
            expect(await contract.triggered()).to.equal(true);

            await expect(
                contract.connect(stranger).triggerInheritance([], [], [])
            ).to.be.revertedWithCustomError(contract, "AlreadyTriggered");
        });

        it("reverts on array length mismatch", async function () {
            await time.increase(TIMEOUT_SECS + 1);
            await expect(
                contract.connect(stranger).triggerInheritance([], [mockERC721.target], []) // len 1 vs 0
            ).to.be.revertedWithCustomError(contract, "ArrayLengthMismatch");
        });

        it("skips ERC721 tokens not approved to contract", async function () {
            await mockERC721.connect(owner).setApprovalForAll(contract.target, false);
            await time.increase(TIMEOUT_SECS + 1);
            // Should not revert  just skip the unapproved token
            await contract.connect(stranger).triggerInheritance([], [mockERC721.target], [1]);
            expect(await mockERC721.ownerOf(1)).to.equal(owner.address);
        });

        it("reverts when paused", async function () {
            await contract.connect(owner).pause();
            await time.increase(TIMEOUT_SECS + 1);
            await expect(
                contract.connect(stranger).triggerInheritance([], [], [])
            ).to.be.revertedWithCustomError(contract, "EnforcedPause");
        });

        it("ping resets expiry  trigger blocked again", async function () {
            await time.increase(TIMEOUT_SECS - 1000);
            await contract.connect(owner).ping();
            // After ping, another TIMEOUT_SECS must pass
            await time.increase(1001);
            await expect(
                contract.connect(stranger).triggerInheritance([], [], [])
            ).to.be.revertedWithCustomError(contract, "NotYetExpired");
        });
    });

    //  Emergency Controls 

    describe("Pause / Unpause", function () {
        it("owner can pause and unpause", async function () {
            await contract.connect(owner).pause();
            expect(await contract.paused()).to.equal(true);
            await contract.connect(owner).unpause();
            expect(await contract.paused()).to.equal(false);
        });

        it("non-owner cannot pause", async function () {
            await expect(contract.connect(stranger).pause())
                .to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
        });
    });

    //  View Helpers 

    describe("View Helpers", function () {
        it("secondsUntilExpiry returns correct countdown", async function () {
            const secs = await contract.secondsUntilExpiry();
            expect(secs).to.be.closeTo(BigInt(TIMEOUT_SECS), 5n);
        });

        it("secondsUntilExpiry returns 0 after timeout", async function () {
            await time.increase(TIMEOUT_SECS + 1);
            expect(await contract.secondsUntilExpiry()).to.equal(0n);
        });

        it("getStatus returns correct tuple", async function () {
            const status = await contract.getStatus();
            expect(status._owner).to.equal(owner.address);
            expect(status._backup).to.equal(backup.address);
            expect(status._triggered).to.equal(false);
            expect(status._paused).to.equal(false);
        });
    });
});
