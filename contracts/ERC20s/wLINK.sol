// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WrappedLINK is ERC20 {
    constructor() ERC20("Wrapped LINK", "wLINK") {
        // Mint 10B tokens total
        _mint(address(this), 10_000_000_000 * 10**decimals());
        // Transfer 1B tokens to msg.sender for testing
        _transfer(address(this), msg.sender, 1_000_000_000 * 10**decimals());
    }

    function faucet() public {
        _transfer(address(this), msg.sender, 1_000 * 10**decimals());
    }
}
