import React, { useState } from "react";
import {
  Box,
  Container,
  FormLabel,
  VStack,
  Input,
  Button,
} from "@chakra-ui/react";

interface MyOracleCardProps {
  publicKey: string;
  privateKey: string;
  balance: string;
  index: number;
}

export const MyOracleCard = (props: MyOracleCardProps) => {
  const [tokenAmount, setTokenAmount] = useState<string>("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    console.log("tokenAmount: " + tokenAmount);
  }

  return (
    <Box>
      <FormLabel py={2}>My Oracle #{props.index}</FormLabel>
      <Container bg="green.50" rounded="3xl" padding={3}>
        <FormLabel>
          <b>Public Key:</b>{" "}
        </FormLabel>
        <FormLabel>{props.publicKey}</FormLabel>
        <FormLabel>
          <b>Private Key:</b>{" "}
        </FormLabel>
        <FormLabel>{props.privateKey}</FormLabel>
        <FormLabel>
          <b>Token Balance (NaiveTokens):</b>
        </FormLabel>
        <FormLabel>{props.balance}</FormLabel>
        <FormLabel>
          <b>Withdraw:</b>
        </FormLabel>
        <form onSubmit={onSubmit}>
          <VStack>
            <Input
              bg="white"
              isRequired
              onChange={(e) => setTokenAmount(e.target.value)}
            ></Input>
            <Button colorScheme="green" type="submit">
              Confirm Withdrawal
            </Button>
          </VStack>
        </form>
      </Container>
    </Box>
  );
};

export default MyOracleCard;
