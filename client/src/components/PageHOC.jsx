//HOC Higher Order Component

import React from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from './Alert';
import { useGlobalContext } from '../context';
import {alyra, penduel } from '../assets';
import styles from '../styles';

const PageHOC = (Component, title, description) => () => {
  const { showAlert, battleGround } = useGlobalContext();
  const navigate = useNavigate();

  return (
    <div className={styles.hocContainer}>
        {showAlert?.status && <Alert type={showAlert.type} message={showAlert.message}/>}

        <div className={styles.hocContentBox}>
          <img src={alyra} alt="alyra" className={styles.hocLogo} onClick={() => navigate('/')} />

          <div className={styles.hocBodyWrapper}>
            <div className="flex flex-row w-full">
              <h1 className={`flex ${styles.headText} head_text`}>{title}</h1>
            </div>
            <p className={`${styles.normalText} my-1`}>{description}</p>
            <Component/>
          </div>
        </div>
        <div className={`${styles.flexBetween} ${styles.gameContainer} ${battleGround}`}>
        </div>
        {/* <div className="flex flex-1">
          <img src={penduel} alt="Penduel" className="w-full xl:h-full object-cover"/>
        </div> */}
    </div>
  );
};

export default PageHOC;