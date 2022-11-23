require("dotenv").config();

import request from "request-promise-native";
import { updateVolume } from "./ethereum";

const options = { uri: process.env.WEATHER_URL, json: true };

const start = () => {
  request(options)
    .then(parseData)
    .then(updateVolume)
    .then(restart)
    .catch(error);
};

const parseData = (body) => {
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
  wait(process.env.TIMEOUT).then(start);
};

const wait = (ms) => {
  return new Promise((resolve, reject) => setTimeout(() => resolve(), ms));
};

const error = (error) => {
  console.error(error);
  restart();
};

export default start;
