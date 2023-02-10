import { ethers } from "ethers";

import { ABI } from "../contract";

const AddNewEvent = (eventFilter, provider, cb) => {
	provider.removeListener(eventFilter);

	provider.on(eventFilter, (logs) => {
		const parsedLog = (new ethers.utils.Interface(ABI)).parseLog(logs);

		cb(parsedLog);
	});
};

export const createEventListeners = ({ navigate, contract, provider, walletAddress, setShowAlert, setUpdateGameData, 
  setMaskedWord, incorrectGuesses, setIncorrectGuesses, setGameOver, guesses, setGuesses}) => {

	const NewPlayerEventFilter = contract.filters.NewPlayer();

	AddNewEvent(NewPlayerEventFilter, provider, ({ args}) => {
		//console.log(`New player "${args.playerName}" created!`, args);

		if (walletAddress === args.owner) {
			setShowAlert({ status: true, type: 'success', message: `Player "${args.playerName}" has been successfully registered` });
		}
	});

  const BattleCreateEventFilter = contract.filters.BattleCreate();
  
  AddNewEvent(BattleCreateEventFilter, provider, ({ args }) => {
    console.log(`New battle "${args.battleName}" created!`, args);

    // if (walletAddress.toLowerCase() === args.player1.toLowerCase() || walletAddress.toLowerCase() === args.player2.toLowerCase()) {
    //   navigate(`/battle/${args.battleName}`);
    // }

    setUpdateGameData((updateGameData) => updateGameData + 1);
  });

  const BattleBeginEventFilter = contract.filters.BattleBegin();
  
  AddNewEvent(BattleBeginEventFilter, provider, ({ args }) => {
    console.log('New battle started!', args, walletAddress);

    if (walletAddress.toLowerCase() === args.player1.toLowerCase() || walletAddress.toLowerCase() === args.player2.toLowerCase()) {
      navigate(`/battle/${args.battleName}`);
    }
    setMaskedWord(args._maskedWord);
    guesses.push(args._maskedWord[0]);  //Add the first letter in the guesses
    console.log('BattleBegin:', args._maskedWord);

    setUpdateGameData((updateGameData) => updateGameData + 1);
  });

  const NewGameTokenEventFilter = contract.filters.NewGameToken();

  AddNewEvent(NewGameTokenEventFilter, provider, ({ args }) => {
    //console.log('New game token created!', args);

    if (walletAddress.toLowerCase() === args.owner.toLowerCase()) {
      setShowAlert({ status: true, type: 'success', message: 'Player game token has been successfully generated', });

      navigate('/create-battle');
    }
  });

  const BattleLetterEventFilter = contract.filters.BattleLetter();

  AddNewEvent(BattleLetterEventFilter, provider, ({ args }) => {
    console.log('New letter guesses!', args._findNewLetter, args._maskedWord, args._letter );
    setMaskedWord(args._maskedWord);

 		// Update the guesses state variable
    guesses.push(args._letter);
		//setGuesses(guesses => [...guesses, args._letter]); //ne marche pas
		console.log(guesses);

    if (args._findNewLetter == false){
      setIncorrectGuesses(incorrectGuesses + 1);
    }

    setUpdateGameData((updateGameData) => updateGameData + 1);
  });

  const RoundEndedEventFilter = contract.filters.RoundEnded();

  AddNewEvent(RoundEndedEventFilter, provider, ({ args }) => {
    console.log('Round ended!', args, walletAddress); //The game is over

    if (args._wordIsFind == true) {
      setGameOver(true);
    }

    // for (let i = 0; i < args.damagedPlayers.length; i += 1) {
    //   if (args.damagedPlayers[i] !== emptyAccount) {
    //     if (args.damagedPlayers[i] === walletAddress) {
    //       sparcle(getCoords(player1Ref));
    //     } else if (args.damagedPlayers[i] !== walletAddress) {
    //       sparcle(getCoords(player2Ref));
    //     }
    //   } else {
    //     playAudio(defenseSound);
    //   }
    // }

    setUpdateGameData((updateGameData) => updateGameData + 1);
  });

  // Battle Ended event listener
  const BattleEndedEventFilter = contract.filters.BattleEnded();

  AddNewEvent(BattleEndedEventFilter, provider, ({ args }) => {
    if (walletAddress.toLowerCase() === args.winner.toLowerCase()) {
      setShowAlert({ status: true, type: 'success', message: 'You won!' });
    } else if (walletAddress.toLowerCase() === args.loser.toLowerCase()) {
      setShowAlert({ status: true, type: 'failure', message: 'You lost!' });
    }

    navigate('/create-battle');
    setUpdateGameData((updateGameData) => updateGameData + 1);
  });

  // The word is add to the list
  const WordAddEventFilter = contract.filters.WordAdded();

  AddNewEvent(WordAddEventFilter, provider, ({ args }) => {
      setShowAlert({ status: true, type: 'success', message: 'The word is add to the list' });
  });
}