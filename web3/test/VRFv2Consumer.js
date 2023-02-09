import { expect } from 'chai';
import { ethers } from 'hardhat';
import config from '../scripts/config.json';

describe('Integration Test - Testnet', function () {
  let consumer;
  let owner;

  beforeEach(async function () {

    [owner] = await ethers.getSigners();
    const chainId = hre.network.config.chainId;
    const { VRFConsumerBaseV2 } = config.chainId[chainId.toString()];

    const VRFv2Consumer = await ethers.getContractFactory('VRFv2Consumer');
    consumer = VRFv2Consumer.attach(VRFConsumerBaseV2);
  });

  it('Mint by owner, assign to another user', async function () {
    expect(await consumer.s_owner()).to.equal(owner.address);

    // only owner can request
    // Takes a minute to fulfill
    const tx = await consumer.requestRandomWords();

    // See the random number (really no way to unit-test it)
    // Before they are set for the first time, 
    // read request would throw error: cannot estimate gas
    console.log(await consumer.s_randomWords(0, { gasLimit: 300000 }));
    console.log(await consumer.s_randomWords(1, { gasLimit: 300000 }));
  });
});