// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IWormholeRelayer.sol";
import "../interfaces/IWormholeReceiver.sol";

contract MessageReceiver is IWormholeReceiver {
    IWormholeRelayer public wormholeRelayer;
    address public registrationOwner;
    
    // Mapping to store registered senders for each chain
    mapping(uint16 => bytes32) public registeredSenders;
    
    // New state variable to store the last received message
    string public lastReceivedMessage;
    
    event MessageReceived(string message);
    event SourceChainLogged(uint16 sourceChain);
    
    constructor(address _wormholeRelayer) {
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
        registrationOwner = msg.sender; // Set contract deployer as the owner
    }
    
    modifier isRegisteredSender(uint16 sourceChain, bytes32 sourceAddress) {
        require(
            registeredSenders[sourceChain] == sourceAddress,
            "Not registered sender"
        );
        _;
    }
    
    function setRegisteredSender(
        uint16 sourceChain,
        address sourceAddress
    ) public {
        require(
            msg.sender == registrationOwner,
            "Not allowed to set registered sender"
        );
        registeredSenders[sourceChain] = bytes32(uint256(uint160(sourceAddress)));
    }
    
    // Updated receiveWormholeMessages to store the last received message
    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32
    ) public payable override isRegisteredSender(sourceChain, sourceAddress) {
        require(
            msg.sender == address(wormholeRelayer),
            "Only the Wormhole relayer can call this function"
        );
        
        // Decode the payload to extract the message
        string memory message = abi.decode(payload, (string));
        
        // Store the received message
        lastReceivedMessage = message;
        
        // Example use of sourceChain for logging
        if (sourceChain != 0) {
            emit SourceChainLogged(sourceChain);
        }
        
        // Emit an event with the received message
        emit MessageReceived(message);
    }
}