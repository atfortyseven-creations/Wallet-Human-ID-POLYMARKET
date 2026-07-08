require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.24",
    networks: {
        hardhat: {
            forking: {
                url: process.env.BASE_MAINNET_RPC || "https://mainnet.base.org",
                blockNumber: 12000000,
                enabled: true
            },
            chainId: 8453
        },
        base_sepolia: {
            url: process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
        }
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        gasPrice: 0.001
    }
};
