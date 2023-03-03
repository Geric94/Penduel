import React, { createContext, useContext,  useEffect, useRef, useState } from "react";
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { useNavigate } from "react-router-dom";

import { ABI, ADDRESS } from '../contract';
import { createEventListeners} from './createEventListeners';

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
	const [walletAddress, setWalletAddress] = useState('');
	const [contract, setContract] = useState(null);
	const [provider, setProvider] = useState(null);
  const [gameData, setGameData] = useState({ pendingBattles: [], activeBattle: null});
	const [showAlert, setShowAlert] = useState({ status: false, type: "info", message: '' });
	const [battleName, setBattleName] = useState('');
	const [bet, setBet] = useState("0.1");
	const [errorMessage, setErrorMessage] = useState('');
  const [updateGameData, setUpdateGameData] = useState(0);
	const [battleGround, setBattleGround] = useState('bg-penduel');

  const player1Ref = useRef();
  const player2Ref = useRef();

	const navigate = useNavigate();

	//* Set the wallet address to the state
	const updateCurrentWalletAddress = async () => {
		const accounts = await window?.ethereum?.request({ method: 'eth_accounts' });

		if (accounts) setWalletAddress(accounts[0]);
	};

	useEffect(() => {
		updateCurrentWalletAddress();

		window?.ethereum?.on('accountsChanged', updateCurrentWalletAddress);
	}, []);

	//* Set the smart contract and provider to the state
	useEffect(() => {
		const setSmartContractAndProvider = async () => {
			const web3Modal = new Web3Modal();
			const connection = await web3Modal.connect();
			const newProvider = new ethers.providers.Web3Provider(connection);
			const signer = newProvider.getSigner();
			const newContract = new ethers.Contract(ADDRESS, ABI, signer);

			setProvider(newProvider);
			setContract(newContract);
		};

		const timer = setTimeout( () => setSmartContractAndProvider(), [1000]);
    return () => clearTimeout(timer);
	}, []);

  //* Activate event listeners for the smart contract
	useEffect(() => {
		if(contract) {
			createEventListeners({
        navigate,
        contract,
        provider,
        walletAddress,
        setShowAlert,
        player1Ref,
        player2Ref,
        setUpdateGameData,
     });
    }
  }, [contract]);


  //* Set the game data to the state
  useEffect(() => {
    //go to search the active battle for the player
    const fetchGameData = async () => {
      if (contract) {
        const fetchedBattles = await contract.getAllBattles();
        // filter only PENDING battle
        const pendingBattles = fetchedBattles.filter((battle) => battle.battleStatus === 0);
        let activeBattle = null;

        fetchedBattles.forEach((battle) => {
          if (battle.players.find((player) => player.toLowerCase() === walletAddress.toLowerCase())) {
            if (battle.winner.startsWith('0x00')) {
              activeBattle = battle;
            }
          }
        });
   
        // we don't care of the first battle
        setGameData({ pendingBattles: pendingBattles.slice(1), activeBattle});
      }
    };

    fetchGameData();
  }, [contract, updateGameData]);

  //* Handle alerts
	useEffect(() => {
		if (showAlert?.status) {
			const timer = setTimeout(() => {
				setShowAlert({status: false, type: "info", message: '' });
			}, [5000]);

			return () => clearTimeout(timer);
		}
	}, [showAlert]);

  //* Handle error messages
  useEffect(() => {
    if (errorMessage) {
      const parsedErrorMessage = errorMessage?.reason?.slice('execution reverted: '.length).slice(0, -1);

      if (parsedErrorMessage) {
        setShowAlert({ status: true, type: 'failure', message: parsedErrorMessage, });
      }
    }
  }, [errorMessage]);

	return (
    <GlobalContext.Provider
      value={{
        player1Ref,
        player2Ref,
        battleGround,
        setBattleGround,
        contract,
        gameData,
        walletAddress,
        updateCurrentWalletAddress,
        showAlert,
        setShowAlert,
        battleName,
        setBattleName,
        bet,
        setBet,
        errorMessage,
        setErrorMessage,
    }}
    >
			{children}
		</GlobalContext.Provider>
	);
};

export const useGlobalContext = () => useContext(GlobalContext);