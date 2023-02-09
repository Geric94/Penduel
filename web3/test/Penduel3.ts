import { ethers } from 'hardhat';
//import { deployContract } from 'ethereum-waffle';
import { expect, assert } from 'chai';
import { Penduel } from '../typechain-types';

describe('Penduel contract', () => {
  let penduel: any;
  let accounts: string[];

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    penduel = await deployContract(accounts[0], Penduel);
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
