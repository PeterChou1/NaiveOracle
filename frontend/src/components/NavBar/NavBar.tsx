import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Box,
  Flex,
  useColorModeValue,
  Stack,
  Button,
  ChakraProvider,
} from "@chakra-ui/react";
import { useWallet } from "../../contexts/WalletContext";

declare let window: any;



export const NavBar = () => {
  const { wallet, setWallet } = useWallet();

  useEffect(() => {
    if (
      !wallet.currentAccount ||
      !ethers.utils.isAddress(wallet.currentAccount)
    )
      return;
    //client side code
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider.getBalance(wallet.currentAccount).then((result) => {
      setWallet({ ...wallet, balance: ethers.utils.formatEther(result) });
    });
    provider.getNetwork().then((result) => {
      setWallet({ ...wallet, chainId: result.chainId, chainName: result.name });
      console.log("connected to network");
      console.log(result.name);
    });
  }, [wallet.currentAccount]);

  const onClickConnect = async () => {
    //client side code
    if (!window.ethereum) {
      console.log("Please Install MetaMask");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // MetaMask requires requesting permission to connect users accounts
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const naiveTokenContract = wallet.naiveTokenContract.connect(signer);
    const oracleContract_X = wallet.oracleContract_X.connect(signer);
    const oracleContract_Y = wallet.oracleContract_Y.connect(signer);
    const oracleContract_Z = wallet.oracleContract_Z.connect(signer);
    const userContract = wallet.userContract.connect(signer);
    const naiveTokens = ethers.utils.formatEther(await naiveTokenContract.balanceOf(accounts[0]));
    const oracleContract_X_tokens = ethers.utils.formatEther(await naiveTokenContract.balanceOf(oracleContract_X.address));
    const oracleContract_Y_tokens = ethers.utils.formatEther(await naiveTokenContract.balanceOf(oracleContract_Y.address));
    const oracleContract_Z_tokens = ethers.utils.formatEther(await naiveTokenContract.balanceOf(oracleContract_Z.address));
    const userContract_token = ethers.utils.formatEther(await naiveTokenContract.balanceOf(userContract.address));
    if (accounts.length > 0) {
      setWallet({ 
        ...wallet, 
        currentAccount: accounts[0],
        naiveTokenContract,
        oracleContract_X, 
        oracleContract_Y,
        oracleContract_Z,
        userContract,
        naiveTokens,
        oracleContract_X_tokens,
        oracleContract_Y_tokens,
        oracleContract_Z_tokens,
        userContract_token
      });
    }
  };

  const onClickDisconnect = () => {
    setWallet({ ...wallet, balance: "", currentAccount: null });
  };

  return (
    <>
      <ChakraProvider>
        <Box bg={useColorModeValue("white", "green.900")} px={4}>
          <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
            <Box fontSize="xl">
              {" "}
              <b>NaiveOracle Tokens: {wallet.naiveTokens}</b>
              {" "}
            </Box>
            <Flex alignItems={"center"}>
              <Stack direction={"row"} spacing={7}>
                {wallet.currentAccount ? (
                  <Button
                    type="button"
                    colorScheme="green"
                    onClick={onClickDisconnect}
                    rounded="3xl"
                    width="9xs"
                  >
                    Connected
                  </Button>
                ) : (
                  <Button
                    type="button"
                    colorScheme="green"
                    onClick={onClickConnect}
                    rounded="3xl"
                    width="2xs"
                  >
                    Connect Wallet
                  </Button>
                )}
              </Stack>
            </Flex>
          </Flex>
        </Box>
      </ChakraProvider>
    </>
  );
};

export default NavBar;
