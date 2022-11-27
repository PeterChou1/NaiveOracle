import * as React from "react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import NavBar from "./components/NavBar/NavBar";
import Consumer from "./components/Consumer/Consumer";
import OracleOperator from "./components/OracleOperator/OracleOperator";

export const App = () => (
  <ChakraProvider theme={theme}>
    <NavBar></NavBar>
    <Consumer></Consumer>
    <OracleOperator></OracleOperator>
  </ChakraProvider>
);
