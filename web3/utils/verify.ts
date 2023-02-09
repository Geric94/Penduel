import { run } from "hardhat";
//import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";

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