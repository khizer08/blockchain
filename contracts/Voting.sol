// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(address => bool) public hasVoted;
    mapping(uint => Candidate) public candidates;

    uint public candidatesCount;

    enum ElectionStatus { NotStarted, Started, Ended }
    ElectionStatus public status;

    address public admin; // FIXED: Removed immutable for constructor access

    uint public electionStartTime;
    uint public electionDuration = 3 days;

    // Events
    event ElectionStarted(uint startTime);
    event ElectionEnded(uint endTime);
    event VoteCast(address indexed voter, uint candidateId);
    event CandidateAdded(uint indexed id, string name);

    constructor() {
        admin = msg.sender;
        status = ElectionStatus.NotStarted;
        addCandidate("CONGRESS");
        addCandidate("BJP");
        addCandidate("JDS");
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier electionActive() {
        require(status == ElectionStatus.Started, "Election not active");
        require(block.timestamp <= electionStartTime + electionDuration, "Election period ended");
        _;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        require(status == ElectionStatus.NotStarted, "Cannot add candidates after election starts");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    function startElection() public onlyAdmin {
        require(status == ElectionStatus.NotStarted, "Election already started or ended");
        status = ElectionStatus.Started;
        electionStartTime = block.timestamp;
        emit ElectionStarted(electionStartTime);
    }

    function endElection() public onlyAdmin {
        require(status == ElectionStatus.Started, "Election not started");
        status = ElectionStatus.Ended;
        emit ElectionEnded(block.timestamp);
    }

    function vote(uint _candidateId) public electionActive {
        require(!hasVoted[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(msg.sender, _candidateId);
    }

    function getResults() public view returns (Candidate[] memory) {
        Candidate[] memory result = new Candidate[](candidatesCount);
        for (uint i = 0; i < candidatesCount; i++) {
            result[i] = candidates[i + 1];
        }
        return result;
    }

    function getElectionTimeLeft() public view returns (uint) {
        if (status != ElectionStatus.Started) return 0;
        if (block.timestamp > electionStartTime + electionDuration) return 0;
        return (electionStartTime + electionDuration) - block.timestamp;
    }

    function canVote(address _voter) public view returns (bool) {
        return status == ElectionStatus.Started &&
               !hasVoted[_voter] &&
               block.timestamp <= electionStartTime + electionDuration;
    }
}
