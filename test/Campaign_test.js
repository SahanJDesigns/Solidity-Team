const { expect } = require("chai");
const { ethers } = require("hardhat");

// Mock ISemaphore interface for testing
let mockCampaignAddress;

async function deployMockCampaign() {
  const MockSemaphore = await ethers.getContractFactory("Campaign");
  const mockSemaphore = await MockSemaphore.deploy();
  await mockSemaphore.deployed();
  mockCampaignAddress = mockSemaphore.address;
  return mockSemaphore;
}

describe("CampaignFactory and Campaign", function () {
  let factory, campaignAddress, campaign;
  let owner, voter1, voter2;
  let startTime;
  let mockSemaphore;

  const candidateNames = ["Alice", "Bob", "Charlie"];
  const campaignName = "Presidential Election";
  const campaignDesc = "Vote for the next president";
  const campaignDuration = 10; 
  const campaignDate = new Date().toISOString().split("T")[0];

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    // Deploy mock Semaphore contract
    mockSemaphore = await deployMockCampaign();

    const Factory = await ethers.getContractFactory("CampaignFactory");
    factory = await Factory.deploy(mockSemaphore.address);
    await factory.deployed();

    const latestBlock = await ethers.provider.getBlock("latest");
    startTime = latestBlock.timestamp + 60;

    await factory.createCampaign(
      candidateNames,
      campaignDuration,
      campaignName,
      campaignDesc,
      startTime,
      campaignDate,
      [], // eligible voters
      true // public campaign
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

  // Test 1: Check if a group is created when campaign is created
  it("should create a Semaphore group when campaign is created", async function () {
    // Get the group ID from the campaign
    const groupId = await campaign.groupId();
    
    // Verify the group exists using the mock Semaphore contract
    const groupExists = await mockSemaphore.isGroup(groupId);
    expect(groupExists).to.equal(true);
    
    // Group ID should be non-zero
    expect(groupId).to.not.equal(0, "Group ID should be assigned");
  });

  // Test 2: Check if a user can be added to a group
  it("should allow adding a user to the Semaphore group", async function () {
    const groupId = await campaign.groupId();
    
    // Generate a mock identity commitment (in a real app this would come from ZK proofs)
    const identityCommitment = ethers.BigNumber.from(ethers.utils.randomBytes(32));
    
    // Add the user to the group via Campaign contract
    await campaign.connect(voter1).joinGroup(identityCommitment);
    
    // Check if the user was added to the group in the mock Semaphore
    const isMember = await mockSemaphore.isMember(groupId, identityCommitment);
    expect(isMember).to.equal(true);
    
    // Check member count
    const memberCount = await mockSemaphore.getMemberCount(groupId);
    expect(memberCount).to.equal(1);
  });

  // Test 3: Check if the same user cannot be added to the group twice
  it("should prevent adding the same user to a Semaphore group twice", async function () {
    const groupId = await campaign.groupId();
    
    // Generate a mock identity commitment
    const identityCommitment = ethers.BigNumber.from(ethers.utils.randomBytes(32));
    
    // Add the user to the group for the first time
    await campaign.connect(voter1).joinGroup(identityCommitment);
    
    // Attempt to add the same user again
    await expect(
      campaign.connect(voter1).joinGroup(identityCommitment)
    ).to.be.revertedWith("Member already exists");
    
    // Check member count is still 1
    const memberCount = await mockSemaphore.getMemberCount(groupId);
    expect(memberCount).to.equal(1);
  });
});
