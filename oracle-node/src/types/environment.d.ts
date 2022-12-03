export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ETH_USD_API: string;
      CONTRACT_ADDRESS: string;
      ABI: string;
      TIMEOUT: number;
    }
  }
}
