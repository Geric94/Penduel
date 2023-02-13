import React from 'react';
//import { useNavigate } from 'react-router-dom';

//import CustomButton from './CustomButton';
import { GameInfo } from '../components';
import { useGlobalContext } from '../context';
import { player01, player02 } from '../assets';
import styles from '../styles';

const PendingPlayer = () => {
  const { walletAddress } = useGlobalContext();
  //const navigate = useNavigate();

  return (
    <div className={`${styles.flexBetween} ${styles.gameLoadContainer}`}>
        <div className={`flex-1 ${styles.flexCenter} flex-col`}>
            <h1 className={`${styles.headText} text-center`}>
            It's not your turn to play
            </h1>
            <div className={styles.gameLoadPlayersBox}>
                <div className={`${styles.flexCenter} flex-col`}>
                    <img src={player01} className={styles.gameLoadPlayerImg} />
                    <p className={styles.gameLoadPlayerText}>
                        {walletAddress.slice(0, 30)}
                    </p>
                </div>
            </div>
        </div>
        <GameInfo />        
    </div>
  );
};

export default PendingPlayer;