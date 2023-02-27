For Testing in Penduel.sol comment and uncomment this ligne

339    ////////////////////Change for testing //////////////////////////////
340    //word To Guess
341    //uint256 randomWord = VRFPenduel(_VRF).getRandomValue(battleIndex[battleName]);  //comment for testing
342    //uint256 boundary = (wordsToGuess.length<32)?wordsToGuess.length:32;  //comment for testing
343    //uint256 indexRandom = (randomWord % boundary);  //comment for testing
344    uint256 indexRandom = battleIndex[battleName];  //uncomment for testing
345    ////////////////////Change for testing //////////////////////////////


in a terminal :
PS C:\> npx hardhat node 
and in other Terminal:
PS C:\> npx hardhat test .\test\Penduel.ts --network localhost

  Penduel
    Deployment
      √ 1: admin must be equal to owner (5242687 gas)
      √ 2: should get the balanceOf owner (5095102 gas)
      √ Should receive and store the funds to penduel (5095102 gas)
      √ 3: admin must be equal to owner (5401389 gas)
      √ 4: The index must be less than 32 (306287 gas)
    Players
      √ 5: owner isPlayer must be false
      √ 6: getPlayer should revert with the right error if called too soon (5095102 gas)
      √ 7: registerPlayer should return a event NewPlayer (5432027 gas)
      √ 8: should return a player struct for the owner player (336925 gas)
      √ 9: should return a list of all players (336925 gas)
    Tokens
      √ 10: owner isPlayerToken must be false
      √ 11: should return a player struct for the owner player (5432027 gas)
      √ 12: should return a list of all tokens (336925 gas)
    Battles
      √ 13: getBattle Battle doesn't exist!
      √ 14: createBattle without player register (5095102 gas)
      √ 15: getBattle without Battle (5432027 gas)
      √ 16: getBattle with Battle (541321 gas)
      √ 17: createBattle already exist (204396 gas)
      √ 18: joinBattle only player2 can joint battle (204396 gas)
      √ 19: joinBattle player2 doen't exist (204396 gas)
      √ 20: joinBattle player2 with 'Error, insufficent amount sent' (507198 gas)
      √ 21: joinBattle player2 with 'Amount must be equal at bet' (302802 gas)
      √ 22: joinBattle player1 already in battle (541064 gas)
      √ 23: joinBattle player2 already in battle (238262 gas)
      √ 24: chosenLetter: letter not in the guess (363908 gas)
      √ 25: chosenLetter: letter in the guess (90751 gas)
      √ 26: chosenLetter: It is not your turn
      √ 27: chosenLetter: bad letter and try an over (363908 gas)
      √ 28: chosenLetter: Play a letter already playing (639491 gas)
      √ 29: chosenLetter: find the word
    Balances
      √ 30: createBattle getBalance
      √ 31: chosenLetter: find the word (1256027 gas)

·-------------------------------|---------------------------|-------------|----------------------------·
|     Solc version: 0.8.16      ·  Optimizer enabled: true  ·  Runs: 100  ·  Block limit: 6718946 gas  │
································|···························|·············|·····························
|  Methods                                                                                             │
·············|··················|·············|·············|·············|··············|··············
|  Contract  ·  Method          ·  Min        ·  Max        ·  Avg        ·  # calls     ·  usd (avg)  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  chosenLetter    ·      90647  ·     150637  ·     109312  ·          15  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  createBattle    ·          -  ·          -  ·     204396  ·           6  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  joinBattle      ·          -  ·          -  ·     238262  ·           5  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  registerPlayer  ·     302802  ·     336925  ·     324517  ·          11  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Deployments                  ·                                         ·  % of limit  ·             │
································|·············|·············|·············|··············|··············
|  Penduel                      ·          -  ·          -  ·    5095102  ·      75.8 %  ·          -  │
································|·············|·············|·············|··············|··············
|  VRFv2Consumer                ·          -  ·          -  ·     306287  ·       4.6 %  ·          -  │
·-------------------------------|-------------|-------------|-------------|--------------|-------------·

  32 passing (20s)
