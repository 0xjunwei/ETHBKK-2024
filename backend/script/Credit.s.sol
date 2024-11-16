// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/USDC.sol";
import "../src/Credit.sol";

contract DeployCredit is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy USDC Contract
        USDC usdc = new USDC();
        console.log("USDC deployed at:", address(usdc));

        // Deploy Credit Contract, passing the USDC address
        Credit credit = new Credit(address(usdc));
        console.log("Credit deployed at:", address(credit));
        // Mint 1,000,000 USDC to the Credit contract
        uint256 mintAmount = 1_000_000 * 10 ** usdc.decimals();
        usdc.mint(address(credit), mintAmount);
        console.log("Minted 1,000,000 USDC to Credit contract");

        vm.stopBroadcast();
    }
}
