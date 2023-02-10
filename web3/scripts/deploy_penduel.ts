import "@nomiclabs/hardhat-ethers";
import { ethers, network } from 'hardhat';
import { verify } from '../utils/verify';
import console from 'console';

const _metadataUri = 'https://gateway.pinata.cloud/ipfs/https://gateway.pinata.cloud/ipfs/QmX2ubhtBPtYw75Wrpv6HLb1fhbJqxrnbhDo1RViW3oVoi';

async function deploy(name: string, ...params: [string]) {
  const contractFactory = await ethers.getContractFactory(name);

  return await contractFactory.deploy(...params).then((f: any) => f.deployed());
}

async function main() {
  const [admin] = await ethers.getSigners();
  
  console.log(`Deploying Penduel smart contract...`);

  const Penduel = (await deploy('Penduel', _metadataUri)).connect(admin);

  console.log('Penduel contract :', Penduel.address, 'Network:', network.name);

  // if (network.name === "fuji") {
  //   console.log("Verifying the smart contract");
  //   await Penduel.deployTransaction.wait(6);
  //   await verify( Penduel.address, []);
  // }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  });