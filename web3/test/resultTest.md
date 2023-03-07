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
Contract Penduel address:  0x4A679253410272dd5232B3Ff7cF5dbB88f295319
Contract Penduel balance:  0
cost create contract:  9210509270188032 wei
      √ 1: admin must be equal to owner
      √ 2: should get the balanceOf owner
      √ 3: Should receive and store the funds to penduel
Nothing to compile
No need to generate any newer typings.
      √ 4: admin must be equal to owner (369731 gas)
Nothing to compile
No need to generate any newer typings.
      √ 5: The index must be less than 32 (306287 gas)
    Players
      √ 6: owner isPlayer must be false
      √ 7: getPlayer should revert with the right error if called too soon
      √ 8: registerPlayer should return a event NewPlayer (400432 gas)
      √ 9: should return a player struct for the owner player (63444 gas)
      √ 10: should return a list of all players (63444 gas)
    Tokens
      √ 11: owner isPlayerToken must be false
      √ 12: should return a player struct for the owner player (400432 gas)
      √ 13: should return a list of all tokens (63444 gas)
    Battles
      √ 14: getBattle Battle doesn't exist!
      √ 15: createBattle without player register (26919 gas)
      √ 16: getBattle without Battle (400432 gas)
      √ 17: getBattle with Battle (269998 gas)
      √ 18: createBattle already exist (235957 gas)
      √ 19: createBattle player1 with 'Error, insufficent vault balance'
      √ 20: joinBattle only player2 can joint battle (326371 gas)
      √ 21: joinBattle player2 doen't exist (58818 gas)
      √ 22: joinBattle player2 with 'Error, insufficent vault balance' (319965 gas)
      √ 23: joinBattle player2 with 'Amount must be equal at bet' (392706 gas)
      √ 24: joinBattle player1 already in battle (294774 gas)
      √ 25: joinBattle player2 already in battle (72546 gas)
    add Word
      √ 26: Error, word with lowercase letters only
      √ 27: Error, word already in the list (63444 gas)
      √ 28: player1 addWord, Ownable: caller is not the owner (63444 gas)
      √ 29: player1 removeAll, Ownable: caller is not the owner (63444 gas)
    Find Guess
      √ 30: chosenLetter: letter not in the guess (1291000 gas)
      √ 31: chosenLetter: letter in the guess (90760 gas)
      √ 32: chosenLetter: It is not your turn
      √ 33: chosenLetter: bad letter and try an over (364073 gas)
      √ 34: chosenLetter: Play a letter already playing (639877 gas)
      √ 35: chosenLetter: find the word
    Balances
      √ 36: createBattle getBalance
      √ 37: joinBattle: getBalance (764913 gas)
      √ 38: chosenLetter: find the word (749251 gas)

·-------------------------------|---------------------------|-------------|----------------------------·
|     Solc version: 0.8.16      ·  Optimizer enabled: true  ·  Runs: 100  ·  Block limit: 6718946 gas  │
································|···························|·············|·····························
|  Methods                                                                                             │
·············|··················|·············|·············|·············|··············|··············
|  Contract  ·  Method          ·  Min        ·  Max        ·  Avg        ·  # calls     ·  usd (avg)  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  addWord         ·          -  ·          -  ·      63444  ·          14  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  chosenLetter    ·      90656  ·     150954  ·     109379  ·          15  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  createBattle    ·          -  ·          -  ·     206554  ·           5  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  joinBattle      ·          -  ·          -  ·     238394  ·           5  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  registerPlayer  ·     319965  ·     336988  ·     328474  ·           8  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Deployments                  ·                                         ·  % of limit  ·             │
································|·············|·············|·············|··············|··············
|  Penduel                      ·          -  ·          -  ·    5254652  ·      78.2 %  ·          -  │
································|·············|·············|·············|··············|··············
|  VRFv2Consumer                ·          -  ·          -  ·     306287  ·       4.6 %  ·          -  │
·-------------------------------|-------------|-------------|-------------|--------------|-------------·

  38 passing (28s)
