import React, { Provider, useState } from "react";

interface WalletType {
  balance: string;
  currentAccount: any;
  chainId: number;
  chainName: string;
}

const walletInitialState = {
  balance: "",
  currentAccount: null,
  chainId: 0,
  chainName: "",
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
