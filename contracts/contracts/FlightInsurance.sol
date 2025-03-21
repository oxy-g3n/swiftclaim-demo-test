// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract FlightInsurance is Ownable {
    struct Policy {
        address policyholder;
        string flightNumber;
        uint256 departureTime;
        uint256 coverageAmount;
        bool isActive;
        bool isPaid;
    }
    
    mapping(uint256 => Policy) public policies;
    uint256 public nextPolicyId = 1;
    
    // Events
    event PolicyCreated(uint256 policyId, address policyholder, string flightNumber);
    event ClaimPaid(uint256 policyId, address policyholder, uint256 amount);
    
    // Create a new flight insurance policy
    function createPolicy(
        string memory flightNumber,
        uint256 departureTime,
        uint256 coverageAmount
    ) external payable returns (uint256) {
        require(msg.value >= coverageAmount, "Premium payment insufficient");
        
        uint256 policyId = nextPolicyId;
        
        policies[policyId] = Policy({
            policyholder: msg.sender,
            flightNumber: flightNumber,
            departureTime: departureTime,
            coverageAmount: coverageAmount,
            isActive: true,
            isPaid: false
        });
        
        nextPolicyId++;
        
        emit PolicyCreated(policyId, msg.sender, flightNumber);
        
        return policyId;
    }
    
    // Process claim payment (called by oracle/backend via owner)
    function processClaim(uint256 policyId) external onlyOwner {
        Policy storage policy = policies[policyId];
        
        require(policy.isActive, "Policy is not active");
        require(!policy.isPaid, "Claim already paid");
        
        policy.isPaid = true;
        policy.isActive = false;
        
        payable(policy.policyholder).transfer(policy.coverageAmount);
        
        emit ClaimPaid(policyId, policy.policyholder, policy.coverageAmount);
    }
    
    // Check if a policy exists and is active
    function isPolicyActive(uint256 policyId) external view returns (bool) {
        return policies[policyId].isActive;
    }
    
    // Get policy details
    function getPolicy(uint256 policyId) external view returns (
        address policyholder,
        string memory flightNumber,
        uint256 departureTime,
        uint256 coverageAmount,
        bool isActive,
        bool isPaid
    ) {
        Policy memory policy = policies[policyId];
        return (
            policy.policyholder,
            policy.flightNumber,
            policy.departureTime,
            policy.coverageAmount,
            policy.isActive,
            policy.isPaid
        );
    }
} 