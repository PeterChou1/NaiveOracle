require("dotenv").config();

import { updateVolume } from "./ethereum";
import fetch from 'node-fetch';

const start = () => {
  // fetch(options)
  //   .then(parseData)
  //   .then(updateVolume)
  //   .then(restart)
  //   .catch(error);
};

const fetchData = () => {
  
const response = await fetch('https://httpbin.org/post', {method: 'POST', body: 'a=1'});
const data = await response.json();

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
  return new Promise((resolve) => setTimeout(() => resolve(void), ms));
};

const error = (error: any) => {
  console.error(error);
  restart();
};

export default start;
