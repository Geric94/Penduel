//import { HardhatUserConfig } from "hardhat/config";
require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");
require('@nomiclabs/hardhat-ethers');
require("hardhat-gas-reporter");
require("@typechain/hardhat");
//require('@nomiclabs/hardhat-waffle')
//require("@nomiclabs/hardhat-web3");

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const FUJI_TOKEN = process.env.FUJI_TOKEN || "";

//* Notes for deploying the smart contract on your own subnet
//* More info on subnets: https://docs.avax.network/subnets
//* Why deploy on a subnet: https://docs.avax.network/subnets/when-to-use-subnet-vs-c-chain
//* How to deploy on a subnet: https://docs.avax.network/subnets/create-a-local-subnet
//* Transactions on the C-Chain might take 2-10 seconds -> the ones on the subnet will be much faster
//* On C-Chain we're relaying on the Avax token to confirm transactions -> on the subnet we can create our own token
//* You are in complete control over the network and it's inner workings

const { types, task } = require("hardhat/config");

//npx hardhat accounts --network fuji
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

//npx hardhat accounts2 --network fuji
task("accounts2", "Prints accounts", async (_, { web3 }) => {
  console.log(await web3.eth.getAccounts());
});

//
task("balance", "Prints an account's balance")
  .addParam("account", "The account's address", "", types.string)
  .setAction(async (args) => {
    const account = web3.utils.toChecksumAddress(args.account);
    const balance = await web3.eth.getBalance(account);
    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
  });

//npx hardhat list --network fuji --address 0xb8EB25da417caa49BA37d6CB89d6078C2c69b638
task("list", "List all nfts of a proxy address")
  .addParam("address", "Contract proxy address")
  .setAction(async (args, hre) => {
    const [owner] = await hre.ethers.getSigners();
    console.log("Current account:", owner.address);
    console.log("NFT address:", args.address);

    const Memento = await ethers.getContractFactory("Memento");
    const memento = await Memento.attach(args.address);
    const supply = await memento.supply();
    for (let i = 0; i < supply; i++) {
      let owner = await memento.ownerOf(i);
      let author = await memento.authorOf(i);
      let uri = await memento.tokenURI(i);
      console.log(`ID ${i}. Author ${author}. Owner ${owner}. URI ${uri}`);
    }
  });

module.exports = {
    solidity: {
    version: '0.8.17',
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    fuji: {
      chainId: 43113,
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      gasPrice: 225000000000,
      accounts: [PRIVATE_KEY],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      gasPrice: 'auto',
    },
    // subnet: {
    //   url: process.env.NODE_URL,
    //   chainId: Number(process.env.CHAIN_ID),
    //   gasPrice: 'auto',
    //   accounts: [process.env.PRIVATE_KEY],
    // },
  },
  etherscan: {
    apiKey: {
      fuji: FUJI_TOKEN,
    },
  },
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false,
    currency: "EURO",
   },
}
