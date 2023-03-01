// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import '../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '../node_modules/@openzeppelin/contracts/access/Ownable.sol';
import '../node_modules/@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';
import "../node_modules/hardhat/console.sol";

interface VRFPenduel {
    function requestRandomWords() external;

    function getRandomValue( uint256 index) external view returns (uint256);
}

/// @title Penduel
/// @notice This contract handles the token management and battle logic for the Penduel game
/// @notice Version 1.0.0
/// @author Ava-Labs
/// @author Julian Martinez
/// @author Gabriel Cardona
/// @author Raj Ranjan

contract Penduel is ERC1155, Ownable, ERC1155Supply {
  address payable immutable pOwner;

  receive() external payable {}

  modifier onlyPlayer(Battle memory _battle) {
      require((msg.sender == _battle.players[0]) || (msg.sender == _battle.players[1]));
      _;
  }
    
  function ownerWithdraw(uint amount) external {
    require(msg.sender == pOwner, "caller is not owner");
    payable(msg.sender).transfer(amount);
  }

  function getBalance() external view returns (uint) {
    return address(this).balance;
  }


  string public baseURI; // baseURI where token metadata is stored
  uint256 public totalSupply; // Total number of tokens minted
  // uint256 private constant DEVIL = 0;
  // uint256 private constant GRIFFIN = 1;
  // uint256 private constant FIREBIRD = 2;
  // uint256 private constant KAMO = 3;
  // uint256 private constant KUKULKAN = 4;
  // uint256 private constant CELESTION = 5;

  uint256 public constant MAX_ATTACK_DEFEND_STRENGTH = 10;
  address private constant _VRF = 0x11F7aD1DF281604F2bd22ba13E334ca4d14d7C28;

  enum BattleStatus{ PENDING, STARTED, ENDED }

  /// @dev Player struct to store player info
  struct Player {
    address payable playerAddress; /// @param playerAddress player wallet address
    string playerName; /// @param playerName player name; set by player during registration
    uint256 playerMana; /// @param playerMana player mana; affected by battle results
    uint256 playerHealth; /// @param playerHealth player health; affected by battle results
    bool inBattle; /// @param inBattle boolean to indicate if a player is in battle
  }

  /// @dev GameToken struct to store player token info
  struct GameToken {
    string name; /// @param name battle card name; set by player
    uint256 id; /// @param id battle card token id; will be randomly generated
    uint256 attackStrength; /// @param attackStrength battle card attack; generated randomly
    uint256 defenseStrength; /// @param defenseStrength battle card defense; generated randomly
  }

  /// @dev Battle struct to store battle info
  struct Battle {
    BattleStatus battleStatus; /// @param battleStatus enum to indicate battle status
    bytes32 battleHash; /// @param battleHash a hash of the battle name
    string name; /// @param name battle name; set by player who creates battle
    uint256 bet; /// @param bet    
    address[2] players; /// @param players address array representing players in this battle
    address activePlayer; /// @param activePlayer uint array representing active players
    address winner; /// @param winner winner address
    bytes maskedWord; /// @param maskedWord word to find
    string guesses; /// @param guesses list of letter tested
    uint8 incorrectGuess;
    uint date;
  }

  string[] wordsToGuess = [
      "hello",
      "goodbye",
      "sun",
      "holliday",
      "before",
      "after",
      "restoration",
      "fashion",
      "dressing",
      "representative",
      "silence",
      "acceptable",
      "environmental",
      "photocopy"
  ];
  string private wordToGuess;

  mapping(address => uint256) private playerIndex; // Mapping of player addresses to player index in the players array
  mapping(address => uint256) private playerTokenIndex; // Mapping of player addresses to player token index in the gameTokens array
  mapping(string => uint256) private battleIndex; // Mapping of battle name to battle index in the battles array

  Player[] private players; // Array of players
  GameToken[] private gameTokens; // Array of game tokens
  Battle[] private battles; // Array of battles

  //Player
  function isPlayer(address playerAddress) public view returns (bool) {
    if(playerIndex[playerAddress] == 0) {
      return false;
    } else {
      return true;
    }
  }

  function getPlayer(address playerAddress) public view returns (Player memory) {
    require(isPlayer(playerAddress), "Player doesn't exist!");
    return players[playerIndex[playerAddress]];
  }

  function getAllPlayers() public view returns (Player[] memory) {
    return players;
  }

  //Token
  function isPlayerToken(address playerTokenAddress) public view returns (bool) {
    if(playerTokenIndex[playerTokenAddress] == 0) {
      return false;
    } else {
      return true;
    }
  }

  function getPlayerToken(address playerTokenAddress) public view returns (GameToken memory) {
    require(isPlayerToken(playerTokenAddress), "Game token doesn't exist!");
    return gameTokens[playerTokenIndex[playerTokenAddress]];
  }

  function getAllPlayerTokens() public view returns (GameToken[] memory) {
    return gameTokens;
  }

  // Battle getter function
  function isBattle(string memory battleName) public view returns (bool) {
    if(battleIndex[battleName] == 0) {
      return false;
    } else {
      return true;
    }
  }

  function getBattle(string memory battleName) public view returns (Battle memory) {
    require(isBattle(battleName), "(getBattle): Battle doesn't exist!");
    return battles[battleIndex[battleName]];
  }

  function getAllBattles() public view returns (Battle[] memory) {
    return battles;
  }

  //update new data in the Battle map
  function updateBattle(string memory battleName, Battle memory newBattle) private {
    require(isBattle(battleName), "(updateBattle): Battle doesn't exist");
    battles[battleIndex[battleName]] = newBattle;
  }

  function getMaskedWord(string memory battleName) public view returns (string memory) {
    require(isBattle(battleName), "(getMaskedWord): Battle doesn't exist!");
    return string(battles[battleIndex[battleName]].maskedWord);
  }

  function getGuesses(string memory battleName) public view returns (string memory _guesses) {
    require(isBattle(battleName), "(getGuesses): Battle doesn't exist!");
    return string(battles[battleIndex[battleName]].guesses);
  }

  // Events
  event NewPlayer(address indexed owner, string playerName);
  event BattleCreate(string battleName, address indexed player1, address indexed player2);
  event BattleBegin(string battleName, address indexed player1, address indexed player2, string maskedWord);
  event BattleEnded(string battleName, address indexed winner, address indexed loser);
  event BattleLetter(bool indexed _findNewLetter, string maskedWord);
  event NewGameToken(address indexed owner, uint256 id, uint256 attackStrength, uint256 defenseStrength);
  event RoundEnded();
  event WordAdded(string wordToAdd);
  event PlayerWithdraw(address player, uint256 amount); // change for player

  /// @dev Initializes the contract by setting a `metadataURI` to the token collection
  /// @param _metadataURI baseURI where token metadata is stored
  constructor(string memory _metadataURI) ERC1155(_metadataURI) {
    pOwner = payable(msg.sender);
    baseURI = _metadataURI; // Set baseURI
    initialize();
  }

  function setURI(string memory newuri) public onlyOwner {
    _setURI(newuri);
  }

  //We create a first empty entry for all structures
  function initialize() private {
    gameTokens.push(GameToken("", 0, 0, 0));
    players.push(Player(payable(0), "", 0, 0, false));
    battles.push(Battle(BattleStatus.PENDING, bytes32(0), "", 0, [address(0), address(0)], address(0), address(0), "", string(""), 0, 0));
    //VRFPenduel(_VRF).requestRandomWords();
  }

  /// @dev Registers a player
  /// @param playerName player name; set by player
  /// @param gameTokenName player token name; set by player
  function registerPlayer(string memory playerName, string memory gameTokenName) external {
    require(!isPlayer(msg.sender), "Player already registered"); // Require that player is not already registered
    
    uint256 _id = players.length;
    players.push(Player(payable(msg.sender), playerName, 10, 6, false)); // Adds player to players array
    playerIndex[msg.sender] = _id; // Creates player info mapping

    emit NewPlayer(msg.sender, playerName); // Emits NewPlayer event

    createRandomGameToken(gameTokenName);   
  }

  /// @dev internal function to generate random number; used for Battle Card Attack and Defense Strength
  function _createRandomNum(uint256 _max, address _sender) internal view returns (uint256 randomValue) {
    uint256 randomNum = uint256(keccak256(abi.encodePacked(block.difficulty, block.difficulty, _sender)));

    randomValue = randomNum % _max;
    if(randomValue == 0) {
      randomValue = _max / 2;
    }

    return randomValue;
  }

  /// @dev internal function to create a new Battle Card
  function _createGameToken(string memory battleName) internal returns (GameToken memory) {
    uint256 randAttackStrength = _createRandomNum(MAX_ATTACK_DEFEND_STRENGTH, msg.sender);
    uint256 randDefenseStrength = MAX_ATTACK_DEFEND_STRENGTH - randAttackStrength;
    
    //uint8 randId = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 100);
    uint256 randId = uint256(keccak256(abi.encodePacked(block.difficulty, msg.sender)));
    randId = randId % 6;
    if (randId == 0) {
      randId++;
    }
    
    GameToken memory newGameToken = GameToken( battleName, randId, randAttackStrength, randDefenseStrength );

    uint256 _id = gameTokens.length;
    totalSupply++;
    gameTokens.push(newGameToken);
    playerTokenIndex[msg.sender] = _id;

    emit NewGameToken(msg.sender, randId, randAttackStrength, randDefenseStrength);
    
    _mint(msg.sender, randId, 1, '0x0');
    
    return newGameToken;
  }

  /// @dev Creates a new game token
  /// @param battleName game token name; set by player
  function createRandomGameToken(string memory battleName) public {
    require(!getPlayer(msg.sender).inBattle, "Player is in a battle"); // Require that player is not already in a battle
    require(isPlayer(msg.sender), "Please Register Player First"); // Require that the player is registered
    
    _createGameToken(battleName); // Creates game token
  }

  function getTotalSupply() external view returns (uint256) {
    return totalSupply;
  }

  /// @param guessWord guessWord
  //Display the word with underscores for unguessed letters
  function underscores( bytes memory guessWord) internal pure returns (bytes memory) {
    for (uint i = 1; i < guessWord.length ; i++) //start to index one for see the fisrt letter
      if(guessWord[i] != guessWord[0]) //If they have a lettre egale to the first letter don't put a underscore
        guessWord[i] = '_';
    return guessWord;
  }

  /// @dev Creates a new battle
  /// @param battleName battle name; set by player
  //function createBattle(string memory battleName) external returns (Battle memory) {
  function createBattle(string memory battleName) external payable {
    require(isPlayer(msg.sender), "Please Register Player First"); // Require that the player is registered
    require(!isBattle(battleName), "Battle already exists!"); // Require battle with same name should not exist
    require( msg.sender.balance >= msg.value, "createBattle: Error, insufficent vault balance");
    require( msg.value > (0.05 * 1e12), "Error, minimum 0.05 Avax"); //EGA
    console.log('balance: ', msg.sender.balance, ' value: ', msg.value);

    bytes32 battleHash = keccak256(abi.encode(battleName));

    Battle memory _battle = Battle(
      BattleStatus.PENDING, // Battle pending
      battleHash, // Battle hash
      battleName, // Battle name
      msg.value, // bet value in the game
      [msg.sender, address(0)], // player addresses; player 2 empty until they joins battle
      payable(msg.sender), // address of active player
      address(0), // winner address; empty until battle ends
      bytes(""), //empty string
      string(""),
      0, 
      block.timestamp
    );

    uint256 _id = battles.length;
    battleIndex[battleName] = _id;
    battles.push(_battle);

    emit BattleCreate(_battle.name, msg.sender, _battle.players[1]); // Emits Battle create event
  }

  /// @dev Player joins battle
  /// @param battleName battle name; name of battle player wants to join
  function joinBattle(string memory battleName) external payable returns (Battle memory) {
    Battle memory _battle = getBattle(battleName);

    require(_battle.players[0] != msg.sender, "Only player two can join a battle"); // Require that player 2 is joining the battle
    require(!getPlayer(msg.sender).inBattle, "Already in battle"); // Require that player is not already in a battle
    require( msg.sender.balance >= msg.value, "joinBattle: Error, insufficent vault balance" );
    require( msg.value == _battle.bet, "Amount must be equal at bet" );
    require(_battle.battleStatus == BattleStatus.PENDING, "Battle already started!"); // Require that battle has not started
    
    _battle.battleStatus = BattleStatus.STARTED;
    _battle.players[1] = payable(msg.sender);
    _battle.activePlayer = _battle.players[0];
    
    ////////////////////Change for testing //////////////////////////////
    //word To Guess
    uint256 randomWord = VRFPenduel(_VRF).getRandomValue(battleIndex[battleName]);  //comment for testing
    uint256 boundary = (wordsToGuess.length<32)?wordsToGuess.length:32;  //comment for testing
    uint256 indexRandom = (randomWord % boundary);  //comment for testing
    // uint256 indexRandom = battleIndex[battleName];  //uncomment for testing
    ////////////////////Change for testing //////////////////////////////

    // console.log('wordsToGuess' , wordsToGuess[indexRandom]);
    wordToGuess = wordsToGuess[indexRandom];
    _battle.maskedWord = underscores(bytes(wordToGuess));
    string memory letter = string(abi.encodePacked(_battle.maskedWord[0]));
    _battle.guesses = string(letter);

    updateBattle(battleName, _battle);

    // console.log('maskedWord',  string(_battle.maskedWord));
    //console.log('joinBattle: ActivePlayer',  getActivePlayer(battleName));

    players[playerIndex[_battle.players[0]]].inBattle = true;
    players[playerIndex[_battle.players[1]]].inBattle = true;

    emit BattleBegin(_battle.name, _battle.players[0], msg.sender, string(_battle.maskedWord)); // Emits Battle begin event
    return _battle;
  }

  // Read battle turn info for player 1 or player 2
  function getActivePlayer(string memory battleName) public view returns (address) {
    Battle memory _battle = getBattle(battleName);
    return (_battle.activePlayer);
  }

  function getNumberOfIncorrectGuess(string memory battleName) public view returns (uint8) {
    Battle memory _battle = getBattle(battleName);
    return (_battle.incorrectGuess);
  }

  function _switchActivePlayer(string memory battleName) internal view returns (address) {
    Battle memory _battle = getBattle(battleName);
    if (_battle.players[0] == getActivePlayer(battleName))
      return _battle.players[1];
    else
      return _battle.players[0];
  }

  function chosenLetter(bytes1 pLetter, string memory battleName) external {
    //console.log('chosenLetter');
    bool _findNewLetter = false;
    Battle memory _battle = getBattle(battleName);
    //console.log('chosenLetter: ActivePlayer',  msg.sender, getActivePlayer(battleName));

    require( _battle.battleStatus == BattleStatus.STARTED, "Battle not started. Please tell another player to join the battle" ); // Require that battle has started
    require( _battle.battleStatus != BattleStatus.ENDED, "chosenLetter: Battle has already ended" ); // Require that battle has not ended
    require( msg.sender == _battle.players[0] || msg.sender == _battle.players[1], "You are not in this battle" ); // Require that player is in the battle
    require( msg.sender ==  getActivePlayer(battleName), "It is not your turn" );
    require( _battle.incorrectGuess <= 6, "Too bad choice" );

    //console.log('ActivePlayer',  getActivePlayer(battleName));
    //EGA require(_battle.letters[_battle.players[0] == msg.sender ? 0 : 1] == 0, "You have already chosen this letter");
    //_registerPlayerLetter(_battle.players[0] == msg.sender ? 0 : 1, pLetter, battleName);
    //console.log('maskedWord',  string(_battle.maskedWord));
    (_findNewLetter, _battle.maskedWord) = tryTheChosenLetter(_battle.maskedWord, bytes(wordToGuess), pLetter);

    //console.log('chosenLetter avant switch: ActivePlayer',  getActivePlayer(battleName), _findNewLetter);
    //Player find a letter can reply
    if (!_findNewLetter) {
      uint indexP1 = playerIndex[_battle.players[0]];
      uint indexP2 = playerIndex[_battle.players[1]];
      // console.log(indexP1, indexP2);

      if (players[indexP1].playerAddress == _battle.activePlayer) {
        players[indexP1].playerHealth -= 1;
        // console.log(players[indexP1].playerHealth);
      }
      else if (players[indexP2].playerAddress == _battle.activePlayer) {
        players[indexP2].playerHealth -= 1;
        // console.log(players[indexP2].playerHealth);
      } else {
        console.log("error: !_findNewLetter");
      }
      _battle.incorrectGuess += 1;
      _battle.activePlayer = _switchActivePlayer(battleName);
    }
    string memory letter = string(abi.encodePacked(pLetter));
    _battle.guesses = string.concat(_battle.guesses, letter);

    updateBattle(battleName, _battle);

    emit BattleLetter(_findNewLetter, getMaskedWord(battleName));

    if (_findNewLetter)
      _awaitBattleResults(battleName);
    else if (_battle.incorrectGuess >=6)
      _endBattle(_battle.activePlayer, _battle);
  }

  // Awaits battle results
  function _awaitBattleResults(string memory battleName) internal {
    Battle memory _battle = getBattle(battleName);

    require( msg.sender == _battle.players[0] || msg.sender == _battle.players[1], "Only players in this battle can make a move" );

    _resolveBattle(_battle);
  }

  // struct P {
  //   uint index;
  //   bytes letter;
  //   uint health;
  // }

  /// @dev Resolve battle function to determine winner and loser of battle
  /// @param _battle battle; battle to resolve
  function _resolveBattle(Battle memory _battle) internal {
    //console.log('resolveBattle', _battle.name);
    require(_battle.players[0] == msg.sender || _battle.players[1] == msg.sender, "_resolveBattle:You are not in this battle!");
    bool _wordIsFind = false;

    _wordIsFind = tryWordToGuess(bytes(wordToGuess), _battle.maskedWord);

    emit RoundEnded();

    if (_wordIsFind)
      _endBattle(_battle.activePlayer, _battle);
  }

  /// @notice a withdraw function for players
  function playerWithdraw( Battle memory battle, uint256 gain ) internal onlyPlayer(battle) {
    //require(battle != undefine, 'battle');
    require(gain > 0, 'gain <= 0');
    uint256 withdraw = gain;
    address payable _winner = payable(battle. winner);
    gain = 0;
    emit PlayerWithdraw(_winner, withdraw);
    // _winner.transfer(address(this).balance);
    (bool success, ) = _winner.call{value: withdraw}("");
    assert(success);
    if (!success)
      revert( "Address: unable to send value, recipient may have reverted" );
  }

  function quitBattle(string memory battleName) external {
    console.log('quitBattle', battleName);
    Battle memory _battle = getBattle(battleName);
    require(_battle.players[0] == msg.sender || _battle.players[1] == msg.sender, "quitBattle:You are not in this battle!");

    _battle.players[0] == msg.sender ? _endBattle(_battle.players[1], _battle) : _endBattle(_battle.players[0], _battle);
  }

  /// @dev internal function to end the battle
  /// @param battleWinner winner address
  /// @param _battle battle; taken from attackOrDefend function
  function _endBattle(address battleWinner, Battle memory _battle) internal returns (Battle memory) {
    //console.log('_endBattle', _battle.name);
    require(_battle.battleStatus != BattleStatus.ENDED, "_endBattle: Battle already ended"); // Require that battle has not ended

    _battle.battleStatus = BattleStatus.ENDED;
    _battle.winner = battleWinner;
    updateBattle(_battle.name, _battle);

    uint p1 = playerIndex[_battle.players[0]];
    uint p2 = playerIndex[_battle.players[1]];

    players[p1].inBattle = false;
    players[p1].playerHealth = 6;
    players[p1].playerMana = 10;

    players[p2].inBattle = false;
    players[p2].playerHealth = 6;
    players[p2].playerMana = 10;

    address _battleLoser = battleWinner == _battle.players[0] ? _battle.players[1] : _battle.players[0];
    emit BattleEnded(_battle.name, battleWinner, _battleLoser); // Emits BattleEnded event

    require(battleWinner == _battle.players[0] || battleWinner == _battle.players[1]);
    uint256 toSend =  _battle.bet*2;
    _battle.bet = 0;
    playerWithdraw( _battle, toSend );

    // (bool success, ) = battleWinner.call{value: toSend}(
    //     abi.encodeWithSignature("receive()", battleWinner, _battle.bet*2)
    //     //abi.encodeWithSignature("doesNotExist()")
    // );
    // require(success, "Failed to send Ether");
    // if (!success)
    //   console.log('not sent:', success);

    return _battle;
  }

  // Turns uint256 into string
  function uintToStr(uint256 i) internal pure returns (string memory _uintAsString) {
    if (i == 0) {
      return '0';
    }
    uint256 j = i;
    uint256 len;
    while (j != 0) {
      len++;
      j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint256 k = len;
    while (i != 0) {
      k = k - 1;
      uint8 temp = (48 + uint8(i - (i * 10 / 10)));
      bytes1 b1 = bytes1(temp);
      bstr[k] = b1;
      i /= 10;
    }
    return string(bstr);
  }

  // Token URI getter function
  function tokenURI(uint256 tokenId) public view returns (string memory) {
    return string(abi.encodePacked(baseURI, '/', uintToStr(tokenId), '.json'));
  }

  // The following functions are overrides required by Solidity.
  function _beforeTokenTransfer(
    address operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal override(ERC1155, ERC1155Supply) {
    super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
  }

  ///WORD
  function getHangWord(string memory maskedWord) external returns (bytes memory hangWord) {
    require(isLowerCaseWord(maskedWord), "Error, word with lowercase letters only");

    uint256 randomWord = VRFPenduel(_VRF).getRandomValue(0);
    uint256 indexRandom = (randomWord % wordsToGuess.length);
    hangWord = bytes(wordsToGuess[indexRandom]);

    wordsToGuess.push(maskedWord);
    return hangWord;
  }

  ///WORD
  function addWord(string memory wordToAdd) external onlyOwner {
    require(isLowerCaseWord(wordToAdd), "Error, word with lowercase letters only");
    wordsToGuess.push(wordToAdd);
    emit WordAdded(wordToAdd);
  }

  /// @param b bytes1 to check if is letter or not
  /// @notice check if is a letter
  function isLetter(bytes1 b) private pure returns (bool) {
      if (!(b >= 0x61 && b <= 0x7A)) {
          //a-z
          return false;
      }
      return true;
  }

  /// @param word_ bytes check if word is composed of lower case letters
  /// @notice check if is a letter
  function isLowerCaseWord(string memory word_) private pure returns (bool) {
    bytes memory word = bytes(word_);
    for (uint8 i = 0; i < 32 && i < word.length; i++) {
        if (!isLetter(word[i])) {
            return false;
        }
    }
    return true;
  }

  /// @param guessWord to compare
  /// @param letter to check
  /// @notice compare and copy identical letter
  function tryTheChosenLetter(bytes memory maskedWord, bytes memory guessWord, bytes1 letter) private pure returns (bool _findNewLetter, bytes memory) {
    _findNewLetter = false;
    for (uint8 i = 1; i < 32 && i < guessWord.length; i++) {
      //console.log('change letter', string(abi.encode(wordToGuess[i])), string(abi.encode(letter)));
      if (guessWord[i] == letter && maskedWord[i] == '_') {
        maskedWord[i] = letter;
        _findNewLetter = true;
      }
    }
    //console.log('tryTheChosenLetter word', string(wordToGuess), wordToGuess.length);
    return (_findNewLetter, maskedWord);
  }

  /// @param guessWord to compare
  /// @param maskedWord to compare
  /// @notice compare and copy identical letter
  function tryWordToGuess(bytes memory guessWord, bytes memory maskedWord) private pure returns (bool _wordIsFind) {
    _wordIsFind = true;
    for (uint8 i = 0; i < 32 && i < guessWord.length; i++) {
      if (guessWord[i] != maskedWord[i])
        _wordIsFind = false;
    }
    //console.log('tryWordToGuess', _wordIsFind);
    return (_wordIsFind);
  }
}
