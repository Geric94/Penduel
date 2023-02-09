import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { Penduel } from "../typechain-types";

const _metadataUri = 'https://gateway.pinata.cloud/ipfs/https://gateway.pinata.cloud/ipfs/QmX2ubhtBPtYw75Wrpv6HLb1fhbJqxrnbhDo1RViW3oVoi';

context("Penduel", () => {
    let penduel: Penduel;
    // variable qui permet de numéroter nos tests
    let counter = 1;

    async function deployPenduelFixture() {
        //Get accounts
        const [owner, player1, player2, ...addrs] = await ethers.getSigners();

        const Penduel = await ethers.getContractFactory("Penduel");
        const penduel = await Penduel.deploy(_metadataUri);

        const contract = await penduel.deployed();
        //console.log(contract);
        //console.log(penduel.functions);
        return { penduel, owner, player1, player2 };         
    };

    describe("Deployment", function () {
        // on vérifie toutes les variables/constantes de notre contrat
        it(`${counter++}: admin must be equal to owner`, async function () {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            const admin = await penduel.owner();
            expect(admin).to.be.equal(owner.address, `admin is not owner`);
        });
        
        it (`${counter++}: should get the balanceOf owner`, async function () {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            let balanceOfOwner = await (await penduel.balanceOf(owner.address, 0)).toString();
            let awaitedBalanceOfOwner = ethers.BigNumber.from('0').toString();
            assert.equal(balanceOfOwner, awaitedBalanceOfOwner);
        })
    });

    describe("Players", function () {
        it(`${counter++}: owner isPlayer must be false`, async function () {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            const isPlayer = await penduel.isPlayer(owner.address);
            expect(isPlayer).to.be.equal( false, `isPlayer is not false` );
        });

        it(`${counter++}:  getPlayer should revert with the right error if called too soon`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await expect(penduel.getPlayer(owner.address)).to.be.revertedWith("Player doesn't exist!");
        });

        it(`${counter++}: registerPlayer should return a event NewPlayer`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await expect( penduel.registerPlayer( "OwnerPlayer", "OwnerToken", { gasLimit: 500000 }))
                .to.emit(penduel, "NewPlayer")
                .withArgs( owner.address, "OwnerPlayer");
        });
  
        it(`${counter++}: should return a player struct for the owner player`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 500000 });
            const player = await penduel.getPlayer(owner.address);
            expect(player.playerAddress).to.be.equal(owner.address);
        });
    
        it(`${counter++}: should return a list of all players`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 500000 });
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
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 500000 });
            const GameToken = await penduel.getPlayerToken(owner.address);
            expect(GameToken.name).to.be.equal('OwnerToken');
        });
    
        it(`${counter++}: should return a list of all tokens`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 500000 });
            const tokens = await penduel.getAllPlayerTokens();
            //two because they have a first in the initalize function
            //console.log(tokens);
            expect(tokens.length).to.be.equal(2);
        });
    });

    describe("Battles", function () {
        it(`${counter++}: getBattle Battle doesn't exist!`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await expect(penduel.getBattle("Battle1")).to.be.revertedWith("Battle doesn't exist!");
        });
            
        it(`${counter++}: createBattle without player register`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await expect(penduel.createBattle("Battle1")).to.be.revertedWith("Please Register Player First");
        });

        it(`${counter++}: getBattle without Battle`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 500000 });
            await expect(penduel.getBattle("Battle1")).to.be.revertedWith("Battle doesn't exist!");
        });

        it(`${counter++}: getBattle with Battle`, async () => {
            const { penduel, owner } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 500000 });
            const battle = await penduel.createBattle("Battle1");
            const battleExists = await penduel.getBattle("Battle1");
            expect(battleExists.name).to.be.equal("Battle1");
        });

        it(`${counter++}: createBattle already exist`, async () => {
            const { penduel } = await loadFixture(deployPenduelFixture);
            await penduel.registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 500000 });
            await penduel.createBattle("Battle1");
            await expect(penduel.createBattle("Battle1")).to.be.revertedWith("Battle already exists!");
        });

        it(`${counter++}: joinBattle only player2 can joint battle`, async () => {
            const { penduel, player1 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("OwnerPlayer", "OwnerToken", { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1");
            await expect(penduel.connect(player1).joinBattle("Battle1")).to.be.revertedWith("Only player two can join a battle");
        });

        it(`${counter++}: joinBattle player2 doen't exist`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1");
            await expect(penduel.connect(player2).joinBattle("Battle1")).to.be.revertedWith("Player doesn't exist!");
        });

        it(`${counter++}: joinBattle player2 exist`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1");
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1");
        });

        it(`${counter++}: joinBattle player1 already in battle`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1");
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1");
            await expect(penduel.connect(player1).joinBattle("Battle1")).to.be.revertedWith("Battle already started!");
        });

        it(`${counter++}: joinBattle player2 already in battle`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1");
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1");
            await expect(penduel.connect(player2).joinBattle("Battle1")).to.be.revertedWith("Battle already started!");
        });

        it(`${counter++}: chosenLetter: letter not in the guess`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1");
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('a'), "Battle1", { gasLimit: 200000 });
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x675f5f5f5f5f5f'); //  'g______'
        });

        it(`${counter++}: chosenLetter: letter in the guess`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1");
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('y'), "Battle1", { gasLimit: 200000 });
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x675f5f5f5f795f'); //  'g____y_'
        });

        it(`${counter++}: chosenLetter: It is not your turn`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1");
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1");
            await expect(penduel.connect(player2).chosenLetter(new TextEncoder().encode('o'), "Battle1")).to.be.revertedWith("It is not your turn");
        });

        it(`${counter++}: chosenLetter: bad letter and try an over`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1");
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('a'), "Battle1", { gasLimit: 200000 });
            await expect(penduel.connect(player1).chosenLetter(new TextEncoder().encode('b'), "Battle1")).to.be.revertedWith("It is not your turn");
        });

        it(`${counter++}: chosenLetter: Play a letter already playing`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1");
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('o'), "Battle1", { gasLimit: 200000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('d'), "Battle1", { gasLimit: 200000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('b'), "Battle1", { gasLimit: 200000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('y'), "Battle1", { gasLimit: 200000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('o'), "Battle1", { gasLimit: 200000 }); //WRONG so -> player2
            await penduel.connect(player2).chosenLetter(new TextEncoder().encode('e'), "Battle1", { gasLimit: 200000 }); //WIN
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x676f6f64627965'); //  'goodbye'
            expect((await penduel.getBattle("Battle1")).battleStatus).to.be.equal(2);
            expect((await penduel.getBattle("Battle1")).winner).to.be.equal(player2.address);
        });

        it(`${counter++}: chosenLetter: find the word`, async () => {
            const { penduel, player1, player2 } = await loadFixture(deployPenduelFixture);
            await penduel.connect(player1).registerPlayer("Player1", "Player1Token", { gasLimit: 500000 });
            await penduel.connect(player1).createBattle("Battle1");
            await penduel.connect(player2).registerPlayer("Player2", "Player2Token", { gasLimit: 500000 });
            await penduel.connect(player2).joinBattle("Battle1");
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('o'), "Battle1", { gasLimit: 200000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('d'), "Battle1", { gasLimit: 200000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('b'), "Battle1", { gasLimit: 200000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('y'), "Battle1", { gasLimit: 200000 });
            await penduel.connect(player1).chosenLetter(new TextEncoder().encode('e'), "Battle1", { gasLimit: 200000 });
            expect((await penduel.getBattle("Battle1")).maskedWord).to.be.equal('0x676f6f64627965'); //  'goodbye'
            expect((await penduel.getBattle("Battle1")).battleStatus).to.be.equal(2);
            expect((await penduel.getBattle("Battle1")).winner).to.be.equal(player1.address);
        });

        //'getBattle(string)': [Function (anonymous)],
        //'getAllBattles()': [Function (anonymous)],
        //'getBattleMoves(string)': [Function (anonymous)],
        //'quitBattle(string)': [Function (anonymous)],
      
    });
});