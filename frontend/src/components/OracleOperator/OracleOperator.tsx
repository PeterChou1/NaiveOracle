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
import { MyOracleCard } from "./MyOracleCard/MyOracleCard";

export const OracleOperator = () => {
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
                <FormLabel paddingTop={10}>
                  <b>My Oracle Nodes:</b>
                </FormLabel>
                <VStack textAlign="left" bg="white" padding={5} rounded="3xl">
                  {MyOracleNodes.map((oracle, index) => {
                    return (
                      <MyOracleCard
                        key={oracle.publicKey}
                        publicKey={oracle.publicKey}
                        privateKey={oracle.privateKey}
                        balance={oracle.balance}
                        index={index}
                      ></MyOracleCard>
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

const OracleNodes = [
  {
    address: "0x7ed5f8cb3cd63a6a52493c5764b6cce5b8fe466f",
    balance: "120.412",
  },
  {
    address: "0xe39ea8dcec33ea56f0c0c69949170a149906ec18",
    balance: "49.321",
  },
  {
    address: "0x0cc44c69e2F3f5A21C2f60119dCE9f594c1a17FE",
    balance: "201.324",
  },
];

const MyOracleNodes = [
  {
    publicKey: "0xe39ea8dcec33ea56f0c0c69949170a149906ec23",
    privateKey:
      "1daa123a5a13c75a5238ce676ef06368fca57dcc33f3e33ea3c63d77f123a5c",
    balance: "305.212",
  },
];
