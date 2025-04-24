const hre = require("hardhat");

async function main() {
  const CampaignFactory = await hre.ethers.getContractFactory("CampaignFactory");
  const factory = await CampaignFactory.deploy();
  await factory.deployed();
  console.log("✅ CampaignFactory deployed at:", factory.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});