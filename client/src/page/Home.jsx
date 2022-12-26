import React, { useState } from 'react';

import { PageHOC, NameInput, RegisterButton } from '../components';
import { useGlobalContext } from '../context';

const Home = () => {
  const { contract, walletAddress } = useGlobalContext();
  const [playerName, setPlayerName] = useState('');
  const handleClick = async () => {
    try {
      await contract.isPlayer(walletAddress);
    } catch (error) {
      alert(error);
    }
  }

  return (
    <div className='flex flex-col'>
      <NameInput
        Label="Name"
        placeholder="Enter your player name"
        value={playerName}
        handleValueChange={setPlayerName}
      />

      <RegisterButton 
        title="Register"
        handleClick={handleClick}
        restStyles="mt-6"
      />
    </div>
  )
};

export default PageHOC(
  Home,
  <>Welcome to Avax Gods <br /> a Web3 NFT Card</>,
  <>Connect your wallet to start playing <br /> the ultimate Web3 Battle Card Game</>
);