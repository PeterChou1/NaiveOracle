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

export const Consumer = () => {
  const [results, setResults] = useState<string>("Insert Results Here.");
  const [oracleNumber, setOracleNumber] = useState<string>("");
  const [oracleQuality, setOracleQuality] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");

  async function onSubmit(event: React.FormEvent) {
    setResults("Results have been set.");
    event.preventDefault();
    console.log("oracleNumber: " + oracleNumber, "oracleQuality: " + oracleQuality, "tokenAmount: " + tokenAmount);
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
              </VStack>
            </Container>
          </Container>
        </VStack>
      </Grid>
    </Box>
  );
};

export default Consumer;
