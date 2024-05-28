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

const userRoutes = express.Router();

userRoutes
  .route("/register")
  .post(multerMiddlewareUpload.single("avatar"), registerUser);
userRoutes.route("/login").post(loginUser);

//protected routes
userRoutes.route("/logout").get(verifyJWT, logoutUser);
userRoutes
  .route("/edit-profile")
  .patch(verifyJWT, multerMiddlewareUpload.single("avatar"), editProfile);
userRoutes.route("/change-password").post(verifyJWT, changePassword);

export default userRoutes;
