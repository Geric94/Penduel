import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles';
import { useGlobalContext } from '../context';
import { CustomButton, CustomInput, GameLoad, PageHOC } from '../components';
//import { walletconnect } from 'web3modal/dist/providers/connectors';

const CreateBattle = () => {
  const { contract, gameData, battleName, setBattleName, setErrorMessage } = useGlobalContext();
  const [waitBattle, setWaitBattle] = useState(false);
  const [betValue, setBetValue] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    if (gameData?.activeBattle?.battleStatus === 1) {
      navigate(`/battle/${gameData.activeBattle.name}`);
    } else if (gameData?.activeBattle?.battleStatus === 0) {
      setWaitBattle(true);
    }
  }, [gameData]);

  const handleClick = async () => {
    if (battleName === '' || battleName.trim() === '') return null;

    try {
      await contract.createBattle(battleName);
      //.send({ from: gameData.activeBattle.player , value: gameData.activeBattle.bet });
      setWaitBattle(true);
    } catch (error) {
      setErrorMessage(error);
      navigate('/');
    }
  };

  return (
    <>
      {waitBattle && <GameLoad />}

      <div className="flex flex-row items-center mb-5">
        <CustomInput
          label="Battle"
          placeHolder="Enter battle name"
          value={battleName}
          handleValueChange={setBattleName}
          restStyles="ml-6 mr-6"
        />
        <CustomInput
          // label="Bet"
          type='number'
          placeHolder="Bet (Wei)"
          value={betValue}
          handleValueChange={setBetValue}
          restStyles="ml-2 mr-2 w-20"
        />
        <CustomButton
          title="Create Battle"
          handleClick={handleClick}
        />
      </div>
      <p className={styles.infoText} onClick={() => navigate('/join-battle')}>
        Or join already existing battles
      </p>
    </>
  );
};

export default PageHOC(
  CreateBattle,
  <>Create a new Battle</>,
  <>Create your own battle and wait for other players to join you</>,
);