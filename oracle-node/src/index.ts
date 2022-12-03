require('dotenv').config();
const fetch = require("node-fetch");
import { ethers } from "ethers";
import abiSLA from "../abi/SLA.json";
import abiOracle from "../abi/Oracle.json";

//popular api to retrieve eth usd price
const ethusdURL = "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD";

console.log("Oracle-node listening to " + process.env.SLA);

const main = async () => {
    const provider = new ethers.providers.AlchemyProvider("goerli", process.env.ALCHEMY);
    const wallet = new ethers.Wallet(process.env.SK as string, provider);
    var SLA = new ethers.Contract(process.env.SLA as string, JSON.stringify(abiSLA), provider);
    SLA = await SLA.connect(wallet);
    const oracleAdr = process.env.ORACLE_X;
    var Oracle = new ethers.Contract(oracleAdr as string, JSON.stringify(abiOracle), provider);
    console.log("listening for oracle address: " + oracleAdr);
    Oracle = await Oracle.connect(wallet);


    SLA.on(SLA.filters.OrderBroadcasted(), async (requestId, sender, paymentAmt, reponseAmt, address, funcCallback) => {
        console.log("Order broadcasted");
        console.log("Request id: " + requestId);
        console.log("Sender: " + sender);
        console.log("Payment amount: " + paymentAmt);
        console.log("Response amount: " + reponseAmt);
        console.log("Address: " + address);
        console.log("Function callback: " + funcCallback);
        const res = await fetch(ethusdURL, {
            "method": "GET",
        });
        const resjson = await res.json();
        const ethUSD = Math.floor(resjson["USD"]);
        const salt = ethers.utils.randomBytes(32); // generate random salt
        const hash = ethers.utils.solidityKeccak256(["uint256", "bytes32"], [ethUSD, salt]); 
        // accept the order from the oracle
        await Oracle.acceptOrder(requestId, address, funcCallback, {gasLimit: 10000000});
        console.log("Order accepted");
        SLA.once(SLA.filters.OrderMatched(), () => {
            console.log("Order matched");
        });
        // wait for the oracle to send a request recieved event
        Oracle.once(Oracle.filters.RequestRecieved(), async (requester, payment, requestId, callbackAddress, callbackfunc) => {
            console.log("Request recieved");
            console.log("Requester: " + requester);
            console.log("Payment: " + payment);
            console.log("Request id: " + requestId);
            console.log("Callback address: " + callbackAddress);
            console.log("Callback function: " + callbackfunc);
            // send the commit to the oracle
            await Oracle.commitOracleRequest(requestId, callbackAddress, callbackfunc, hash, {gasLimit: 10000000});
            console.log("Commit sent hash is: " + hash);
        })
        Oracle.once(Oracle.filters.RequestReveal(), async (requester, payment, requestId, callbackAddress, callbackfunc) => {
            console.log("Request recieved");
            console.log("Requester: " + requester);
            console.log("Payment: " + payment);
            console.log("Request id: " + requestId);
            console.log("Callback address: " + callbackAddress);
            console.log("Callback function: " + callbackfunc);
            console.log("data is: " + ethUSD);
            console.log("salt is: " + salt);
            const res = await Oracle.revealOracleRequest(requestId, callbackAddress, callbackfunc, ethUSD, salt, {gasLimit: 10000000});
            console.log(res);
        });

        SLA.once(SLA.filters.ResponseReceived(), () => {
            console.log("Response recieved");
        });
        SLA.once(SLA.filters.Answered(), () => {
            console.log("Answered");
        });
    });
}


main();