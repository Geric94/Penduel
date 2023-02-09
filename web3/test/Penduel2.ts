import { Contract, utils } from 'ethers';
import { Penduel } from '../typechain-types';

const provider = new ethers.providers.JsonRpcProvider();
const signer = provider.getSigner();
const contractAddress = '0x3b922f11313678F2f4878e4576a41Cc3fffdFa07'; // replace with actual address of contract 
const penduelContract = new Contract(contractAddress, Penduel.abi, signer);

describe('Penduel', () => {
  it('should be able to create a new penduel game', async () => {
    const result = await penduelContract.createGod('Zeus');

    expect(result).toBeTruthy();
  });

});