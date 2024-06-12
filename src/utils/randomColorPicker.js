import { colorArray } from "../constants.js";

export const getRandomColorObject = () => {
  const index = Math.floor(Math.random() * colorArray.length);
  return colorArray[index];
};

0.5;
