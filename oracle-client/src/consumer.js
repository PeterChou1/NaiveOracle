import { weatherUpdate } from "./ethereum";

const consume = () => {
  weatherUpdate((error, result) => {
    console.log("NEW ETH/USD VOLUME DATA RETRIEVAL EVENT ON SMART CONTRACT");
    console.log("BLOCK NUMBER: ");
    console.log("  " + result.blockNumber);
    console.log("DATA: ");
    console.log(result.args);
    console.log("\n");
  });
};

export default consume;
