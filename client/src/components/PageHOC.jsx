//HOC Higher Order Component

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from './Alert';
import { useGlobalContext } from '../context';
import {alyra} from '../assets';
import styles from '../styles';
import { SiEthereum } from "react-icons/si";
import Balance from './Balance';
import { GetParams } from '../utils/onboard.js';


const shortenAddress = (address) => `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;

const PageHOC = (Component, title, description) => () => {
  const { walletAddress, showAlert, battleGround } = useGlobalContext();
	//const [accountAddress, setAccountAddress] = useState('');
	const [balance, setBalance] = useState('');
	//const [addressTo, setAddressTo] = useState('');
  const [balanceContract, setContractBalance] = useState('');

  const navigate = useNavigate();

  // const handleSubmit = (e) => {
  //   const { addressTo, amount, keyword, message } = formData;
  //   e.preventDefault();
  //   if (!addressTo || !amount || !keyword || !message)
  //     return;
  //   if (isAddress(e.value))
  //     return;
  //   sendTransaction();
  // };

  const getParam = async () => {
    const param = await GetParams();
    //setAccountAddress(param.account);
    setBalance(param.balance);
  };

  useEffect(() => {
    getParam();
    //getContractBalance();
	}, [balance, balanceContract]);

  const getContractBalance = async () => {
    const balance_ = await contract?.getBalance();
    console.log('Ne marche pas, faire essai dans GetPram', balance_);
    setContractBalance(balance_);
    //console.log(ethers.utils.formatEther(balance_), "ETH");
    //console.log(web3.utils.fromWei(balance_, "ether"), "ETH");
  };

  return (
    <div className={styles.hocContainer}>
        {showAlert?.status && <Alert type={showAlert.type} message={showAlert.message}/>}

        <div className={styles.hocContentBox}>
          <div className="flex flex-1 items-center justify-start flex-col w-full mf:mt-0 mt-0">
            <div className="flex p-3 sm:w-66 justify-end flex-col rounded-xl w-full eth-card .white-glassmorphism ">
              <div className="flex flex-1 justify-between items-start flex-row mf:mr-10 font-bold">
                <img src={alyra} alt="alyra" className={styles.hocLogo} onClick={() => navigate('/')} />
                { balance?Math.round(balance * 100)/100 + ' AVAX':''}
              </div>
              <div className="flex p-1 justify-between flex-row w-full h-full">
                <div className="flex w-10 h-10 rounded-full justify-between flex-row border-2 border-white items-center">
                  <div className="flex p-2 font-bold text-xl">
                    <SiEthereum fontSize={21} color="#fff" />
                  </div>
                  <div className="flex p-2 font-bold text-xl">
                    {balanceContract?balanceContract:'...'}
                  </div>
                </div>
                <div className="flex p-2 font-bold text-xl items-center">
                  {shortenAddress(walletAddress)}
                </div>
              </div>
            </div>
            <div className="flex p-5 sm:w-66 flex-row w-full justify-start items-center blue-glassmorphism">
            </div>
          </div>
          <div className={styles.hocBodyWrapper}>
            <div className="flex flex-col w-full">
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

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
*/
var isAddress = function (address) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      // check if it has the basic requirements of an address
      return false;
  } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
      // If it's all small caps or all all caps, return true
      return true;
  } else {
      // Otherwise check each case
      return isChecksumAddress(address);
  }
};

/**
* Checks if the given string is a checksummed address
*
* @method isChecksumAddress
* @param {String} address the given HEX adress
* @return {Boolean}
*/
var isChecksumAddress = function (address) {
  // Check each case
  address = address.replace('0x','');
  var addressHash = sha3(address.toLowerCase());
  for (var i = 0; i < 40; i++ ) {
      // the nth letter should be uppercase if the nth digit of casemap is 1
      if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
          return false;
      }
  }
  return true;
};
