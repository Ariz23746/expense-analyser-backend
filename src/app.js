import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routers/user.router.js";

const app = express();

// setting cors to allow communication
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// setting json format to be allowed
app.use(
  express.json({
    limit: "16kb",
  })
);

// allowing express to understand url encoded data ex: ariz%20khan
app.use(
  express.urlencoded({
    limit: "16kb",
    extended: true,
  })
);

// saving temporary files to server in public folder
app.use(express.static("public"));

// allowing express to access user cookies
app.use(cookieParser());

app.use("/api/v1/users", userRouter);

export { app };
