import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import styles from '../styles';
import { Alert, Card, GameInfo, PlayerInfo, WaitPlayer, CustomButton, AlphabetButtons } from '../components';
import { useGlobalContext } from '../context';
import { player01 as player01Icon, player02 as player02Icon } from '../assets';
//import { attack, attackSound, defense, defenseSound, player01 as player01Icon, player02 as player02Icon } from '../assets';
// import { playAudio } from '../utils/animation.js';
import man from '../assets/man.png';

const manImg = man;

const Battle = () => {
	const { contract, gameData, battleGround, setErrorMessage, showAlert, setShowAlert, player1Ref, player2Ref, 
		maskedWord, setMaskedWord, incorrectGuesses, guesses, gameOver, setGameOver, walletAddress } = useGlobalContext();
	const [player2, setPlayer2] = useState({});
	const [player1, setPlayer1] = useState({});
	const { battleName } = useParams();
	const navigate = useNavigate();
	const [currentLetter, setCurrentLetter] = useState('');
	const [waitPlayer, setWaitPlayer] = useState(false);

	// Set up state variables using the useState hook
	const alphabet = 'abcdefghijklmnopqrstuvwxyz';

	useEffect(() => {
		const getPlayerInfo = async () => {
			try {
				let player01Address;
				let player02Address;
				Wait();
				if (gameData.activeBattle.players[0].toLowerCase() == walletAddress.toLowerCase()) {
					player01Address = gameData.activeBattle.players[0];
					player02Address = gameData.activeBattle.players[1];
				} else {
					player01Address = gameData.activeBattle.players[1];
					player02Address = gameData.activeBattle.players[0];
				}
				let _string = await contract.getMaskedWord(gameData.activeBattle.battleName);
				//console.log(_string);
				setMaskedWord(_string);
				console.log('getPlayerInfo:',maskedWord);
				const p1TokenData = await contract.getPlayerToken(player01Address);
				const player01 = await contract.getPlayer(player01Address);
				const player02 = await contract.getPlayer(player02Address);
		
				const p1Att = p1TokenData.attackStrength.toNumber();
				const p1Def = p1TokenData.defenseStrength.toNumber();
				const p1H = player01.playerHealth.toNumber();
				const p1M = player01.playerMana.toNumber();
				const p2H = player02.playerHealth.toNumber();
				const p2M = player02.playerMana.toNumber();
		
				setPlayer1({ ...player01, att: p1Att, def: p1Def, health: p1H, mana: p1M });
				setPlayer2({ ...player02, att: 'X', def: 'X', health: p2H, mana: p2M });
				console.log('getPlayerInfo:waitPlayer', waitPlayer);			
			} catch (error) {
				setErrorMessage(error.message);
			}
		};

		if (contract && gameData.activeBattle) 
			getPlayerInfo();
	}, [contract, gameData, battleName]);
	
		
	// Use the useEffect hook to listen for updates to the guesses state variable
	useEffect(() => {
		// Check if the player has won or lost the game
		document.documentElement.style.setProperty('--mann-pos', (incorrectGuesses*-75) +"px");
		if (incorrectGuesses >= 6) {
			console.log(`incorrectGuesses= ${incorrectGuesses}`);
			setWaitPlayer(false);
			setGameOver(true);
		};
	}, [guesses, incorrectGuesses]);

	// Function to handle player guesses
	const handleGuess = async (letter1) => {
		setCurrentLetter(letter1);

		if (gameOver) {
			console.log(`You're hanged ${battleName}`);
			try {
				await contract._endBattle(null, battleName);
		  
				setShowAlert({ status: true, type: 'info', message: `You're hanged ${battleName}` });
			} catch (error) {
				setErrorMessage(error);
			};
			navigate('/create-battle');
			return; // Do nothing more if the game is already over
		}
		if (guesses.includes(letter1) == true) {
			setShowAlert({ status: true, type: 'failure', message: `This letter ${letter1} has already been played`, });
			return; // Do nothing if the letter has already been guessed
		} else {
			setShowAlert({ status: true, type: 'info', message: `Chosen letter ${letter1}`});
		}

		try {
			let bytes2 = new TextEncoder().encode(letter1);
			await contract.chosenLetter(bytes2, battleName, { gasLimit: 200000 });
		} catch (error) {
			console.log(error, letter1, maskedWord, battleName);
			setErrorMessage(error.message);
		}
	}

	useEffect(() => {
		const timer = setTimeout(() => {
			if (!gameData?.activeBattle)
				navigate('/create-battle');
			}, [2000]);
		Wait();
		return () => clearTimeout(timer);
	}, []);

	const Wait = async () => {
		let activePlayerddress = await contract?.getActivePlayer(battleName);
		//console.log('Wait:getActivePlayer', activePlayerddress);
		let _waitPlayer = ( activePlayerddress?.toLowerCase() != walletAddress.toLowerCase());
		console.log('Wait:activePlayer', activePlayerddress, walletAddress.toLowerCase(), _waitPlayer);
		setWaitPlayer(waitPlayer => _waitPlayer);
		//console.log('Wait:waitPlayer', waitPlayer);	
	}

	return (
		<>
		{waitPlayer && <WaitPlayer />}

		<div className={`${styles.flexBetween} ${styles.gameContainer} ${battleGround}`}>
      		{showAlert?.status && <Alert type={showAlert.type} message={showAlert.message} />}

			<PlayerInfo player={player1} playerIcon={player01Icon} mt />

		    {/* <div className={`${styles.flexCenter} flex-col`}> */}
        		{/* <Card
			        card={player2}
			        title={player2?.playerName}
			        cardRef={player2Ref}
			        playerTwo
		        /> */}

				<h1 className="text-xl test-white">{battleName}</h1>
				<div className={`${styles.cardMann_in}`}>
          			<img src={manImg} alt="Man" left="0px" className={`${styles.cardMann}`}/>
			    </div>
				{/* <Card
					card={player1}
					title={player1?.playerName}
					cardRef={player1Ref}
					restStyles="mt-3"
				/> */}
			{/* </div> */}

			<PlayerInfo player={player2} playerIcon={player02Icon}/>

			{/* <h1 className='text-xl text-white'>Penduel</h1> */}

			{/* Display the word with underscores for unguessed letters */}
				<p className='px-1 py-1 rounded-lg bg-siteViolet w-fit text-white font-rajdhani font-bold mt-1 ml-1 mr-1 mb-1'>
					{maskedWord}
				</p>
			<br />
			{/* Display the incorrect guess count */}
				<p className='text-xl text-white'>Incorrect guesses: {incorrectGuesses} {waitPlayer && ',waitPlayer'}</p>
				<br />
			<div>
				{/* Render the keyboard for making guesses */}
				{alphabet.split('').map((letter3) => (
					<button key={letter3} className='px-1 py-1 rounded-lg bg-siteViolet w-fit text-white font-rajdhani font-bold mt-1 ml-1 mr-1 mb-1'
								onClick={() => handleGuess(letter3)}>{letter3}</button>
				))}
			</div>
			<p className='text-xl text-white'>Letter selected: {currentLetter} {gameOver && 'Game over!'}</p>

			{/* <p id="catagoryName" />
				<div id="hold"></div>
			<p id="mylives" />

			<p className='text-xl text-white' id="clue">Clue -</p>  
			<canvas id="stickman">This Text will show if the Browser does NOT support HTML5 Canvas tag</canvas>
			<div className={`${styles.flexBetween} mt-10 gap-4 w-full`}>
				<button id="hint">Hint</button>
				<CustomButton
					title="hint"
					handleClick={handleClick}
					restStyles="mt-6"
				/>
				<button id="reset">Play again</button>
				<CustomButton
					title="Play again"
					handleClick={handleClick}
					restStyles="mt-6"
				/>
			</div> */}

			<GameInfo />

		</div>
	</>
  );
};

export default Battle;