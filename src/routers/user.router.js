import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { multerMiddlewareUpload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = express.Router();

userRouter
  .route("/register")
  .post(multerMiddlewareUpload.single("avatar"), registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(verifyJWT, logoutUser);

export default userRouter;
