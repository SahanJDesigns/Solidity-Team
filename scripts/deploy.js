const hre = require("hardhat");

const { SEMAPHORE_CONTRACT_ADDRESS } = process.env;

async function main() {
  // Deploy Semaphore contract
  const semaphoreAddress = SEMAPHORE_CONTRACT_ADDRESS;
  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const factory = await CampaignFactory.deploy(semaphoreAddress);
  
  // In ethers v6, we need to wait for the transaction to be mined
  await factory.waitForDeployment();
  
  // Get the contract address
  const factoryAddress = await factory.getAddress();
  console.log("✅ CampaignFactory deployed at:", factoryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
