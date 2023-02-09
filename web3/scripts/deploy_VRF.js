const { ethers } = require('hardhat');
const hre = require('hardhat');

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;

  const config = require('./config.json').chainId[chainId.toString()];
  const { subscriptionId, vrfCoordinator, link, keyHash } = config;
  const VRF = await ethers.getContractFactory('VRFv2Consumer');
  const vrf = await VRF.deploy( subscriptionId, vrfCoordinator, link, keyHash);
  await vrf.deployed();
  console.log('VRF deployed:', vrf.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});