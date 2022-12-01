require("dotenv").config();
import { ethers } from "ethers";
import abi from "./UserContract.json";
import abiOracle from "../abi/Oracle.json";

const main = async () => {
    const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY);
    const wallet = new ethers.Wallet(process.env.SK as string, provider);
    var UserContract = new ethers.Contract(process.env.USER_CONTRACT as string, JSON.stringify(abi), provider);
    UserContract = await UserContract.connect(wallet);
    const response = await UserContract.getResponse();
    console.log("response is: " + response);
    var Oracle = new ethers.Contract(process.env.ORACLE as string, JSON.stringify(abiOracle), provider);
    Oracle = await Oracle.connect(wallet);
    const requestId = "0x73a3163c61b79acbdf0e8658d9de262999f9872f95e05ea5bd2882f7e21c8f0a";
    const callbackAddress = "0x1FC0cf65F4E437a0e8fa9Ff597f9Fc3CB1EC9c41";
    const callbackfunc = "0x67b06b05";
    const ethUSD = 0;
    const salt = ethers.utils.randomBytes(32); // generate random salt
    await Oracle.revealOracleRequest(requestId, callbackAddress, callbackfunc, ethUSD, salt, {gasLimit: 8000000});
}


main();