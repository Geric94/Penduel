import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('Penduel contract', () => {
    let penduel: any;
    let accounts: ethers.SignerWithAddress[];
    let contractAddress: string = 'CONTRACT_ADDRESS'

    beforeEach(async () => {
        accounts = await ethers.getSigners();
        penduel = new ethers.Contract(contractAddress, Penduel.abi, accounts[0])
    });

    it('should return true if the passed address is a registered player', async () => {
        const isPlayer = await penduel.isPlayer(accounts[0].address);
        expect(isPlayer).to.be.equal(true);
    });

    it('should return a player struct for the passed address', async () => {
        const player = await penduel.getPlayer(accounts[0].address);
        expect(player.playerAddress).to.be.equal(accounts[0].address);
    });

    it('should return a list of all players', async () => {
        const players = await penduel.getAllPlayers();
        expect(players.length).to.be.equal(1);
    });
});
