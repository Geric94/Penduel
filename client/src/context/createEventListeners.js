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
		console.log('New player created!', args);

		if (walletAddress === args.owner) {
			setShowAlert({
				status: true,
				type: 'success',
				message: "Player has been successfully registered"
			});
		}
	});

  const NewBattleEventFilter = contract.filters.NewBattle();
  
  AddNewEvent(NewBattleEventFilter, provider, ({ args }) => {
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
      setShowAlert({
        status: true,
        type: 'success',
        message: 'Player game token has been successfully generated',
      });

      navigate('/create-battle');
    }
  });
}