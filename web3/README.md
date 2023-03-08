# Penduel Contract (web3)

This project demonstrates a case of use of a web3 basic game. It is delivered with an example of a contract, a test for this contract and a script which deploys this contract.
This contract uses the Fuji Tesnet avalanche but you can use yours.

Try doing the following tasks:

# VRF Contract
rename .env.sav to .env and put your private wallet key,
you can find parameter in the link below
https://docs.chain.link/vrf/v2/subscription/supported-networks#avalanche-fuji-testnet
LINK_TOKEN=0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846
VRF_COORDINATOR=0x2eD832Ba664535e5886b75D64C46EB9a228C2610
KEY_HASH=0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61

Lauch a terminal
```shell
cd web3
npx hardhat run .\scripts\deploy_VRF.js --network localhost
```

create an account here: https://vrf.chain.link/fuji
get testnet LINK here: https://faucets.chain.link/fuji
put the VRF contract address and your id souscription

VRF_CONSUMER_ADDRESS=

SUBSCRIPTIONID=

Chainlink documentation : 
https://docs.chain.link/vrf/v2/subscription
https://docs.chain.link/getting-started/other-tutorials?parent=vrf#randomness-vrf

# Generate the random value
Lauch remix
https://remix.ethereum.org/
Open the VRF contract file: /web3/contracts/VRFv2Consumer.sol
select the 0.8.16 version of compiler
Select the 'Injected Provider - MetaMask' environment
use the owner contract account in your wallet
and put the contract address in the 'Load contract from address' input
Click on 'At Address button'
Verify that your are the good owner by pressing 'Owner' button
and press 'requestRandonWords' to get your 32 random values
you can see if it's works with the 'randomValues' button to put an index between 0 and 31

# Add a word
Lauch remix
https://remix.ethereum.org/
Open the Penduel contract file: /web3/contracts/Penduel.sol

# Installation of the hanging contract (Penduel)
```shell
cd web3
npm install
npx hardhat run .\scripts\deploy_penduel.ts --network fuji
```

copy the contract address and put in the /client/src/contract/index.js
copy /web3/artifacts/contracts/Penduel.sol/Penduel.json in /client/src/contract/

# Testing the contract
Lauch a new terminal
```shell
cd web3
npx hardhat node
```
Lauch a over new terminal
Do the comment and uncomment in the Penduel.sol towards lines 345
```shell
cd web3
npx hardhat test .\test\Penduel.ts --network localhost
```
abord the comment line in Penduel.sol

# Slither
https://github.com/crytic/slither and go to install

```shell
pip3 install slither-analyzer
slither .
```

Try running some of the following tasks:

rename before hardhat.config.ts -> hardhat.config.ts_ for work with .js file

```shell
npx hardhat list --network fuji --address 
npx hardhat balance --network fuji --account 'CONTRACT_Or_WALET_ADDRESS'
npx hardhat accounts
npx hardhat verify --network fuji --constructor-args ./scripts/args/avaxFuji.js 'CONTRACT_ADDRESS' + ARG
```

# Example of execution with costs
We used the above balance task above
```shell
'0x3DaC9D64C9bF82294bFF40F15AbeDa041f5b9Def'    owner       9.538384994345982376 ETH
'0x6B3161d1ecc56039f107ff1211383068Eb90BbbD'    player1     9.648689368749999999 ETH
'0xa3ecE30f15FFfE13eB8156F12bF5B613A7Ecd073'    player2     9.84281823 ETH 
'0x94a953f0E05DFb802fa5d07238E9A0e9BaE178B3'    contract    0 ETH

contract balance:   0 ETH
register player1:   9.640265818749999999 ETH
register player2:   9.83524968 ETH
create battle p1:   9.435101968749999999 ETH
contract            0.2 ETH
join battle p2:      ETH
contract            0.4 ETH
chosen letter p1:   9.431977043749999999 ETH
chosen letter p2:   9.62635353 ETH
chosen letter p1:   9.429279618749999999 ETH
chosen letter p2:   9.62359278 ETH
chosen letter p1:   9.426582193749999999 ETH
chosen letter p2:   9.61923753 ETH

owner       10.136806384345982376 ETH
player1     9.426582193749999999 ETH
player2     9.61923753 ETH
contract    0 ETH
```
