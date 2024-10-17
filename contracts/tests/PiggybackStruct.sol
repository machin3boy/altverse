// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IWormholeRelayer.sol";
import "../interfaces/IWormholeReceiver.sol";

contract PiggybackStruct is IWormholeReceiver {
    IWormholeRelayer public wormholeRelayer;
    uint256 public GAS_LIMIT;
    address public registrationOwner;
    mapping(uint16 => bytes32) public registeredSenders;

    struct Message {
        string content;
        uint256 counter;
        bool requiresResponse;
    }

    string public lastReceivedMessage;
    mapping(uint16 => mapping(address => mapping(uint256 => Message))) public messages;
    mapping(uint16 => mapping(address => uint256)) public messageCounters;

    event MessageReceived(string message, uint256 counter, bool requiresResponse);
    event SourceChainLogged(uint16 sourceChain);

    constructor(address _wormholeRelayer, uint256 _gasLimit) {
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
        GAS_LIMIT = _gasLimit;
        registrationOwner = msg.sender;
    }

    receive() external payable {}

    modifier isRegisteredSender(uint16 sourceChain, bytes32 sourceAddress) {
        require(
            registeredSenders[sourceChain] == sourceAddress,
            "Not registered sender"
        );
        _;
    }

    function setRegisteredSender(uint16 sourceChain, address sourceAddress) public {
        require(
            msg.sender == registrationOwner,
            "Not allowed to set registered sender"
        );
        registeredSenders[sourceChain] = bytes32(uint256(uint160(sourceAddress)));
    }

    function setGasLimit(uint256 _newGasLimit) external {
        GAS_LIMIT = _newGasLimit;
    }

    function quoteCrossChainCost(uint16 targetChain) public view returns (uint256 cost) {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(targetChain, 0, GAS_LIMIT);
    }

    function sendMessage(uint16 targetChain, address targetAddress, string memory message, bool requiresResponse) external {
        uint256 cost = quoteCrossChainCost(targetChain);
        require(address(this).balance >= cost, "Insufficient contract balance for cross-chain delivery");

        uint256 counter = messageCounters[targetChain][targetAddress];
        Message memory newMessage = Message(message, counter, requiresResponse);
        messages[targetChain][targetAddress][counter] = newMessage;
        messageCounters[targetChain][targetAddress]++;

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            targetChain,
            targetAddress,
            abi.encode(newMessage),
            0,
            GAS_LIMIT
        );
    }

    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32
    ) public payable override isRegisteredSender(sourceChain, sourceAddress) {
        require(msg.sender == address(wormholeRelayer), "Only the Wormhole relayer can call this function");
        
        Message memory receivedMessage = abi.decode(payload, (Message));
        lastReceivedMessage = receivedMessage.content;
                
        if (sourceChain != 0) {
            emit SourceChainLogged(sourceChain);
        }
        
        emit MessageReceived(receivedMessage.content, receivedMessage.counter, receivedMessage.requiresResponse);

        if (receivedMessage.requiresResponse) {
            uint256 cost = quoteCrossChainCost(sourceChain);
            require(address(this).balance >= cost, "Insufficient contract balance for cross-chain delivery");

            Message memory ackMessage = Message("ack", receivedMessage.counter, false);

            wormholeRelayer.sendPayloadToEvm{value: cost}(
                sourceChain,
                address(uint160(uint256(sourceAddress))),
                abi.encode(ackMessage),
                0,
                GAS_LIMIT
            );
        }
    }

    function getMessage(uint16 targetChain, address targetAddress, uint256 counter) public view returns (Message memory) {
        return messages[targetChain][targetAddress][counter];
    }
}