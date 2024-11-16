// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract USDC is ERC20, ERC20Permit {
    constructor() ERC20("USDC", "USDC") ERC20Permit("USDC") {
        _mint(msg.sender, 10000000000000 * 10 ** decimals());
    }

    // Testnet token will allow anyone to mint, please dont use this code
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // Override the decimals function to return the desired number of decimals (e.g., 6) matches usdc
    function decimals() public view override returns (uint8) {
        return 6;
    }
}
