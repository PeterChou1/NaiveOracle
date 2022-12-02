require("dotenv").config();
import { ethers } from "ethers";
import abi from "./UserContract.json";
import abiSLA from "../abi/SLA.json";

const main = async () => {
    const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY);
    const wallet = new ethers.Wallet(process.env.SK as string, provider);
    var UserContract = new ethers.Contract(process.env.USER_CONTRACT as string, JSON.stringify(abi), provider);
    UserContract = await UserContract.connect(wallet);
    var SLA = new ethers.Contract(process.env.SLA as string, JSON.stringify(abiSLA), provider);
    SLA = await SLA.connect(wallet);

    console.log("connected to user contract on " + process.env.USER_CONTRACT);
    const balance = await wallet.getBalance();
    console.log("connect to wallet with balance " + balance);
    const reponseAmt = ethers.BigNumber.from(3);
    const paymentAmt = ethers.BigNumber.from(0);
    const res = await UserContract.callOracle(reponseAmt, paymentAmt, {gasLimit: 5000000});
    console.log(res);

    SLA.once(SLA.filters.Answered(), async () => {
        console.log("Answered");
        const response = await UserContract.getResponse();
        console.log("response is: " + response);
    })
}


main();