import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import styles from '../styles';
import { Alert, Card, GameInfo, PlayerInfo, CustomButton, AlphabetButtons } from '../components';
import { useGlobalContext } from '../context';
import { player01 as player01Icon, player02 as player02Icon } from '../assets';
//import { attack, attackSound, defense, defenseSound, player01 as player01Icon, player02 as player02Icon } from '../assets';
// import { playAudio } from '../utils/animation.js';

const Battle = () => {
	const { contract, gameData, battleGround, setErrorMessage, showAlert, setShowAlert, player1Ref, player2Ref, 
		maskedWord, setMaskedWord, incorrectGuesses} = useGlobalContext();
	const [player2, setPlayer2] = useState({});
	const [player1, setPlayer1] = useState({});
	const { battleName } = useParams();
	const navigate = useNavigate();
	const [currentLetter, setCurrentLetter] = useState('');
	// Set up state variables using the useState hook
	const [guesses, setGuesses] = useState([]);
	const [gameOver, setGameOver] = useState(false);
	const alphabet = 'abcdefghijklmnopqrstuvwxyz';

	useEffect(() => {
		const getPlayerInfo = async () => {
			try {
				let player01Address = null;
				let player02Address = null;
				if (gameData.activeBattle.players[0].toLowerCase() === walletAddress.toLowerCase()) {
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
			} catch (error) {
				setErrorMessage(error.message);
			}
		};

		if (contract && gameData.activeBattle) getPlayerInfo();
	}, [contract, gameData, battleName]);
	
		
	// Use the useEffect hook to listen for updates to the guesses state variable
	useEffect(() => {
		// Check if the player has won or lost the game
		if (incorrectGuesses >= 6) {
			setGameOver(true);
		} 
		// else if (maskedWord.split('').every((letter) => guesses.includes(letter))) {
		// 	setGameOver(true);
		// }
	}, [/*guesses,*/ incorrectGuesses]);

	// Function to handle player guesses
	const handleGuess = async (letter1) => {
		setCurrentLetter(letter1);

		if (gameOver) return; // Do nothing if the game is already over
		//if (guesses.includes(letter1)) return; // Do nothing if the letter has already been guessed

		// Update the guesses state variable
		setGuesses([...guesses, letter1]);
		console.log(guesses);

		try {
			let bytes2 = new TextEncoder().encode(letter1);
			await contract.chosenLetter(bytes2, battleName, { gasLimit: 200000 });

			setShowAlert({ status: true, type: 'info', message: `Chosen letter ${letter1}`, });
		} catch (error) {
			console.log(error, letter1, maskedWord, battleName);
			setErrorMessage(error.message);
		}
	}

	useEffect(() => {
		const timer = setTimeout(() => {
			if (!gameData?.activeBattle) navigate('/');
		}, [2000]);

		return () => clearTimeout(timer);
	}, []);

	return (
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
				<Card
					card={player1}
					title={player1?.playerName}
					cardRef={player1Ref}
					restStyles="mt-3"
				/>
			{/* </div> */}

			<PlayerInfo player={player2} playerIcon={player02Icon}/>

			{/* <h1 className='text-xl text-white'>Penduel</h1> */}

			{/* Display the word with underscores for unguessed letters */}
				<p className='px-1 py-1 rounded-lg bg-siteViolet w-fit text-white font-rajdhani font-bold mt-1 ml-1 mr-1 mb-1'>
					{maskedWord}
				</p>
			<br />
			{/* Display the incorrect guess count */}
				<p className='text-xl text-white'>Incorrect guesses: {incorrectGuesses}</p>
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
  );
};

export default Battle;