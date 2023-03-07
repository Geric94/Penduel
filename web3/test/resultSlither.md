PS C:\> slither .

PS C:\Projets\Penduel\web3> slither . 
'npx hardhat clean' running (wd: C:\Projets\Penduel\web3)
'npx hardhat clean --global' running (wd: C:\Projets\Penduel\web3)
'npx hardhat compile --force' running
Downloading compiler 0.8.16
Generating typings for: 17 artifacts in dir: typechain-types for target: ethers-v5
Successfully generated 62 typings!
Compiled 16 Solidity files successfully


Low level call in Penduel.playerWithdraw(Penduel.Battle,uint256) (contracts/Penduel.sol#449-461):
        - (success) = _winner.call{value: withdraw}() (contracts/Penduel.sol#457)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#low-level-calls

VRFv2Consumer (contracts/VRFv2Consumer.sol#9-84) should inherit from VRFPenduel (contracts/Penduel.sol#10-14)
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#missing-inheritance

Penduel.baseURI (contracts/Penduel.sol#39) should be immutable 
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#state-variables-that-could-be-declared-immutable
PS C:\Projets\Penduel\web3>



You can find escape result in : slither.db.json
