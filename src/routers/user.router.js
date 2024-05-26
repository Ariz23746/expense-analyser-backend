import express from "express";
import {
  changePassword,
  editProfile,
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

//protected routes
userRouter.route("/logout").get(verifyJWT, logoutUser);
userRouter
  .route("/edit-profile")
  .post(verifyJWT, multerMiddlewareUpload.single("avatar"), editProfile);

userRouter.route("/change-password").post(verifyJWT, changePassword);
export default userRouter;
