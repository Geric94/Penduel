import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGlobalContext } from '../context';
import { CustomButton, PageHOC, AmountOut } from '../components';
import styles from '../styles';
import { parseUnits } from "ethers/lib/utils";

const JoinBattle = () => {
	const navigate = useNavigate();
	const { contract, gameData, setShowAlert, setBattleName, bet, setBet, setErrorMessage, walletAddress } = useGlobalContext();

	useEffect(() => {
		if (gameData?.activeBattle?.battleStatus === 1) 
			navigate(`/battle/${gameData.activeBattle.name}`);
	}, [gameData]);

	const handleClick = async (battleName_, bet_) => {
		try {
			await contract.joinBattle(battleName_, {value: bet_, gasLimit: 260000 });

			setShowAlert({ status: true, type: 'success', message: `Joining ${battleName_}` });
		} catch (error) {
			console.log('battleName: ',battleName_, ', bet: ', bet_, 'error: ', error);
			setErrorMessage(error?error:'Error: handleClick');
		}
	};
	//const fromValueBigNumber = parseUnits(bet); // converse the string to bigNumber

	return (
		<>
			<h2 className={styles.joinHeadText}>Available Battles:</h2>

			<div className={styles.joinContainer}>
				{gameData?.pendingBattles.length
					? gameData?.pendingBattles
						.filter((battle) => !battle.players.includes(walletAddress) && battle.battleStatus !== 1)
						.map((battle, index) => (
							<div key={battle.name + index} className={`flex flex-row w-80 min-w-80 items-center mb-5`}>
								<p className={styles.joinBattleTitle}> {index + 1}.{battle.name}</p>
								<AmountOut amountOut={battle.bet/1e18}/>  {/*convert en avax soit ETH /100 */}
								<CustomButton title="Join" handleClick={() => handleClick(battle.name, battle.bet)}/>								
							</div>
						))
					: (<p className={styles.joinLoading}>Reload the page to see new battles</p>)
				}
			</div>

			<p className={styles.infoText} onClick={() => navigate('/create-battle')}>
				Or create a new battle
			</p>
		</>
	);
};

export default PageHOC(
	JoinBattle,
	<>Join a Battle</>,
	<>Join already existing battles</>,
);