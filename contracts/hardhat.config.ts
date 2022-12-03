require("dotenv").config();
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config : HardhatUserConfig =  {
    solidity: "0.8.17",
    networks : {
      goerli: {
        url: process.env.RPC_URL,
        accounts: [process.env.SK as string]
      }
    },
    etherscan: {
      apiKey: "MU7H8RY9ID9ZK9SHDZNCUTN2JNNE8N4KN9"
    }
};
  
export default config;
