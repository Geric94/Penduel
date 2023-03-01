import { expect, assert } from "chai";
//import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { Penduel } from "../typechain-types";
import { VRFv2Consumer } from "../typechain-types";
//const { ethers } = require('hardhat');
//import hre from 'hardhat';
import { parseEther } from 'ethers/lib/utils';
//import { BigNumber } from "ethers";

const _metadataUri = 'https://gateway.pinata.cloud/ipfs/https://gateway.pinata.cloud/ipfs/QmX2ubhtBPtYw75Wrpv6HLb1fhbJqxrnbhDo1RViW3oVoi';

//EGA ajouter addword goobye -> alyra

context("Penduel", () => {
    let vrf: VRFv2Consumer;
    let penduel: Penduel;
    // variable qui permet de numéroter nos tests
    let counter = 1;
    const { ethers } = require('hardhat');
    const hre = require('hardhat');

    async function deployVRF() {
        await hre.run('compile');
        const chainId = hre.network.config.chainId;
      
        const config = require('../scripts/config.json').chainId[chainId.toString()];
        const { subscriptionId, vrfCoordinator, link, keyHash } = config;
        //Get accounts
        const [owner, ...addrs] = await ethers.getSigners();

        const VRF = await ethers.getContractFactory('VRFv2Consumer');
        vrf = await VRF.deploy( subscriptionId, vrfCoordinator, link, keyHash);
        const vrfContract = await vrf.deployed();
        //console.log('VRF deployed:', vrfContract.address);
        return { vrf, owner };
    };

    async function deployPenduelFixture() {
        const ONE_GWEI = 1_000_000_000;
        const amount = ONE_GWEI;        
        const [owner, player1, player2, ...addrs] = await ethers.getSigners(); //Get accounts

        const Penduel = await ethers.getContractFactory("Penduel");
        penduel = await Penduel.deploy(_metadataUri);

        const contract = await penduel.deployed();
        //console.log('Contract Penduel address: ', contract.address);
        //console.log(penduel.functions);
        return { penduel, amount, owner, player1, player2 };
    };

    describe("Deployment", function () {
        // on vérifie toutes les variables/constantes de notre contrat
        it(`${counter++}: admin must be equal to owner`, async function () {
            const { penduel, owner, player1, player2 } = await loadFixture(deployPenduelFixture);
            console.log('cost create contract: ', (10000*1e18 - await owner.getBalance()), 'wei');
            const admin = await penduel.owner(); // { gasLimit: 5200000 }
            expect(admin).to.be.equal(owner.address, `admin is not owner`);
        });
        
        it (`${counter++}: should get the balanceOf owner`, async function () {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            let balanceOfOwner = (await penduel.balanceOf(owner.address, 0)).toString();
            let awaitedBalanceOfOwner = ethers.BigNumber.from('0').toString();
            assert.equal(balanceOfOwner, awaitedBalanceOfOwner);
        })
        it("Should receive and store the funds to penduel", async function () {
            const { penduel, amount } = await loadFixture( deployPenduelFixture );
            expect(await ethers.provider.getBalance(penduel.address)).to.equal( 0 );
        });
        it(`${counter++}: admin must be equal to owner`, async function () {
            const { vrf, owner } = await loadFixture(deployVRF);
            const admin = await vrf.owner(); // { gasLimit: 5200000 }
            expect(admin).to.be.equal(owner.address, `admin is not owner`);
        });
        it(`${counter++}: The index must be less than 32`, async function () {
            const { vrf } = await loadFixture(deployVRF);
            await expect(vrf.getRandomValue(50)).to.be.revertedWith("The index must be less than 32");
        });     
    });

    // describe("Withdrawals", function () {
    //     describe("Validations", function () {
    //         it("Should revert with the right error if called too soon", async function () {
    //             const { penduel } = await loadFixture(deployPenduelFixture);
    //             await expect(penduel.withdraw(1)).to.be.revertedWith( "You can't withdraw yet" );
    //         });

    //         it("Should revert with the right error if called from another account", async function () {
    //             const { penduel, owner } = await loadFixture( deployPenduelFixture );
    //             // We use penduel.connect() to send a transaction from another account
    //             await expect(penduel.connect(owner).withdraw(1)).to.be.revertedWith( "You aren't the owner" );
    //         });

    //         it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
    //             const { penduel } = await loadFixture( deployPenduelFixture );
    //             await expect(penduel.withdraw(1)).not.to.be.reverted;
    //         });
    //     });

    //     describe("Events", function () {
    //             it("Should emit an event on withdrawals", async function () {
    //             const { penduel, amount } = await loadFixture( deployPenduelFixture );
    //             await expect(penduel.withdraw(1)).to.emit(penduel, "Withdrawal").withArgs(amount, anyValue); // We accept any value as `when` arg
    //         });
    //     });

    //     describe("Transfers", function () {
    //         it("Should transfer the funds to the owner", async function () {
    //             const { penduel, amount, owner } = await loadFixture( deployPenduelFixture );
    //             await expect(penduel.withdraw(1)).to.changeEtherBalances( [owner, penduel], [amount, -amount] );
    //         });
    //     });
    // });
    

    describe("Players", function () {
        it(`${counter++}: owner isPlayer must be false`, async function () {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            const isPlayer = await penduel.isPlayer(owner.address);
            expect(isPlayer).to.be.equal( false, `isPlayer is not false` );
        });

        it(`${counter++}: getPlayer should revert with the right error if called too soon`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await expect(penduel.getPlayer(owner.address)).to.be.revertedWith("Player doesn't exist!");
        });

        it(`${counter++}: registerPlayer should return a event NewPlayer`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture); //, { gasLimit: 500000 }
            await expect( penduel.registerPlayer( "OwnerPlayer", "OwnerToken"))
                .to.emit(penduel, "NewPlayer")
                .withArgs( owner.address, "OwnerPlayer");
        });
  
        it(`${counter++}: should return a player struct for the owner player`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken"); //, { gasLimit: 500000 });
            const player = await penduel.getPlayer(owner.address);
            expect(player.playerAddress).to.be.equal(owner.address);
        });
    
        it(`${counter++}: should return a list of all players`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken"); //, { gasLimit: 500000 });
            const players = await penduel.getAllPlayers();
            //two because they have a first in the initalize function
            expect(players.length).to.be.equal(2);
        });
    });

    describe("Tokens", function () {
        it(`${counter++}: owner isPlayerToken must be false`, async function () {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            const playerTokenExists = await penduel.isPlayerToken(owner.address);
            expect(playerTokenExists).to.be.equal( false, `isPlayerToken is not false` );
        });

        it(`${counter++}: should return a player struct for the owner player`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken"); //, { gasLimit: 500000 });
            const GameToken = await penduel.getPlayerToken(owner.address);
            expect(GameToken.name).to.be.equal('OwnerToken');
        });
    
        it(`${counter++}: should return a list of all tokens`, async () => {
            const { penduel } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken"); //, { gasLimit: 500000 });
            const tokens = await penduel.getAllPlayerTokens();
            //two because they have a first in the initalize function
            //console.log(tokens);
            expect(tokens.length).to.be.equal(2);
        });
    });

    describe("Battles", function () {
        it(`${counter++}: getBattle Battle doesn't exist!`, async () => {
            const { penduel } = await loadFixture(deployPenduelFixture);
            await expect(penduel.getBattle("Battle1")).to.be.revertedWith("(getBattle): Battle doesn't exist!");
        });
            
        it(`${counter++}: createBattle without player register`, async () => {
            const { penduel } = await loadFixture(deployPenduelFixture);
            await expect(penduel.createBattle("Battle1")).to.be.revertedWith("Please Register Player First");
        });

        it(`${counter++}: getBattle without Battle`, async () => {
            const { penduel } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken"); //, { gasLimit: 500000 });
            await expect(penduel.getBattle("Battle1")).to.be.revertedWith("(getBattle): Battle doesn't exist!");
        });

        it(`${counter++}: getBattle with Battle`, async () => {
            const { penduel } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken"); //); //, { gasLimit: 500000 });
            await penduel.createBattle("Battle1", {value: parseEther('0.0005') });
            const battleExists = await penduel.getBattle("Battle1");
            expect(battleExists.name).to.be.equal("Battle1");
        });
        //Error, minimum 1 WEI   const betSize = ether("0.00005");

        it(`${counter++}: createBattle already exist`, async () => {
            const { penduel, player1 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("OwnerPlayer", "OwnerToken"); //, { gasLimit: 500000 });
            // let penduelBalanceBefore: BigNumber = await penduel.getBalance();
            // let player1BalanceBefore: BigNumber = await player1.getBalance();
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            // console.log('Create Battle Cost :');
            // console.log('penduel: ', (await penduel.getBalance()).sub(penduelBalanceBefore));
            // console.log('player1: ', (await player1.getBalance()).sub(player1BalanceBefore));
            await expect(penduel.connect(player1).createBattle("Battle1")).to.be.revertedWith("Battle already exists!");
        });

        it(`${counter++}: createBattle player1 with 'Error, insufficent amount sent'`, async () => {
            const { penduel, player1 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await expect(penduel.connect(player1).createBattle("Battle1", { value: parseEther('10001')})).to.be
                .revertedWith("createBattle: Error, insufficent vault balance"); //, gasLimit: 500000 });
        });

        it(`${counter++}: joinBattle only player2 can joint battle`, async () => {
            const { penduel, player1 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("OwnerPlayer", "OwnerToken"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await expect(penduel.connect(player1).joinBattle("Battle1", {value: parseEther('0.0005') })).to.be
                .revertedWith("Only player two can join a battle");
        });

        it(`${counter++}: joinBattle player2 doen't exist`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await expect(penduel.connect(player2).joinBattle("Battle1", {value: parseEther('0.0005') })).to.be
                .revertedWith("Player doesn't exist!");
        });

        it(`${counter++}: joinBattle player2 with 'Error, insufficent vault balance'`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token"); //, { gasLimit: 500000 });
            await expect(penduel.connect(player2).joinBattle("Battle1", { value: parseEther('10001')})).to.be
                .revertedWith("joinBattle: Error, insufficent vault balance"); //, gasLimit: 500000 });
        });

        it(`${counter++}: joinBattle player2 with 'Amount must be equal at bet'`, async () => {
            // console.log('WEI:', ethers.BigNumber.from(1e12+1).toString());
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token"); //, { gasLimit: 500000 });
            await expect(penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.00051')})).to.be
                .revertedWith("Amount must be equal at bet"); //, gasLimit: 500000 });
        });

        it(`${counter++}: joinBattle player1 already in battle`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token"); //, { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005')}); //, gasLimit: 5000000 
            await expect(penduel.connect(player1).joinBattle("Battle1", { value: parseEther('0.0005')})).to.be
                .revertedWith("Only player two can join a battle"); //, gasLimit: 5000000 
        });

        it(`${counter++}: joinBattle player2 already in battle`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 }
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token"); //, { gasLimit: 5800000 }
            // let penduelBalanceBefore: BigNumber = await penduel.getBalance();
            // let player2BalanceBefore: BigNumber = await player2.getBalance();
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005')}); //, gasLimit: 5800000 
            // console.log('Join Battle Cost :');
            // console.log('penduel: ', (await penduel.getBalance()).sub(penduelBalanceBefore));
            // console.log('player2: ', (await player2.getBalance()).sub(player2BalanceBefore));
            await expect(penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005')}))
                .to.be.revertedWith("Already in battle"); //, gasLimit: 5800000 
        });

        it(`${counter++}: chosenLetter: letter not in the guess`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token"); //, { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005') });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('a'), "Battle1"); //, { gasLimit: 200000 }
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x675f5f5f5f5f5f'); //  'g______'
        });

        it(`${counter++}: chosenLetter: letter in the guess`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token"); //, { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005') });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('y'), "Battle1"); //, { gasLimit: 200000 }
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x675f5f5f5f795f'); //  'g____y_'
        });

        it(`${counter++}: chosenLetter: It is not your turn`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token"); //, { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005') });
            await expect(penduel.connect(player2).chosenLetter(new TextEncoder().encode('o'), "Battle1")).to.be.revertedWith("It is not your turn");
        });

        it(`${counter++}: chosenLetter: bad letter and try an over`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token"); //, { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005') });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('a'), "Battle1"); //, { gasLimit: 200000 }
            await expect(penduel.connect(player1).chosenLetter(new TextEncoder().encode('b'), "Battle1")).to.be.revertedWith("It is not your turn");
        });

        it(`${counter++}: chosenLetter: Play a letter already playing`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token"); //, { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005') });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('o'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('d'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('b'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('y'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('o'), "Battle1"); //WRONG so -> player2
            await penduel.connect(player2).chosenLetter(new TextEncoder().encode('e'), "Battle1"); //WIN
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x676f6f64627965'); //  'goodbye'
            expect((await penduel.getBattle("Battle1")).battleStatus).to.be.equal(2);
            expect((await penduel.getBattle("Battle1")).winner).to.be.equal(player2.address);
        });

        it(`${counter++}: chosenLetter: find the word`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token"); //, { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005') });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('o'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('d'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('b'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('y'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('e'), "Battle1");
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x676f6f64627965'); //  'goodbye'
            expect((await penduel.getBattle("Battle1")).battleStatus).to.be.equal(2);
            expect((await penduel.getBattle("Battle1")).winner).to.be.equal(player1.address);
        });
    });

    describe("Balances", function () {
        it(`${counter++}: createBattle getBalance`, async () => {
            const { penduel, player1 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            expect(await ethers.provider.getBalance(penduel.address)).to.equal( parseEther('0.0005') );
        });

        it(`${counter++}: chosenLetter: find the word`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token"); //, { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') });
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token"); //, { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005') });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('o'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('d'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('b'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('y'), "Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('e'), "Battle1");
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x676f6f64627965'); //  'goodbye'
            expect((await penduel.getBattle("Battle1")).battleStatus).to.be.equal(2);  //BattleStatus.ENDED
            expect((await penduel.getBattle("Battle1")).winner).to.be.equal(player1.address);
        });
    });
});