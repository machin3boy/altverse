// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WrappedBTC is ERC20 {
    constructor() ERC20("Wrapped BTC", "wBTC") {
        // Mint 21M tokens total
        _mint(address(this), 21_000_000 * 10**decimals());
        // Transfer 1M tokens to msg.sender for testing
        _transfer(address(this), msg.sender, 1_000_000 * 10**decimals());
    }

    function faucet() public {
        _transfer(address(this), msg.sender, 5 * 10**decimals());
    }
}
