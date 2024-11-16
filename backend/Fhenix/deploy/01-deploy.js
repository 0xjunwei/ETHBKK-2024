const { network } = require("hardhat");
const { FhenixClient, EncryptionTypes, getPermit } = require("fhenixjs");

const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
require("dotenv").config();
//const { verify } = require("../utils/verify");
const { ethers, deployments } = hre;
const ERC20_ABI = [
  "function mint(address to, uint256 amount) external",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 value) external returns (bool)",
  "function transferFrom(address from, address to, uint256 value) external returns (bool)", // Added transferFrom
];

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  let signerDeployer = (await ethers.getSigners())[0];
  let admin = (await ethers.getSigners())[1];
  let clientAcc = (await ethers.getSigners())[2];
  const chainId = network.config.chainId;

  // Define the address that you need to pass as a constructor argument
  const paymentTokenAddress = "0x085da17a14D4AB15e34586fb998BaABA1AaC73D6";
  // Initialize FhenixClient
  const client = new FhenixClient({ provider: ethers.provider });
  // when going for localhost or hardhat network we want to use a mock
  const tester = await deploy("Credit", {
    from: deployer,
    args: [paymentTokenAddress],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (
    network.name !== "hardhat" &&
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API
  ) {
    // Not verifying the contract as fhenix network does not support api verification rn
    //console.log("Verifying...");
    // dont
    //await verify(tester.address, []);
  } else {
    console.log(
      "Hardhat network detected or not verifying required, skipping verification."
    );
  }

  console.log("Contract deployed to address: " + tester.address);
};

module.exports.tags = ["Credit"];
