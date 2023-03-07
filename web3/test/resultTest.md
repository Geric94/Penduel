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
Contract Penduel address:  0x927b167526bAbB9be047421db732C663a0b77B11
Contract Penduel balance:  0
cost create contract:  8.999901523243307e+22 wei
      √ 1: admin must be equal to owner (63422 gas)
      √ 2: should get the balanceOf owner
      √ 3: Should receive and store the funds to penduel (63422 gas)
Nothing to compile
No need to generate any newer typings.
      √ 4: admin must be equal to owner (369709 gas)
Nothing to compile
No need to generate any newer typings.
      √ 5: The index must be less than 32 (306287 gas)
    Players
      √ 6: owner isPlayer must be false
      √ 7: getPlayer should revert with the right error if called too soon
      √ 8: registerPlayer should return a event NewPlayer (400388 gas)
      √ 9: should return a player struct for the owner player (63422 gas)
      √ 10: should return a list of all players (63422 gas)
    Tokens
      √ 11: owner isPlayerToken must be false
      √ 12: should return a player struct for the owner player (400388 gas)
      √ 13: should return a list of all tokens (63422 gas)
    Battles
      √ 14: getBattle Battle doesn't exist!
      √ 15: createBattle without player register (26919 gas)
      √ 16: getBattle without Battle (400388 gas)
      √ 17: getBattle with Battle (269976 gas)
      √ 18: createBattle already exist (235957 gas)
      √ 19: createBattle player1 with 'Error, insufficent vault balance'
      √ 20: joinBattle only player2 can joint battle (326327 gas)
      √ 21: joinBattle player2 doen't exist (58796 gas)
      √ 22: joinBattle player2 with 'Error, insufficent vault balance' (319842 gas)
      √ 23: joinBattle player2 with 'Amount must be equal at bet' (392561 gas)
      √ 24: joinBattle player1 already in battle (294730 gas)
      √ 25: joinBattle player2 already in battle (72524 gas)
    add Word
      √ 26: Error, word with lowercase letters only
      √ 27: Error, word already in the list (63422 gas)
      √ 28: player1 addWord, Ownable: caller is not the owner (63422 gas)
      √ 29: player1 removeAll, Ownable: caller is not the owner (63422 gas)
    Find Guess
      √ 30: chosenLetter: letter not in the guess (1290811 gas)
      √ 31: chosenLetter: letter in the guess (90760 gas)
      √ 32: chosenLetter: It is not your turn (61287 gas)
      √ 33: chosenLetter: bad letter and try an over (186909 gas)
      √ 34: chosenLetter: Play a letter already playing (548943 gas)
      √ 35: chosenLetter: find the word
    Balances
      √ 36: createBattle getBalance
      √ 37: joinBattle: getBalance (764768 gas)
      √ 38: chosenLetter: find the word (749267 gas)
      √ 39: two players don't find the word (273871 gas)

·-------------------------------|---------------------------|-------------|----------------------------·
|     Solc version: 0.8.16      ·  Optimizer enabled: true  ·  Runs: 100  ·  Block limit: 6718946 gas  │
································|···························|·············|·····························
|  Methods                                                                                             │
·············|··················|·············|·············|·············|··············|··············
|  Contract  ·  Method          ·  Min        ·  Max        ·  Avg        ·  # calls     ·  usd (avg)  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  addWord         ·          -  ·          -  ·      63422  ·          19  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  chosenLetter    ·      90656  ·     165292  ·     115070  ·          16  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  createBattle    ·          -  ·          -  ·     206554  ·           5  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  joinBattle      ·          -  ·          -  ·     238372  ·           4  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Penduel   ·  registerPlayer  ·     319842  ·     336966  ·     328401  ·           8  ·          -  │
·············|··················|·············|·············|·············|··············|··············
|  Deployments                  ·                                         ·  % of limit  ·             │
································|·············|·············|·············|··············|··············
|  Penduel                      ·          -  ·          -  ·    5263702  ·      78.3 %  ·          -  │
································|·············|·············|·············|··············|··············
|  VRFv2Consumer                ·          -  ·          -  ·     306287  ·       4.6 %  ·          -  │
·-------------------------------|-------------|-------------|-------------|--------------|-------------·

  39 passing (28s)
