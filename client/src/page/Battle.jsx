import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import styles from '../styles';
import { Alert, Card, GameInfo, PlayerInfo, PendingPlayer } from '../components';
import { useGlobalContext } from '../context';
import { AlyraRedIcon, AlyraGreenIcon } from '../assets';
import man from '../assets/man.png';

const manImg = man;

const Battle = () => {
	const { contract, gameData, battleGround, setErrorMessage, showAlert, setShowAlert, walletAddress } = useGlobalContext();
	const [player2, setPlayer2] = useState({});
	const [player1, setPlayer1] = useState({});
	const { battleName } = useParams();
	const navigate = useNavigate();
	const [currentLetter, setCurrentLetter] = useState('');
	const [pendingPlayer, setPendingPlayer] = useState(false);
	const [maskedWord, setMaskedWord] = useState("");
	const [guesses, setGuesses] = useState("");
	const [incorrectGuesses, setIncorrectGuesses] = useState(0);

	// Set up state variables using the useState hook
	let alphabet = 'abcdefghijklmnopqrstuvwxyz';

	useEffect(() => {
		const getPlayerInfo = async () => {
			try {
				if (gameData.activeBattle == null) {
					console.log('getPlayerInfo: activeBattle =', gameData.activeBattle);
					return;
				}
				let player01Address;
				let player02Address;
				setGameOver(gameData.activeBattle?.status);
				if (gameOver)
					setPendingPlayer(false);
				else
					Pending();
				if (gameData.activeBattle?.players[0].toLowerCase() == walletAddress.toLowerCase()) {
					player01Address = gameData.activeBattle.players[0];
					player02Address = gameData.activeBattle.players[1];
				} else if (gameData.activeBattle?.players[1].toLowerCase() == walletAddress.toLowerCase()) {
					player01Address = gameData.activeBattle.players[1];
					player02Address = gameData.activeBattle.players[0];
				}
				else
					console.log(`getPlayerInfo: error access gameData, activeBattle is`, gameData.activeBattle)
				let _string = await contract?.getMaskedWord(battleName);
				setMaskedWord(_string);
				setGuesses(await contract?.getGuesses(battleName));
				setIncorrectGuesses(await contract?.getNumberOfIncorrectGuess(battleName));
				//console.log('getPlayerInfo:maskedWord=', maskedWord);
				if (player01Address!=0x0) {
					const p1TokenData = await contract.getPlayerToken(player01Address);
					const player01 = await contract.getPlayer(player01Address);
					const p1Att = p1TokenData.attackStrength.toNumber();
					const p1Def = p1TokenData.defenseStrength.toNumber();
					const p1H = player01.playerHealth.toNumber();
					const p1M = player01.playerMana.toNumber();
					setPlayer1({ ...player01, att: p1Att, def: p1Def, health: p1H, mana: p1M, icon: AlyraRedIcon});
					//console.log('Player1:',player1);
				}		
				if (player02Address!=0x0) {
					const player02 = await contract.getPlayer(player02Address);
					const p2H = player02.playerHealth.toNumber();
					const p2M = player02.playerMana.toNumber();
					setPlayer2({ ...player02, att: 'X', def: 'X', health: p2H, mana: p2M, icon: AlyraGreenIcon });
					//console.log('getPlayerInfo:pendingPlayer', pendingPlayer);			
				}
		
			} catch (error) {
				console.log('Error:', error.message);
				setErrorMessage(error);
			}
		};

		//if (contract && gameData.activeBattle) 
			getPlayerInfo();
	}, [contract, gameData, battleName]);
	
		
	// Use the useEffect hook to listen for updates to the guesses state variable
	useEffect(() => { //EGA remonter en haut
		// Check if the player has won or lost the game
		document.documentElement.style.setProperty('--mann-pos', (incorrectGuesses*-75) +"px");

		if (incorrectGuesses >= 6) {
			console.log(`incorrectGuesses= `, incorrectGuesses);
			setPendingPlayer(false);
			_battle.battleStatus = BattleStatus.ENDED;
		};
	}, [incorrectGuesses]);

	// Function to handle player guesses
	const handleGuess = async (_letter1) => {
		setCurrentLetter(_letter1);

		if (gameOver) {
			console.log(`You're hanged ${battleName}`);
			setPendingPlayer(false);
			try {
				setShowAlert({ status: true, type: 'failure', message: `You're hanged ${battleName}` });
				await contract.quitBattle(battleName);
			} catch (error) {
				console.log(error);
				setErrorMessage(error);
			};
			navigate('/');
			return; // Do nothing more if the game is already over
		}
		if (guesses.includes(_letter1) == true) {
			setShowAlert({ status: true, type: 'failure', message: `This letter ${_letter1} has already been played`, });
			return; // Do nothing if the letter has already been guessed
		} else {
			setShowAlert({ status: true, type: 'info', message: `Chosen letter ${_letter1}`});
		}

		try {
			let bytes2 = new TextEncoder().encode(_letter1);
			await contract.chosenLetter(bytes2, battleName, { gasLimit: 200000 });
			
		} catch (error) {
			console.log(error, _letter1, maskedWord, battleName);
			setErrorMessage(error);
		}
	}

	useEffect(() => {
		const timer = setTimeout(() => {
			if (!gameData?.activeBattle)
				navigate('/create-battle');
			}, [2000]);
		if (gameOver)
			setPendingPlayer(false);
		else
			Pending();
		return () => clearTimeout(timer);
	}, []);

	const Pending = async () => {
		let activePlayerddress = await contract?.getActivePlayer(battleName);
		//console.log('Pending:getActivePlayer', activePlayerddress);
		let _pendingPlayer = ( activePlayerddress?.toLowerCase() != walletAddress.toLowerCase());
		//console.log('Pending:activePlayer', activePlayerddress, walletAddress.toLowerCase(), _pendingPlayer);
		setPendingPlayer(pendingPlayer => _pendingPlayer);
		//console.log('Pending:pendingPlayer', pendingPlayer);	
	}

	const Checked = (_letter) => {
		if (guesses.includes(_letter))
			return `${styles.guessChecked}`;
		else
			return `${styles.guess}`;
	};

	return (
		<>
 		{showAlert?.status && <Alert type={showAlert.type} message={showAlert.message} />}
		<div className={styles.hocContainer}>

		{pendingPlayer && <PendingPlayer />}

		{/* <div className={`${styles.flexBetween} ${styles.gameContainer} ${battleGround}`}> */}
		{/* <div className="flex flex-col mb-5"> */}

			<div className={`${styles.flexCenter} flex-col ${styles.hocContentBox}`}>
				<h1 className={`flex ${styles.headText} head_text`}>{battleName}</h1>
				<PlayerInfo player={player1} mt />
				{/* <tr>
					<td> <Card
						card={player2}
						title={player2?.playerName}
						cardRef={player2Ref}
						playerTwo/> 
					</td>
					<td> <Card
						card={player1}
						title={player1?.playerName}
						cardRef={player1Ref}
						restStyles="mt-3"/>
					</td>
				</tr> */}
				
				<div className={`${styles.cardMann_in}`}>
					<img src={manImg} alt="Man" left="0px" className={`${styles.cardMann}`}/>
				</div>

				<PlayerInfo player={player2}/>

				{/* Display the word with underscores for unguessed letters */}
					<p className={`${styles.letter} ${styles.guesses}`}>
						{maskedWord}
					</p>
				<br />
				{/* Display the incorrect guess count */}
					<p className='text-xl text-white'>Incorrect guesses: {incorrectGuesses}</p>
					<br />
				<div>
					{/* Render the keyboard for making guesses */}
					{alphabet.split('').map((letter3) => (
						<button key={letter3} alt={letter3} className={`${styles.letter} ${Checked(letter3)}`} // ${styles.guess} opacity-[${Opacity(letter3)}] text-white 
									onClick={() => handleGuess(letter3)}> {letter3}</button>
					))}
				</div>
				<p className='text-xl text-white'>Letter selected: {currentLetter} {gameOver && 'Game over!'}</p>

				<GameInfo />
			</div>
			<div className={`${styles.flexBetween} ${styles.gameContainer} ${battleGround}`}>
	        </div>
		</div>
	</>
  );
};

//export default Battle;
export default Battle;