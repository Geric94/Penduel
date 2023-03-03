import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles';
import { useGlobalContext } from '../context';
import { CustomButton, CustomInput, GameLoad, PageHOC, AmountIn } from '../components';
import { parseUnits } from "ethers/lib/utils";
//import { walletconnect } from 'web3modal/dist/providers/connectors';

const CreateBattle = () => {
  const { contract, gameData, battleName, setBattleName, bet, setBet, setErrorMessage } = useGlobalContext();
  const [waitBattle, setWaitBattle] = useState(false);
  const navigate = useNavigate();
  const fromValueBigNumber = parseUnits(bet); // converse the string to bigNumber

  useEffect(() => {
    if (gameData?.activeBattle?.battleStatus === 1) {
      navigate(`/battle/${gameData.activeBattle.name}`);
    } else if (gameData?.activeBattle?.battleStatus === 0) {
      setWaitBattle(true);
    }
  }, [gameData]);

  const handleClick = async () => {
    if (battleName === '' || battleName.trim() === '') return null;
    if (bet === '' || bet.trim() === '') return null;

    try {
      //await setBet(bet);
      console.log(battleName, parseUnits(bet)/100);
      await contract.createBattle(battleName, {value: parseUnits(bet)});
      setWaitBattle(true);
    } catch (error) {
      console.log(error);
      setErrorMessage(error?error:'Error handleClick');
      //navigate('/');
    }
  };

  const onFromValueChange = (value) => {
    const trimmedValue = value.trim();

    try {
      trimmedValue && value; //parseUnits(value);
      //console.log('value: ', value);
      setBet(value);
    } catch (e) {
      setErrorMessage(error);
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
        <div>
          <AmountIn
            value={bet}
            onChange={onFromValueChange}
          />
        </div>
        <CustomButton
          title="Create Battle"
          handleClick={handleClick}
          restStyles="ml-6 mr-6"
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