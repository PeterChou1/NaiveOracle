require("dotenv").config();

import { ethers } from "ethers";

let window: any;

const provider = new ethers.providers.Web3Provider(window.ethereum);
const abi = JSON.parse(process.env.ABI);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, abi, provider);

async function account() {
  const accounts = await provider.listAccounts();
  return new Promise((resolve, reject) => {
    if (accounts) resolve(accounts[0]);
    else reject("error");
  });
}

export const updateVolume = (volume: any) => {
  return new Promise((resolve, reject) => {
    account()
      .then((account) => {
        contract.updateVolume(volume, { from: account }, (err, res) => {
          if (err === null) {
            resolve(res);
          } else {
            reject(err);
          }
        });
      })
      .catch((error) => reject(error));
  });
};

export const volumeUpdate = (callback: any) => {
  contract((error: any, result: any) => callback(error, result));
};
