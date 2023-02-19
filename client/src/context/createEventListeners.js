import { ethers } from "ethers";

import { ABI } from "../contract";

const AddNewEvent = (eventFilter, provider, cb) => {
	provider.removeListener(eventFilter);

	provider.on(eventFilter, (logs) => {
		const parsedLog = (new ethers.utils.Interface(ABI)).parseLog(logs);

		cb(parsedLog);
	});
};

export const createEventListeners = ({ navigate, contract, provider, walletAddress, setShowAlert, setUpdateGameData}) => {

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

    if (walletAddress.toLowerCase() === args.player2.toLowerCase()) {
      navigate(`/join-battle`);
    }
  });

  const BattleBeginEventFilter = contract.filters.BattleBegin();
  
  AddNewEvent(BattleBeginEventFilter, provider, ({ args }) => {
    console.log('New battle started!', args, walletAddress);

    if (walletAddress.toLowerCase() === args.player1.toLowerCase() || walletAddress.toLowerCase() === args.player2.toLowerCase()) {
      navigate(`/battle/${args.battleName}`);
    }

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
    console.log('(BattleLetterEventFilter),_findNewLetter:', args._findNewLetter);
    setUpdateGameData((updateGameData) => updateGameData + 1);
  });

  const RoundEndedEventFilter = contract.filters.RoundEnded();

  AddNewEvent(RoundEndedEventFilter, provider, ({ args }) => {

    setUpdateGameData((updateGameData) => updateGameData + 1);
  });

  // Battle Ended event listener
  const BattleEndedEventFilter = contract.filters.BattleEnded();

  AddNewEvent(BattleEndedEventFilter, provider, ({ args }) => {
    if (walletAddress.toLowerCase() === args.winner.toLowerCase()) {
      setShowAlert({ status: true, type: 'success', message: 'You won!' });
    } else if (walletAddress.toLowerCase() === args.loser.toLowerCase()) {
      setShowAlert({ status: true, type: 'failure', message: 'You lost!' });
    } else {
      setShowAlert({ status: true, type: 'failure', message: 'You lost!' });
    }

    navigate('/');
    setUpdateGameData((updateGameData) => updateGameData + 1);
  });

  // The word is add to the list
  const WordAddEventFilter = contract.filters.WordAdded();

  AddNewEvent(WordAddEventFilter, provider, ({ args }) => {
      setShowAlert({ status: true, type: 'success', message: 'The word is add to the list' });
  });

}