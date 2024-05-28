import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

import userRoutes from "./routers/user.router.js";
import groupRoutes from "./routers/group.router.js";
import budgetRoutes from "./routers/budget.router.js";
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/groups", groupRoutes);
app.use("/api/v1/budgets", budgetRoutes);
export { app };
