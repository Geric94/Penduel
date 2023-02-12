import React from 'react';
import Tilt from 'react-parallax-tilt';

import styles from '../styles';
import man from '../assets/man.png';

const manImg = man;

const Card = ({ card, title, restStyles, cardRef, playerTwo }) => (
  <Tilt>
      <div className={`${styles.cardMann_in}`}>
          <img src={manImg} alt="Man" left="-150px" className={`${styles.cardMann}`}/>
      </div>
  </Tilt>
);

export default Card;
