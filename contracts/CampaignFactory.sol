// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./Campaign.sol";

contract CampaignFactory {

    Campaign[] public deployedCampaigns;

    event CampaignCreated(address campaignAddress, address creator);

    uint Campaign_number = 0;

    function createCampaign(
        string[] memory _candidateNames,
        uint256 _durationInMinutes,
        string memory _campaign_name,
        string memory _campaign_description,
        uint256 startTime
    ) public {
        Campaign newCampaign = new Campaign(
            _candidateNames,
            _durationInMinutes,
            msg.sender,
            Campaign_number,
            _campaign_name,
            _campaign_description,
            startTime
        );

        Campaign_number++;
        deployedCampaigns.push(newCampaign);
        emit CampaignCreated(address(newCampaign), msg.sender);
    }


    function getDeployedCampaignsDetails() public view returns (
        address[] memory addresses,
        uint[] memory ids,
        address[] memory managers,
        string[][] memory candidateNames,
        uint256[][] memory voteCounts,
        bool[] memory votingStatus,
        uint256[] memory campaign_duration,
        string[] memory campaign_name,
        string[] memory campaign_description,
        uint256[] memory votingStart,
        uint256[] memory votingEnd

    ) {
        uint length = deployedCampaigns.length;
        addresses = new address[](length);
        ids = new uint[](length);
        managers = new address[](length);
        candidateNames = new string[][](length);
        voteCounts = new uint256[][](length);
        votingStatus = new bool[](length);
        campaign_duration = new uint256[](length);
        campaign_name = new string[](length);
        campaign_description = new string[](length);
        votingStart = new uint256[](length);
        votingEnd = new uint256[](length);
        
        for (uint i = 0; i < length; i++) {
            Campaign campaign = deployedCampaigns[i];
            addresses[i] = address(campaign);
            ids[i] = campaign.campaign_number();
            campaign_name[i] = campaign.campaign_name();
            campaign_description[i] = campaign.campaign_description();
            campaign_duration[i] = campaign.campaign_duration();
            votingStart[i] = campaign.votingStart();
            votingEnd[i] = campaign.votingEnd();
            
            // Get candidate information
            Campaign.Candidate[] memory campaignCandidates = campaign.getAllVotesOfCandidates();
            candidateNames[i] = new string[](campaignCandidates.length);
            voteCounts[i] = new uint256[](campaignCandidates.length);
            managers[i] = campaign.owner();
            
            for (uint j = 0; j < campaignCandidates.length; j++) {
                candidateNames[i][j] = campaignCandidates[j].name;
                voteCounts[i][j] = campaignCandidates[j].voteCount;
            }
        }
        
        return (addresses, ids, managers, candidateNames, voteCounts, votingStatus, campaign_duration, campaign_name, campaign_description, votingStart, votingEnd);
     }
}