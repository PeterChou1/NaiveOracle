require("dotenv").config();

import { ethers } from "ethers";
import HDWalletProvider from "@truffle/hdwallet-provider";

const provider = new ethers.providers.Web3Provider(
  new HDWalletProvider(process.env.MNEMONIC, process.env.WEB3_PROVIDER_ADDRESS)
);

const abi = JSON.parse(process.env.ABI);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, abi, provider);

const account = () => {
  return new Promise((resolve, reject) => {
    ethers.listAccounts((err, accounts) => {
      if (err === null) {
        resolve(accounts[0]);
      } else {
        reject(err);
      }
    });
  });
};

export const updateVolume = ({ volume }) => {
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

export const volumeUpdate = (callback) => {
  contract.VolumeUpdate((error, result) => callback(error, result));
};
