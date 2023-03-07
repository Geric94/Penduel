import { expect, assert } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Penduel } from "../typechain-types";
import { VRFv2Consumer } from "../typechain-types";
import { parseEther } from 'ethers/lib/utils';

const _metadataUri = 'https://gateway.pinata.cloud/ipfs/https://gateway.pinata.cloud/ipfs/QmX2ubhtBPtYw75Wrpv6HLb1fhbJqxrnbhDo1RViW3oVoi';

context("Penduel", () => {
    //doesn't work with typescrypt need analyse
    //const { expectEvent } = require(`@openzeppelin/test-helpers`);
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
        console.log('Contract Penduel address: ', contract.address);
        console.log('Contract Penduel balance: ', (await contract.getBalance()).toString());
        //console.log(penduel.functions);
        return { penduel, amount, owner, player1, player2 };
    };

    describe("Deployment", function () {
        // on vérifie toutes les variables/constantes de notre contrat
        it(`${counter++}: admin must be equal to owner`, async function () {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            console.log('cost create contract: ', (100000*1e18 - await owner.getBalance()), 'wei');
            const admin = await penduel.owner();
            expect(admin).to.be.equal(owner.address, `admin is not owner`);
        });
        
        it (`${counter++}: should get the balanceOf owner`, async function () {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            let balanceOfOwner = (await penduel.balanceOf(owner.address, 0)).toString();
            let awaitedBalanceOfOwner = ethers.BigNumber.from('0').toString();
            assert.equal(balanceOfOwner, awaitedBalanceOfOwner);
        })
        it(`${counter++}: Should receive and store the funds to penduel`, async function () {
            const { penduel } = await loadFixture( deployPenduelFixture );
            expect(await ethers.provider.getBalance(penduel.address)).to.equal( 0 );
        });
        it(`${counter++}: admin must be equal to owner`, async function () {
            const { vrf, owner } = await loadFixture(deployVRF);
            const admin = await vrf.owner();
            expect(admin).to.be.equal(owner.address, `admin is not owner`);
        });
        it(`${counter++}: The index must be less than 32`, async function () {
            const { vrf } = await loadFixture(deployVRF);
            await expect(vrf.getRandomValue(32)).to.be.revertedWith("The index must be less than 32");
        });     
    });

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
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await expect( penduel.registerPlayer( "OwnerPlayer", "OwnerToken", { gasLimit: 360000}))
                .to.emit(penduel, "NewPlayer")
                .withArgs( owner.address, "OwnerPlayer");
        });
  
        it(`${counter++}: should return a player struct for the owner player`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 360000});
            const player = await penduel.getPlayer(owner.address);
            expect(player.playerAddress).to.be.equal(owner.address);
        });
    
        it(`${counter++}: should return a list of all players`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 360000});
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
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 360000});
            const GameToken = await penduel.getPlayerToken(owner.address);
            expect(GameToken.name).to.be.equal('OwnerToken');
        });
    
        it(`${counter++}: should return a list of all tokens`, async () => {
            const { penduel } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 360000});
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
            await expect(penduel.createBattle("Battle1", {gasLimit: 220000})).to.be.revertedWith("Please Register Player First");
        });

        it(`${counter++}: getBattle without Battle`, async () => {
            const { penduel } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 360000});
            await expect(penduel.getBattle("Battle1")).to.be.revertedWith("(getBattle): Battle doesn't exist!");
        });

        it(`${counter++}: getBattle with Battle`, async () => {
            const { penduel } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 360000}); //);
            await penduel.createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 2200000 });
            const battleExists = await penduel.getBattle("Battle1");
            expect(battleExists.name).to.be.equal("Battle1");
        });

        it(`${counter++}: createBattle already exist`, async () => {
            const { penduel, player1 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 360000});
            // let penduelBalanceBefore: BigNumber = await penduel.getBalance();
            // let player1BalanceBefore: BigNumber = await player1.getBalance();
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005') , gasLimit: 220000});
            // console.log('Create Battle Cost :');
            // console.log('penduel: ', (await penduel.getBalance()).sub(penduelBalanceBefore));
            // console.log('player1: ', (await player1.getBalance()).sub(player1BalanceBefore));
            await expect(penduel.connect(player1).createBattle("Battle1", {gasLimit: 220000})).to.be.revertedWith("Battle already exists!");
        });

        it(`${counter++}: createBattle player1 with 'Error, insufficent vault balance'`, async () => {
            const { penduel, player1 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await expect(penduel.connect(player1).createBattle("Battle1", { value: parseEther('10001')})).to.be
                .revertedWith("createBattle: Error, insufficent vault balance");
        });

        it(`${counter++}: joinBattle only player2 can joint battle`, async () => {
            const { penduel, player1 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await expect(penduel.connect(player1).joinBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 2600000 })).to.be
                .revertedWith("Only player two can join a battle");
        });

        it(`${counter++}: joinBattle player2 doen't exist`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await expect(penduel.connect(player2).joinBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 2600000 })).to.be
                .revertedWith("Player doesn't exist!");
        });

        it(`${counter++}: joinBattle player2 with 'Error, insufficent vault balance'`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            await expect(penduel.connect(player2).joinBattle("Battle1", { value: parseEther('10001')})).to.be
                .revertedWith("joinBattle: Error, insufficent vault balance");
        });

        it(`${counter++}: joinBattle player2 with 'Amount must be equal at bet'`, async () => {
            // console.log('WEI:', ethers.BigNumber.from(1e12+1).toString());
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            await expect(penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.00051'), gasLimit: 260000})).to.be
                .revertedWith("Amount must be equal at bet");
        });

        it(`${counter++}: joinBattle player1 already in battle`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 260000}); 
            await expect(penduel.connect(player1).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 260000})).to.be
                .revertedWith("Only player two can join a battle"); 
        });

        it(`${counter++}: joinBattle player2 already in battle`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            // let penduelBalanceBefore: BigNumber = await penduel.getBalance();
            // let player2BalanceBefore: BigNumber = await player2.getBalance();
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 260000}); 
            // console.log('Join Battle Cost :');
            // console.log('penduel: ', (await penduel.getBalance()).sub(penduelBalanceBefore));
            // console.log('player2: ', (await player2.getBalance()).sub(player2BalanceBefore));
            await expect(penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 260000}))
                .to.be.revertedWith("Already in battle"); 
        });
    });

    beforeEach(async function () {
        const { penduel, owner } = await loadFixture(deployPenduelFixture);
        penduel.connect(owner).addWord('alyra');
    });

    describe("add Word", function () {
        it(`${counter++}: Error, word with lowercase letters only`, async () => {
            const { penduel, owner} = await loadFixture(deployPenduelFixture);
            await expect(penduel.connect(owner).addWord("alYra"))
                .to.be.revertedWith("Error, word with lowercase letters only"); 
        });
        it(`${counter++}: Error, word already in the list`, async () => {
            const { penduel, owner} = await loadFixture(deployPenduelFixture);
            await expect(penduel.connect(owner).addWord("alyra"))
                .to.be.revertedWith("Error, word already in the list"); 
        });
        it(`${counter++}: player1 addWord, Ownable: caller is not the owner`, async () => {
            const { penduel, player1} = await loadFixture(deployPenduelFixture);
            await expect(penduel.connect(player1).addWord("notowner"))
                .to.be.revertedWith("Ownable: caller is not the owner"); 
        });
        it(`${counter++}: player1 removeAll, Ownable: caller is not the owner`, async () => {
            const { penduel, player1} = await loadFixture(deployPenduelFixture);
            await expect(penduel.connect(player1).removeAll())
                .to.be.revertedWith("Ownable: caller is not the owner"); 
        });
        //Doesn't work even with timeout
        // it(`${counter++}: CreateBattle: numberOfWords = 0`, async () => {
        //     const { penduel, owner} = await loadFixture(deployPenduelFixture);
        //     await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 360000});
        //     console.log(await penduel.connect(owner).numberOfWords());
        //     await penduel.connect(owner).removeAll( { gasLimit: 1800000 });
            // setTimeout(() => {
            //     expect(penduel.connect(owner).numberOfWords()).equal(0);
            // }, 1500);
            // await new Promise((r) => setTimeout(r, 4000));
            // console.log(await penduel.connect(owner).numberOfWords());
        //     await expect(penduel.createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000}))
        //         .to.be.revertedWith("no words in the list, ask owner of contract"); 
        // });
    });

    beforeEach(async function () {
        const { penduel, owner } = await loadFixture(deployPenduelFixture);
        penduel.connect(owner).addWord('goodbye');
    });

    describe("Find Guess", function () {
        it(`${counter++}: chosenLetter: letter not in the guess`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 2600000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('a'), "Battle1", { gasLimit: 180000 });
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x675f5f5f5f5f5f'); //  'g______'
        });

        it(`${counter++}: chosenLetter: letter in the guess`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 2600000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('y'), "Battle1", { gasLimit: 180000 });
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x675f5f5f5f795f'); //  'g____y_'
        });

        it(`${counter++}: chosenLetter: It is not your turn`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 2600000 });
            await expect(penduel.connect(player2).chosenLetter(new TextEncoder().encode('o'), "Battle1", { gasLimit: 180000 })).to.be.revertedWith("It is not your turn");
        });

        it(`${counter++}: chosenLetter: bad letter and try an over`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 2600000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('a'), "Battle1");
            await expect(penduel.connect(player1).chosenLetter(new TextEncoder().encode('b'), "Battle1", { gasLimit: 180000 })).to.be.revertedWith("It is not your turn");
        });

        it(`${counter++}: chosenLetter: Play a letter already playing`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 2600000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('o'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('d'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('b'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('y'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('o'), "Battle1", { gasLimit: 180000 }); //WRONG so -> player2
            await penduel.connect(player2).chosenLetter(new TextEncoder().encode('e'), "Battle1", { gasLimit: 180000 }); //WIN
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x676f6f64627965'); //  'goodbye'
            expect((await penduel.getBattle("Battle1")).battleStatus).to.be.equal(2);
            expect((await penduel.getBattle("Battle1")).winner).to.be.equal(player2.address);
        });

        it(`${counter++}: chosenLetter: find the word`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 2600000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('o'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('d'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('b'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('y'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('e'), "Battle1", { gasLimit: 180000 });
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x676f6f64627965'); //  'goodbye'
            expect((await penduel.getBattle("Battle1")).battleStatus).to.be.equal(2);
            expect((await penduel.getBattle("Battle1")).winner).to.be.equal(player1.address);
        });
    });

    describe("Balances", function () {
        it(`${counter++}: createBattle getBalance`, async () => {
            const { penduel, player1 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            expect(await ethers.provider.getBalance(penduel.address)).to.equal( parseEther('0.0005') );
        });

        it(`${counter++}: joinBattle: getBalance`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 2600000 });
            expect(await ethers.provider.getBalance(penduel.address)).to.equal( parseEther('0.001') );
        });

        it(`${counter++}: chosenLetter: find the word`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.0005'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.0005'), gasLimit: 2600000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('o'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('d'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('b'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('y'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('e'), "Battle1", { gasLimit: 180000 });
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x676f6f64627965'); //  'goodbye'
            expect((await penduel.getBattle("Battle1")).battleStatus).to.be.equal(2);  //BattleStatus.ENDED
            expect((await penduel.getBattle("Battle1")).winner).to.be.equal(player1.address);
        });
        it(`${counter++}: two players don't find the word`, async () => {
            const { penduel, owner, player1, player2 } = await loadFixture(deployPenduelFixture);
            const eventNewPlayer = await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 360000});
            //console.log('eventNewPlayer', eventNewPlayer);
            //await expectEvent(eventNewPlayer, "NewPlayer", { owner: player1, playerName: 'Player1' });
            await penduel.connect(player1).createBattle("Battle1", {value: parseEther('0.1'), gasLimit: 220000});
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 360000});
            const BattleBegin = await penduel.connect(player2).joinBattle("Battle1", { value: parseEther('0.1'), gasLimit: 2600000 });
            //console.log('BattleBegin', BattleBegin);
            //await expectEvent(BattleBegin, "BattleBegin", { battleName: "Battle1", player1: player1, player2: player2, maskedWord: 'g______' });
              
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('c'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player2).chosenLetter(new TextEncoder().encode('f'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('g'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player2).chosenLetter(new TextEncoder().encode('h'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('i'), "Battle1", { gasLimit: 180000 });
            await penduel.connect(player2).chosenLetter(new TextEncoder().encode('j'), "Battle1", { gasLimit: 180000 });
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x675f5f5f5f5f5f'); //  'g______'
            expect((await penduel.getBattle("Battle1")).incorrectGuess).to.be.equal(6);            
            expect((await penduel.getBattle("Battle1")).battleStatus).to.be.equal(2);  //BattleStatus.ENDED
            //console.log((await penduel.getBattle("Battle1")));
            expect((await penduel.getBattle("Battle1")).winner).to.be.equal(owner.address);
        });
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
    