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
  const campaignDate = new Date().toISOString().split("T")[0];

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

  it("should deploy a campaign and store metadata correctly", async function () {
    const meta = await factory.getCampaignById(0);
    expect(meta.campaignName).to.equal(campaignName);
    expect(meta.durationInMinutes).to.equal(campaignDuration);
  });

  it("should set correct owner and campaign info", async function () {
    expect(await campaign.getCampaignOwner()).to.equal(owner.address);
    expect(await campaign.getCampaignName()).to.equal(campaignName);
  });

  it("should have correct candidate names", async function () {
    const candidate = await campaign.getCandidate(0);
    expect(candidate[0]).to.equal("Alice");
  });

  it("should allow voting and count vote correctly", async function () {
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 60]);
    await ethers.provider.send("evm_mine");

    await campaign.connect(voter1).vote(1);
    const candidate = await campaign.getCandidate(1);
    expect(candidate[1]).to.equal(1);
  });

  it("should not allow double voting", async function () {
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 60]);
    await ethers.provider.send("evm_mine");

    await campaign.connect(voter1).vote(0);
    await expect(campaign.connect(voter1).vote(1)).to.be.revertedWith("You have already voted.");
  });

  it("should not allow voting before start time", async function () {
    await expect(campaign.connect(voter2).vote(1)).to.be.revertedWith("Voting has not started yet.");
  });

  it("should return total number of votes", async function () {
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 60]);
    await ethers.provider.send("evm_mine");

    await campaign.connect(voter1).vote(0);
    await campaign.connect(voter2).vote(2);

    const totalVotes = await campaign.getVotersCount();
    expect(totalVotes).to.equal(2);
  });

  it("should have correct number of candidates", async function () {
    const count = await campaign.getCandidatesCount();
    expect(count).to.equal(candidateNames.length);
  });

  it("should return correct campaign metadata", async function () {
    const meta = await factory.getCampaignById(0);
    expect(meta.campaignName).to.equal(campaignName);
    expect(meta.date).to.equal(campaignDate);
  });

  it("should return correct voting status and remaining time", async function () {
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime - 30]);
    await ethers.provider.send("evm_mine");
    expect(await campaign.getVotingStatus()).to.equal(false);

    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 30]);
    await ethers.provider.send("evm_mine");
    expect(await campaign.getVotingStatus()).to.equal(true);

    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + campaignDuration * 60 + 10]);
    await ethers.provider.send("evm_mine");
    expect(await campaign.getVotingStatus()).to.equal(false);
    expect(await campaign.getRemainingTime()).to.equal(0);
  });

  it("should only allow owner to add candidate", async function () {
    await expect(
      campaign.connect(voter1).addCandidate("Diana")
    ).to.be.revertedWith("Only owner can call this function");

    await campaign.connect(owner).addCandidate("Diana");
    const count = await campaign.getCandidatesCount();
    expect(count).to.equal(candidateNames.length + 1);
  });

  it("should verify isOwner and isVoted functions", async function () {
    expect(await campaign.isOwner(owner.address)).to.equal(true);
    expect(await campaign.isOwner(voter1.address)).to.equal(false);

    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 60]);
    await ethers.provider.send("evm_mine");
    await campaign.connect(voter1).vote(2);
    expect(await campaign.isVoted(voter1.address)).to.equal(true);
  });

  it("should reject invalid candidate index", async function () {
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 60]);
    await ethers.provider.send("evm_mine");
    await expect(campaign.connect(voter2).vote(99)).to.be.revertedWith("Invalid candidate index.");
  });

  it("should return all votes of candidates correctly", async function () {
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTime + 60]);
    await ethers.provider.send("evm_mine");
    await campaign.connect(voter1).vote(0);
    const allVotes = await campaign.getAllVotesOfCandidates();
    expect(allVotes[0].voteCount).to.equal(1);
  });

  it("should return correct start and end times", async function () {
    expect(await campaign.getStartTime()).to.equal(startTime);
    const expectedEnd = startTime + campaignDuration * 60;
    expect(await campaign.getEndTime()).to.equal(expectedEnd);
  });

  it("should return campaign duration", async function () {
    expect(await campaign.getCampaignDuration()).to.equal(campaignDuration);
  });

  it("should return campaign number", async function () {
    expect(await campaign.getCampaignNumber()).to.equal(0); 
  });

  it("should return total campaign count in factory", async function () {
    const count = await factory.getCampaignCount();
    expect(count).to.equal(1);
  });

  it("should return correct campaign address by ID", async function () {
    const addr = await factory.getCampaignAddressById(0);
    expect(addr).to.equal(campaignAddress);
  });
});
