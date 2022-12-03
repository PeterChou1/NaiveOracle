import React, { useState } from "react";
import {
  Box,
  Text,
  VStack,
  Container,
  Grid,
  Input,
  Button,
  FormLabel,
} from "@chakra-ui/react";
import { useWallet } from "../../contexts/WalletContext";
import { ethers } from "ethers";

export const NaiveTokens = () => {
  const [depositNumber, setDepositNumber] = useState<number>(0);
  const [transferNumber, setTransferNumber] = useState<number>(0);
  const [transferAddress, setTransferAddress] = useState<string>("");
  const { wallet, setWallet } = useWallet();

  async function onDeposit(event: React.FormEvent) {
    event.preventDefault();
    const depositWei = ethers.BigNumber.from(depositNumber);
    await wallet.naiveTokenContract.deposit(depositWei, { value: depositWei });
    console.log("deposit number: " + depositNumber);
  }

  async function onTransfer(event: React.FormEvent) {
    event.preventDefault();
    const transferAmount = ethers.BigNumber.from(transferNumber);
    await wallet.naiveTokenContract.transfer(transferAddress,  transferAmount);
    console.log("transfer amount: " + transferAmount + " to " + transferAddress);
  }

  return (
    <Box fontSize="xl">
      <Grid bg="green.50" minH="30vh" p={3}>
        <VStack spacing={12}>
          <Container padding={3}>
            <Text marginBottom="3">
              <b>Token Management</b>
            </Text>
            <Container bg="green.100" padding="6" rounded="3xl">
              <form onSubmit={onDeposit}>
                <VStack textAlign="left" alignItems="left" padding={3}>
                  <FormLabel>Deposit</FormLabel>
                  <Input
                    bg="white"
                    isRequired
                    onChange={(e) => setDepositNumber(parseInt(e.target.value))}
                  ></Input>
                  <FormLabel>Deposit Amount:</FormLabel>
                  <Button colorScheme="green" type="submit">
                    Confirm Request
                  </Button>
                </VStack>
              </form>
              <form onSubmit={onTransfer}>
                <VStack textAlign="left" alignItems="left" padding={3}>
                  <FormLabel>Transfer Amount</FormLabel>
                  <Input
                    bg="white"
                    isRequired
                    onChange={(e) => setTransferNumber(parseInt(e.target.value))}
                  ></Input>
                  <FormLabel>Transfer Address:</FormLabel>
                  <Input
                    bg="white"
                    isRequired
                    onChange={(e) => setTransferAddress(e.target.value)}
                  ></Input>
                  <Button colorScheme="green" type="submit">
                    Confirm Transfer
                  </Button>
                </VStack>
              </form>
            </Container>
          </Container>
        </VStack>
      </Grid>
    </Box>
  );
};

export default NaiveTokens;
