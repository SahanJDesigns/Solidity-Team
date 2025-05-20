// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./Campaign.sol";

contract CampaignFactory {

    Campaign[] public deployedCampaigns;
    CampaignMetadata[] public campaignMetadata;

    event CampaignCreated(address campaignAddress, address creator);

    uint Campaign_number = 0;

    struct CampaignMetadata {
        uint256 durationInMinutes;
        string campaignName;
        string campaignDescription;
        uint256 startTime;
        string date;
        uint256 campaignId;
    }

    function createCampaign(
        string[] memory _candidateNames,
        uint256 _durationInMinutes,
        string memory _campaign_name,
        string memory _campaign_description,
        uint256 startTime,
        string memory date,
        address[] memory _eligible
        bool type_
    ) public {
        Campaign newCampaign = new Campaign(
            _candidateNames,
            _durationInMinutes,
            msg.sender,
            Campaign_number,
            _campaign_name,
            _campaign_description,
            startTime,
            date,
            _eligible,
            type_

        );
        CampaignMetadata memory metadata = CampaignMetadata({

            durationInMinutes: _durationInMinutes,
            campaignName: _campaign_name,
            campaignDescription: _campaign_description,
            startTime: startTime,
            date: date,
            campaignId: Campaign_number
        });
        

        Campaign_number++;
        deployedCampaigns.push(newCampaign);
        campaignMetadata.push(metadata);
        emit CampaignCreated(address(newCampaign), msg.sender);
    }

    

    function getAllCampaigns() public view returns (CampaignMetadata[] memory) {
        return campaignMetadata;
    }

    function getDeployedCampaigns() public view returns (Campaign[] memory) {  // address[] memory
        return deployedCampaigns;
    }
        function getCampaignCount() public view returns (uint) {
        return deployedCampaigns.length;
    }

    function getCampaignById(uint256 _campaignId) public view returns (CampaignMetadata memory) {
        require(_campaignId < campaignMetadata.length, "Invalid campaign ID");
        return campaignMetadata[_campaignId];
    }

    function getCampaignAddressById(uint256 _campaignId) public view returns (address) {
        require(_campaignId < deployedCampaigns.length, "Invalid campaign ID");
        return address(deployedCampaigns[_campaignId]);
    }
    function getCampaignsForVoter(address voter) public view returns (address[] memory) {
        // Count eligible campaigns first
        uint eligibleCount = 0;
        for (uint i = 0; i < deployedCampaigns.length; i++) {
            if (deployedCampaigns[i].isEligibleVoter(voter) || deployedCampaigns[i].isOwner(voter)|| deployedCampaigns[i].isPublic(voter)) {
                eligibleCount++;
            }
        }
        
        // Create array of eligible campaign addresses
        address[] memory eligibleCampaigns = new address[](eligibleCount);
        uint currentIndex = 0;
        
        // Fill the array
        for (uint i = 0; i < deployedCampaigns.length; i++) {
            if (deployedCampaigns[i].isEligibleVoter(voter ) || deployedCampaigns[i].isOwner(voter)|| deployedCampaigns[i].isPublic(voter)) {
                eligibleCampaigns[currentIndex] = address(deployedCampaigns[i]);
                currentIndex++;
            }
        }
        
        return eligibleCampaigns;
    }
}