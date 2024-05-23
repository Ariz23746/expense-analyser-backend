import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `Mongo DB is connected !! \nHost : ${connectionInstance.connection.host} `
    );
  } catch (err) {}
};

export default dbConnect;
