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

export const Consumer = () => {
  const { wallet, setWallet } = useWallet();
  const [results, setResults] = useState<string>("Insert Results Here.");
  const [oracleNumber, setOracleNumber] = useState<string>("");
  const [oracleQuality, setOracleQuality] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    console.log("oracleNumber: " + oracleNumber, "oracleQuality: " + oracleQuality, "tokenAmount: " + tokenAmount);
    await wallet.userContract.callOracle(ethers.BigNumber.from(oracleNumber), ethers.BigNumber.from(0));
    setResults("fetching result click get results for more");
  }

  async function getResponse(event: React.FormEvent) {
    event.preventDefault();
    const response = await wallet.userContract.getResponse();
    console.log(response);
    setResults(ethers.utils.formatEther(response));
  }

  return (
    <Box fontSize="xl">
      <Grid bg="green.50" minH="30vh" p={3}>
        <VStack spacing={12}>
          <Container padding={3}>
            <Text marginBottom="3">
              <b>Consumer</b>
            </Text>
            <Container bg="green.100" padding="6" rounded="3xl">
              <form onSubmit={onSubmit}>
                <VStack textAlign="left" alignItems="left" padding={3}>
                  <FormLabel>Minimum Number of Oracles Desired:</FormLabel>
                  <Input
                    bg="white"
                    isRequired
                    onChange={(e) => setOracleNumber(e.target.value)}
                  ></Input>
                  <FormLabel>Quality of Oracle:</FormLabel>
                  <Input
                    bg="white"
                    isRequired
                    onChange={(e) => setOracleQuality(e.target.value)}
                  ></Input>
                  <FormLabel>Amount of NaiveTokens:</FormLabel>
                  <Input
                    bg="white"
                    isRequired
                    onChange={(e) => setTokenAmount(e.target.value)}
                  ></Input>
                  <Button colorScheme="green" type="submit">
                    Confirm Request
                  </Button>
                </VStack>
              </form>
              <VStack textAlign="left" bg="white" padding={5} rounded="3xl">
                <FormLabel>Results:</FormLabel>
                <Text fontSize="xs">{results}</Text>
                <Button colorScheme="green" onClick={getResponse}>
                    Get Response
                  </Button>
              </VStack>
            </Container>
          </Container>
        </VStack>
      </Grid>
    </Box>
  );
};

export default Consumer;
