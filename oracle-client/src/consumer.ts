import { volumeUpdate } from "./ethereum";

const consume = () => {
  volumeUpdate((error: any, result: any) => {
    console.log("NEW ETH/USD VOLUME DATA RETRIEVAL EVENT ON SMART CONTRACT");
    console.log("BLOCK NUMBER: " + result.blockNumber);
    console.log("DATA: " + result);
    console.log("ERROR: " + error);
    console.log("\n");
  });
};

export default consume;
