require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            { version: "0.8.22" },
            { version: "0.8.20" },
            { version: "0.5.17" },
            { version: "0.6.12" },
        ],
    },
    networks: {
        hardhat: {
            forking: {
                url: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
                blockNumber: 9000000,
            },
            chainId: 8453,
        },
        optimismSepolia: {
            url: "https://sepolia.optimism.io",
            accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length >= 64) ? [process.env.PRIVATE_KEY] : [],
        },
        baseSepolia: {
            url: process.env.BASE_SEPOLIA_RPC || process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
            accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length >= 64) ? [process.env.PRIVATE_KEY] : [],
        },
    },
    gasReporter: {
        enabled: false,
    },
};
