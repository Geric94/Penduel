import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import styles from '../styles';
import { Alert, Card, GameInfo, PlayerInfo, CustomButton, AlphabetButtons } from '../components';
import { useGlobalContext } from '../context';
//import { attack, attackSound, defense, defenseSound, player01 as player01Icon, player02 as player02Icon } from '../assets';
// import { playAudio } from '../utils/animation.js';

const Battle = () => {
	const { contract, gameData, battleGround, walletAddress, setErrorMessage, showAlert, setShowAlert, player1Ref, player2Ref } = useGlobalContext();
	const [player2, setPlayer2] = useState({});
	const [player1, setPlayer1] = useState({});
	const { battleName } = useParams();
	const navigate = useNavigate();
	const [currentLetter, setCurrentLetter] = useState('');
	// Set up state variables using the useState hook
	const [word, setWord] = useState('hangman');
	const [guesses, setGuesses] = useState([]);
	const [incorrectGuesses, setIncorrectGuesses] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const alphabet = 'abcdefghijklmnopqrstuvwxyz';

  // Use the useEffect hook to listen for updates to the guesses state variable
  useEffect(() => {
    // Check if the player has won or lost the game
    if (incorrectGuesses >= 6) {
      setGameOver(true);
    } else if (word.split('').every((letter) => guesses.includes(letter))) {
      setGameOver(true);
    }
  }, [guesses, incorrectGuesses]);

	// Function to handle player guesses
	const handleGuess = (letter1) => {
		setCurrentLetter(letter1);

    if (gameOver) return; // Do nothing if the game is already over
    if (guesses.includes(letter1)) return; // Do nothing if the letter has already been guessed

    // Update the guesses state variable
    setGuesses([...guesses, letter1]);

    // If the letter is not in the word, increase the incorrect guess count
    if (!word.includes(letter1)) {
      setIncorrectGuesses(incorrectGuesses + 1);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!gameData?.activeBattle) navigate('/');
    }, [2000]);

    return () => clearTimeout(timer);
  }, []);

  const makeAMove = async (choice) => {
    //playAudio(choice === 1 ? attackSound : defenseSound);

    try {
      await contract.attackOrDefendChoice(choice, battleName, { gasLimit: 200000 });

      setShowAlert({
        status: true,
        type: 'info',
        message: `Initiating ${choice === 1 ? 'attack' : 'defense'}`,
      });
    } catch (error) {
      setErrorMessage(error);
    }
  };

	return (
		<div className={`${styles.flexBetween} ${styles.gameContainer} ${battleGround}`}>
      		{showAlert?.status && <Alert type={showAlert.type} message={showAlert.message} />}

			<PlayerInfo player={player2} mt />

		    <div className={`${styles.flexCenter} flex-col`}>
        		<Card
			        card={player2}
			        title={player2?.playerName}
			        cardRef={player2Ref}
			        playerTwo
		        />

				<h1 className="text-xl test-white">{battleName}</h1>
				{/* <Card
					card={player1}
					title={player1?.playerName}
					cardRef={player1Ref}
					restStyles="mt-3"
				/> */}
			</div>

			<PlayerInfo player={player1}/>

			<GameInfo />

			<h1 className='text-xl text-white'>Penduel</h1>

			{/* Display the word with underscores for unguessed letters */}
				<p className='px-1 py-1 rounded-lg bg-siteViolet w-fit text-white font-rajdhani font-bold mt-1 ml-1 mr-1 mb-1'>
				{word.split('').map((letter2) => (
					guesses.includes(letter2) ? letter2 : '_' +' '
				))}</p>
			<br />
			{/* Display the incorrect guess count */}
				<p className='text-xl text-white'>Incorrect guesses: {incorrectGuesses}</p>
				<br />
			{/* <AlphabetButtons 
				handleClick={handleGuess}
			/> */}
			<div>
				{/* Render the keyboard for making guesses */}
				{alphabet.split('').map((letter3) => (
					<button className='px-1 py-1 rounded-lg bg-siteViolet w-fit text-white font-rajdhani font-bold mt-1 ml-1 mr-1 mb-1'
								onClick={() => handleGuess(letter3)}>{letter3}</button>
				))}
			</div>
			<p className='text-xl text-white'>Letter selected: {currentLetter}</p>
			<p className='text-xl text-white'>{gameOver && 'Game over!'}</p>

			<p id="catagoryName" />
				<div id="hold"></div>
			<p id="mylives" />

			<p className='text-xl text-white' id="clue">Clue -</p>  
			<canvas id="stickman">This Text will show if the Browser does NOT support HTML5 Canvas tag</canvas>
			<div className={`${styles.flexBetween} mt-10 gap-4 w-full`}>
				{/* <button id="hint">Hint</button> */}
				<CustomButton
					title="hint"
					//handleClick={handleClick}
					restStyles="mt-6"
				/>
				{/* <button id="reset">Play again</button> */}
				<CustomButton
					title="Play again"
					//handleClick={handleClick}
					restStyles="mt-6"
				/>
			</div>
		</div>
  );
};

export default Battle;