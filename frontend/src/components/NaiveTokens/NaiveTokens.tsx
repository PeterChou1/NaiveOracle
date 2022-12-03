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

export const NaiveTokens = () => {
  const [results, setResults] = useState<string>("Insert Results Here.");
  const [oracleNumber, setOracleNumber] = useState<string>("");
  const [oracleQuality, setOracleQuality] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");

  async function onSubmit(event: React.FormEvent) {
    setResults("Results have been set.");
    event.preventDefault();
    console.log("oracleNumber: " + oracleNumber, "oracleQuality: " + oracleQuality, "tokenAmount: " + tokenAmount);
  }

  async function onTransfer(event: React.FormEvent) {

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
              <form onSubmit={onSubmit}>
                <VStack textAlign="left" alignItems="left" padding={3}>
                  <FormLabel>Deposit</FormLabel>
                  <Input
                    bg="white"
                    isRequired
                    onChange={(e) => setOracleNumber(e.target.value)}
                  ></Input>
                  <FormLabel>Deposit Amount:</FormLabel>
                  <Button colorScheme="green" type="submit">
                    Confirm Request
                  </Button>
                </VStack>
              </form>
              <form onSubmit={onTransfer}>
                <VStack textAlign="left" alignItems="left" padding={3}>
                  <FormLabel>Transfer</FormLabel>
                  <Input
                    bg="white"
                    isRequired
                    onChange={(e) => setOracleNumber(e.target.value)}
                  ></Input>
                  <FormLabel>Transfer Address:</FormLabel>
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
