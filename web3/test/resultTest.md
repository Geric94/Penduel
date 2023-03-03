For Testing in Penduel.sol comment and uncomment this ligne

339    ////////////////////Change for testing //////////////////////////////
340    //word To Guess
341    //uint256 randomWord = VRFPenduel(_VRF).getRandomValue(battleIndex[battleName]);  //comment for testing
342    //uint256 boundary = (wordsToGuess.length<32)?wordsToGuess.length:32;  //comment for testing
343    //uint256 indexRandom = (randomWord % boundary);  //comment for testing
344    uint256 indexRandom = battleIndex[battleName];  //uncomment for testing
345    ////////////////////Change for testing //////////////////////////////


in a terminal :
PS C:\Projets\Penduel\web3> npx hardhat node 
and in other Terminal:
PS C:\Projets\Penduel\web3> npx hardhat test .\test\Penduel.ts --network localhost

  Penduel
    Deployment
Contract Penduel address:  0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
Contract Penduel balance:  Promise { <pending> }
cost create contract:  7923584666173440 wei
      √ 1: admin must be equal to owner (10394610 gas)
      √ 2: should get the balanceOf owner (5197305 gas)
      √ 3: Should receive and store the funds to penduel (5197305 gas)
Nothing to compile
No need to generate any newer typings.
      √ 4: admin must be equal to owner (5503592 gas)
      √ 5: The index must be less than 32 (306287 gas)
    Players
      √ 6: owner isPlayer must be false
      √ 7: getPlayer should revert with the right error if called too soon (5197305 gas)
      √ 8: registerPlayer should return a event NewPlayer (5534287 gas)
      √ 9: should return a player struct for the owner player (336982 gas)
      √ 10: should return a list of all players (336982 gas)
    Tokens
      √ 11: owner isPlayerToken must be false
      √ 12: should return a player struct for the owner player (5534287 gas)
      √ 13: should return a list of all tokens (336982 gas)
    Battles
      √ 14: getBattle Battle doesn't exist!
      √ 15: createBattle without player register (5197305 gas)
      √ 16: getBattle without Battle (5534287 gas)
      √ 17: getBattle with Battle (545214 gas)
      √ 18: createBattle already exist (208232 gas)
      √ 19: createBattle player1 with 'Error, insufficent amount sent'
      √ 20: joinBattle only player2 can joint battle (545214 gas)
      √ 21: joinBattle player2 doen't exist (208232 gas)
      √ 22: joinBattle player2 with 'Error, insufficent vault balance' (528090 gas)
      √ 23: joinBattle player2 with 'Amount must be equal at bet' (319858 gas)
      √ 24: joinBattle player1 already in battle (558240 gas)
      √ 25: joinBattle player2 already in battle (238382 gas)
      √ 26: chosenLetter: letter not in the guess (364052 gas)
      √ 27: chosenLetter: letter in the guess (90751 gas)
      √ 28: chosenLetter: It is not your turn
      √ 29: chosenLetter: bad letter and try an over (364052 gas)
      √ 30: chosenLetter: Play a letter already playing (639662 gas)
      √ 31: chosenLetter: find the word
    Balances
      √ 32: createBattle getBalance
      √ 33: chosenLetter: find the word (1277186 gas)

·-------------------------------|---------------------------|-------------|----------------------------·
|     Solc version: 0.8.16      ·  Optimizer enabled: true  ·  Runs: 100  ·  Block limit: 6718946 gas  │
································|···························|·············|·····························
|  Methods                                                                                             │
·············|··················|·············|·············|·············|··············|··············
|  Contract  ·  Method          ·  Min        ·  Max        ·  Avg        ·  # calls     ·  usd (avg)  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  chosenLetter    ·      90647  ·     150784  ·     106605  ·          14  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  createBattle    ·          -  ·          -  ·     208232  ·           6  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  joinBattle      ·          -  ·          -  ·     238382  ·           5  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  registerPlayer  ·     319858  ·     336982  ·     331274  ·          12  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Deployments                  ·                                         ·  % of limit  ·             │
································|·············|·············|·············|··············|··············
|  Penduel                      ·          -  ·          -  ·    5197305  ·      77.4 %  ·          -  │
································|·············|·············|·············|··············|··············
|  VRFv2Consumer                ·          -  ·          -  ·     306287  ·       4.6 %  ·          -  │
·-------------------------------|-------------|-------------|-------------|--------------|-------------·

  33 passing (21s)
