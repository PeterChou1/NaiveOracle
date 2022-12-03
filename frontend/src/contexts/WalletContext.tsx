import { ethers } from "ethers";
import React, { Provider, useState } from "react";
import NaiveABI from "../abi/NaiveToken.json";
import Oracle from "../abi/Oracle.json";
import UserContract from "../abi/UserContract.json";

interface WalletType {
  balance: string;
  currentAccount: any;
  chainId: number;
  chainName: string;
  naiveTokens: string;
  rewardTokens: number;
  naiveTokenContract: ethers.Contract;
  oracleContract_X: ethers.Contract;
  oracleContract_X_tokens: string;
  oracleContract_Y: ethers.Contract;
  oracleContract_Y_tokens: string;
  oracleContract_Z: ethers.Contract;
  oracleContract_Z_tokens: string;
  userContract: ethers.Contract;
  userContract_token: string;
}

const TOKEN_ADDRESS = "0xf3c74DcB05972538cB6b5Bac3ef0062dde3e0F92";
const USER_CONTRACT_ADDRESS = "0x3da94645E2EacB0005F21b60eBbC19b5B9E0b2E8";
const ORACLE_X_ADDRESS = "0x7bf7A9A2dc71DAe8a586643cdB2B750D3913e491";
const ORACLE_Y_ADDRESS = "0xECbFa607B126A54bd6eE77404B5A7a6547Af22A9";
const ORACLE_Z_ADDRESS = "0xC42602719EC1b254C839281B8a140002853c167d";

const walletInitialState = {
  balance: "",
  currentAccount: null,
  chainId: 0,
  chainName: "",
  naiveTokens: "",
  rewardTokens: 0,
  naiveTokenContract: new ethers.Contract(TOKEN_ADDRESS, NaiveABI),
  oracleContract_X: new ethers.Contract(ORACLE_X_ADDRESS, Oracle),
  oracleContract_X_tokens: "",
  oracleContract_Y: new ethers.Contract(ORACLE_Y_ADDRESS, Oracle),
  oracleContract_Y_tokens: "",
  oracleContract_Z: new ethers.Contract(ORACLE_Z_ADDRESS, Oracle),
  oracleContract_Z_tokens: "",
  userContract: new ethers.Contract(USER_CONTRACT_ADDRESS, UserContract),
  userContract_token: ""
};

interface WalletContextType {
  wallet: WalletType;
  walletInitialState: WalletType;
  setWallet: React.Dispatch<React.SetStateAction<WalletType>>;
}

const Context = React.createContext<WalletContextType>({} as WalletContextType);

type ProviderProps = {
  children?: React.ReactNode;
};

const WalletProvider = (props: ProviderProps) => {
  const [wallet, setWallet] = useState({ ...walletInitialState });

  return (
    <Context.Provider value={{ wallet, setWallet, walletInitialState }}>
      {props.children}
    </Context.Provider>
  );
};

export default WalletProvider;

export const useWallet = () => React.useContext(Context);
