# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```
https://vrf.chain.link/fuji/546

https://docs.chain.link/vrf/v2/subscription/supported-networks#avalanche-fuji-testnet

npx hardhat list --network fuji --address 0xbF3CD274374eAbd57262e10eC36D7451B4F7E307
npx hardhat balance --network fuji --address 0xbF3CD274374eAbd57262e10eC36D7451B4F7E307
npx hardhat accounts
npx hardhat verify --network fuji --constructor-args ./scripts/args/avaxFuji.js 0xbF3CD274374eAbd57262e10eC36D7451B4F7E307