// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract Campaign {
    
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    // Events for real-time updates
    event VoteCast(uint256 candidateIndex, uint256 newVoteCount);

    Candidate[] public candidates;
    address public owner;
    mapping(address => bool) public voters;
    uint256 public votingStart;
    uint256 public votingEnd;
    uint256 public campaign_number = 0;
    string public campaign_name = "Campaign Name";
    string public campaign_description = "Campaign Description";
    uint256 public campaign_duration = 0;
    string public date = "Date";
    mapping(address => bool) public eligible;
    bool public _type;

    constructor(string[] memory _candidateNames, uint256 _durationInMinutes, address _creator, uint256 _campaign_number , string memory _campaign_name, string memory _campaign_description,uint256 startTime, string memory _date ,address[] memory _eligible, bool type_) {
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }
        campaign_number= _campaign_number;
        campaign_name = _campaign_name;
        campaign_description = _campaign_description;
        campaign_duration = _durationInMinutes;
        owner = _creator;
        votingStart = startTime;
        votingEnd = startTime + (_durationInMinutes * 1 minutes);
        date = _date;
        voters[_creator] = true; 
        for (uint256 i = 0; i < _eligible.length; i++) {
            eligible[_eligible[i]] = true;
        }
        _type = type_; // true for public, false for private
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidates.push(Candidate({
            name: _name,
            voteCount: 0
        }));
    }

    function vote(uint256 _candidateIndex) public {
        require(block.timestamp >= votingStart, "Voting has not started yet.");
        require(block.timestamp < votingEnd, "Voting has ended.");
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateIndex < candidates.length, "Invalid candidate index.");

        candidates[_candidateIndex].voteCount++;
        voters[msg.sender] = true;
        
        // Emit event when a vote is cast
        emit VoteCast(_candidateIndex, candidates[_candidateIndex].voteCount);
    }

    function getAllVotesOfCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getVotingStatus() public view returns (bool) {
        return (block.timestamp >= votingStart && block.timestamp < votingEnd);
    }

    function getRemainingTime() public view returns (uint256) {
        if (block.timestamp >= votingEnd) {
            return 0;
        } else if (block.timestamp < votingStart) {
            return votingEnd - votingStart;
        }
        return votingEnd - block.timestamp;
    }
    function getStartTime() public view returns (uint256) {
        return votingStart;
    }
    function getEndTime() public view returns (uint256) {
        return votingEnd;
    }
    function getCandidate(uint index) public view returns (string memory, uint256) {
        require(index < candidates.length, "Invalid index");
        return (candidates[index].name, candidates[index].voteCount);
    }

    function getCandidatesCount() public view returns (uint256) {
        return candidates.length;
    }

    function getVotersCount() public view returns (uint256) {
        uint256 voterCount = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            voterCount += candidates[i].voteCount;
        }
        return voterCount;
    }
    // function to get campaign name
    function getCampaignName() public view returns (string memory) {
        return campaign_name;
    }
    // function to get campaign description 
    function getCampaignDescription() public view returns (string memory) {
        return campaign_description;
    }
    // function to get campaign duration
    function getCampaignDuration() public view returns (uint256) {
        return campaign_duration;
    }
    // function to get campaign date
    function getCampaignDate() public view returns (string memory) {
        return date;
    }
    // function to get campaign number
    function getCampaignNumber() public view returns (uint256) {
        return campaign_number;
    }
    // function to get campaign owner
    function getCampaignOwner() public view returns (address) {
        return owner;
    }

    // Function to check if an address is the campaign owner
    function isOwner(address _address) public view returns (bool) {
        return _address == owner;
    }

    // Function to check if an address has already voted
    function isVoted(address _address) public view returns (bool) {
        return voters[_address];
    }
    // Function to check if an address is eligible to vote
    function isEligibleVoter(address voter) public view returns (bool) {
        return eligible[voter];
    }
    // Function to get the type of campaign
    function getType() public view returns (bool) {
        return _type;
    }
    // Function to check if the campaign is public
    function isPublic(address voter) public view returns (bool) {
        if (_type == true) {
            return true;
        } else {
            return false;
        }
    }

}
