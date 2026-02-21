// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract DemandSimulator {
    event DemandRequested(bytes32 indexed offeringId, uint256 amount, address indexed caller);

    // submit a demand request — this contract only emits an event
    // and DOES NOT implement any token economics. Frontend/service
    // listens to the event and applies local pricing logic.
    function requestDemand(bytes32 offeringId, uint256 amount) external {
        require(amount > 0, "amount must be > 0");
        emit DemandRequested(offeringId, amount, msg.sender);
    }
}
