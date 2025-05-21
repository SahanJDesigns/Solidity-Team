require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("solidity-coverage");
require("@semaphore-protocol/hardhat");

/** @type import('hardhat/config').HardhatUserConfig */
const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.23",
  defaultNetwork: "ganache",
  networks: {
    hardhat: {chainId: 1337},
    ganache: {
      url: API_URL || "http://127.0.0.1:7545", 
      accounts: [PRIVATE_KEY]
    }
  },
  typechain: {
    target: "ethers-v6"
  },
  sourcify: {
      enabled: true
  },
};
