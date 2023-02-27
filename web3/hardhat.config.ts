import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import '@nomiclabs/hardhat-ethers';
import "hardhat-gas-reporter"
import "@typechain/hardhat"

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const API_KEY_FUJI = process.env.API_KEY_FUJI || "";

require("hardhat-gas-reporter");

//* Notes for deploying the smart contract on your own subnet
//* More info on subnets: https://docs.avax.network/subnets
//* Why deploy on a subnet: https://docs.avax.network/subnets/when-to-use-subnet-vs-c-chain
//* How to deploy on a subnet: https://docs.avax.network/subnets/create-a-local-subnet
//* Transactions on the C-Chain might take 2-10 seconds -> the ones on the subnet will be much faster
//* On C-Chain we're relaying on the Avax token to confirm transactions -> on the subnet we can create our own token
//* You are in complete control over the network and it's inner workings

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.16',
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
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      chainId: 43113,
      gasPrice: 225000000000,
      accounts: [PRIVATE_KEY],
      // apiKey: { avalancheFujiTestnet: [API_KEY_FUJI] },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      gasPrice: 'auto',
    },
    // subnet: {https://api-testnet.snowtrace.io/api?module=contract&action=getabi&address=0x0000000000000000000000000000000000001004&apikey=[API_KEY_FUJI]
    //   url: process.env.NODE_URL,
    //   chainId: Number(process.env.CHAIN_ID),
    //   gasPrice: 'auto',
    //   accounts: [process.env.PRIVATE_KEY],
    // },
  },
  gasReporter: {
    // enabled: (process.env.REPORT_GAS) ? true : false
    enabled: true
  },
}

export default config;