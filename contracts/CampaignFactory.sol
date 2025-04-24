// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./Campaign.sol";

contract CampaignFactory {

    Campaign[] public deployedCampaigns;

    event CampaignCreated(address campaignAddress, address creator);

    uint Campaign_number = 0;

    function createCampaign(string[] memory _candidateNames, uint256 _durationInMinutes) public {
        Campaign newCampaign = new Campaign(_candidateNames, _durationInMinutes, msg.sender, Campaign_number);
        Campaign_number++;
        deployedCampaigns.push((newCampaign));
        emit CampaignCreated(address(newCampaign), msg.sender);
    }

    function getDeployedCampaignsDetails() public view returns (
        address[] memory addresses,
        uint[] memory ids,
        address[] memory managers,
        string[][] memory candidateNames,
        uint256[][] memory voteCounts,
        bool[] memory votingStatus,
        uint256[] memory remainingTimes
    ) {
        uint length = deployedCampaigns.length;
        addresses = new address[](length);
        ids = new uint[](length);
        managers = new address[](length);
        candidateNames = new string[][](length);
        voteCounts = new uint256[][](length);
        votingStatus = new bool[](length);
        remainingTimes = new uint256[](length);
        
        for (uint i = 0; i < length; i++) {
            Campaign campaign = deployedCampaigns[i];
            addresses[i] = address(campaign);
            ids[i] = campaign.campaign_number();
            managers[i] = campaign.owner();
            votingStatus[i] = campaign.getVotingStatus();
            remainingTimes[i] = campaign.getRemainingTime();
            
            // Get candidate information
            Campaign.Candidate[] memory campaignCandidates = campaign.getAllVotesOfCandidates();
            candidateNames[i] = new string[](campaignCandidates.length);
            voteCounts[i] = new uint256[](campaignCandidates.length);
            
            for (uint j = 0; j < campaignCandidates.length; j++) {
                candidateNames[i][j] = campaignCandidates[j].name;
                voteCounts[i][j] = campaignCandidates[j].voteCount;
            }
        }
        
        return (addresses, ids, managers, candidateNames, voteCounts, votingStatus, remainingTimes);
     }
}