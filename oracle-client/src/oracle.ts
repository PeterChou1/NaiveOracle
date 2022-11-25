require("dotenv").config();

import { updateVolume } from "./ethereum";
import fetch from "node-fetch";

const start = () => {
  fetchData().then(parseData).then(updateVolume).then(restart).catch(error);
};

async function fetchData() {
  const api = process.env.ETH_USD_API;
  const response = await fetch(api);
  const data = await response.json();
  return data;
}

const parseData = (body: any) => {
  return new Promise((resolve, reject) => {
    let volume;
    try {
      volume = body.main.volume.toString();
    } catch (error) {
      reject(error);
      return;
    }
    resolve({
      volume,
    });
  });
};

const restart = () => {
  if (process.env.TIMEOUT) wait(process.env.TIMEOUT).then(start);
};

const wait = (ms: number) => {
  return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
};

const error = (error: any) => {
  console.error(error);
  restart();
};

export default start;
