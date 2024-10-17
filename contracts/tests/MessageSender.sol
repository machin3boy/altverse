// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IWormholeRelayer.sol";
import "../interfaces/IWormholeReceiver.sol";

contract MessageSender {
    IWormholeRelayer public wormholeRelayer;
    uint256 constant GAS_LIMIT = 50000;

    constructor(address _wormholeRelayer) {
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
    }

    // Add a receive function to allow the contract to receive Ether
    receive() external payable {}

    function quoteCrossChainCost(
        uint16 targetChain
    ) public view returns (uint256 cost) {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(
            targetChain,
            0,
            GAS_LIMIT
        );
    }

    function sendMessage(
        uint16 targetChain,
        address targetAddress,
        string memory message
    ) external {
        uint256 cost = quoteCrossChainCost(targetChain);
        require(
            address(this).balance >= cost,
            "Insufficient contract balance for cross-chain delivery"
        );

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            targetChain,
            targetAddress,
            abi.encode(message, msg.sender),
            0,
            GAS_LIMIT
        );
    }
}