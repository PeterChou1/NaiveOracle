import React, { useState } from "react";
import {
  Box,
  Text,
  VStack,
  Container,
  Grid,
  FormLabel,
} from "@chakra-ui/react";
import { OracleCard } from "./OracleCard/OracleCard";
import { useWallet } from "../../contexts/WalletContext";

export const OracleOperator = () => {
  const { wallet, setWallet } = useWallet();
  const OracleNodes = [
    {
      address: wallet.oracleContract_X.address,
      balance: wallet.oracleContract_X_tokens,
    },
    {
      address: wallet.oracleContract_Y.address,
      balance: wallet.oracleContract_Y_tokens,
    },
    {
      address: wallet.oracleContract_Z.address,
      balance: wallet.oracleContract_Z_tokens,
    },
    {
      address: wallet.userContract.address,
      balance: wallet.userContract_token,
    }
  ];
  return (
    <Box fontSize="xl">
      <Grid minH="100vh" p={3} bg="green.50">
        <VStack spacing={12}>
          <Container padding={3}>
            <Text marginBottom="3">
              <b>Oracle Operator</b>
            </Text>
            <Container bg="green.100" padding="6" rounded="3xl">
              <VStack textAlign="left" alignItems="left" padding={3}>
                <FormLabel>
                  <b>Currently Running Oracle Nodes:</b>
                </FormLabel>
                <VStack textAlign="left" bg="white" padding={5} rounded="3xl">
                  {OracleNodes.map((oracle, index) => {
                    return (
                      <OracleCard
                        key={oracle.address}
                        address={oracle.address}
                        balance={oracle.balance}
                        index={index}
                      ></OracleCard>
                    );
                  })}
                </VStack>
              </VStack>
            </Container>
          </Container>
        </VStack>
      </Grid>
    </Box>
  );
};

export default OracleOperator;


