import React from "react";
import { Box, Container, FormLabel } from "@chakra-ui/react";

interface OracleCardProps {
  address: string;
  balance: string;
  index: number;
}

export const OracleCard = (props: OracleCardProps) => {
  return (
    <Box>
      <FormLabel py={2}>Oracle #{props.index}</FormLabel>
      <Container bg="green.50" rounded="3xl" padding={3}>
        <FormLabel>
          <b>Node Address:</b>{" "}
        </FormLabel>
        <FormLabel>{props.address}</FormLabel>
        <FormLabel>
          <b>Token Balance (NaiveTokens):</b>
        </FormLabel>
        <FormLabel>{props.balance}</FormLabel>
      </Container>
    </Box>
  );
};
