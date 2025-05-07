const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CampaignFactory and Campaign", function () {
  let factory, campaignAddress, campaign;
  let owner, voter1, voter2;
  let startTime;

  const candidateNames = ["Alice", "Bob", "Charlie"];
  const campaignName = "Presidential Election";
  const campaignDesc = "Vote for the next president";
  const campaignDuration = 10; 
  const campaignDate = "2025-05-07";

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("CampaignFactory");
    factory = await Factory.deploy();
    await factory.deployed();

    const latestBlock = await ethers.provider.getBlock("latest");
    startTime = latestBlock.timestamp + 60; 

    await factory.createCampaign(
      candidateNames,
      campaignDuration,
      campaignName,
      campaignDesc,
      startTime,
      campaignDate
    );

    const deployedCampaigns = await factory.getDeployedCampaigns();
    campaignAddress = deployedCampaigns[0];

    campaign = await ethers.getContractAt("Campaign", campaignAddress);
  });

  it("should deploy a campaign and store metadata correctly", async () => {
    const meta = await factory.getCampaignById(0);
    expect(meta.campaignName).to.equal(campaignName);
    expect(meta.durationInMinutes).to.equal(campaignDuration);
  });

  it("should set correct owner and campaign info", async () => {
    expect(await campaign.getCampaignOwner()).to.equal(owner.address);
    expect(await campaign.getCampaignName()).to.equal(campaignName);
  });

  it("should have correct candidate names", async () => {
    const candidate = await campaign.getCandidate(0);
    expect(candidate[0]).to.equal("Alice");
  });

  it("should allow voting and count vote correctly", async function () {
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 60]);
    await ethers.provider.send("evm_mine");
    await campaign.connect(voter1).vote(1); // vote for Bob

    const candidate = await campaign.getCandidate(1);
    expect(candidate[1]).to.equal(1);
  });

  it("should not allow double voting", async function () {
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 60]);
    await ethers.provider.send("evm_mine");

    await campaign.connect(voter1).vote(1);
    await expect(campaign.connect(voter1).vote(1)).to.be.revertedWith("You have already voted.");
  });

  it("should not allow voting before start time", async function () {
    await expect(campaign.connect(voter1).vote(1)).to.be.revertedWith("Voting has not started yet.");
  });

  it("should return total number of votes", async function () {
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 60]);
    await ethers.provider.send("evm_mine");

    await campaign.connect(voter1).vote(0);
    await campaign.connect(voter2).vote(2);

    const totalVotes = await campaign.getVotersCount();
    expect(totalVotes).to.equal(2);
  });
});
