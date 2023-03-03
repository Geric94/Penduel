import { run } from "hardhat";
//import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";
//npx hardhat verify --network fuji --constructor-args ./scripts/args/avaxFuji.js 0xbF3CD274374eAbd57262e10eC36D7451B4F7E307
const verify = async(contractAddress: string, args: any[]) => {
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args
        })
        
        console.log("Contract verified", { address: contractAddress });
    } catch (e: any) {
        // if (e.message.toLowerCase().includes("Already verified")) {
        //     console.log("Already verified")
        // }
        // else {
            console.log(e);
        // }
    }
}

export { verify };