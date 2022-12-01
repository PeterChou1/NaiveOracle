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
    });
  }, [wallet.currentAccount]);

  const onClickConnect = () => {
    //client side code
    if (!window.ethereum) {
      console.log("Please Install MetaMask");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // MetaMask requires requesting permission to connect users accounts
    provider
      .send("eth_requestAccounts", [])
      .then((accounts) => {
        if (accounts.length > 0)
          setWallet({ ...wallet, currentAccount: accounts[0] });
      })
      .catch((e) => console.log(e));
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
              <b>OracleX</b>{" "}
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
                    Connected [{wallet.currentAccount}]
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
