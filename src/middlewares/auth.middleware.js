import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized access");
    }
    //decrypting the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // find user with the help of decodedToken data

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    // setting user in req
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(error.statusCode || 401).json({
        success: false,
        message: "Access Token has expired. Please login again.",
      });
    }
    return res.status(error.statusCode || 401).json({
      success: false,
      message: "Invalid access token",
    });
    next();
  }
};

export const verifyJWTForRefreshToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.refreshToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized access");
    }
    //decrypting the token
    const decodedToken = jwt.verify(token, process.env.RERESH_TOKEN_SECRET);

    // find user with the help of decodedToken data
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    // setting user in req
    req.user = user;
    next();
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      success: false,
      message: "Refresh Token has expired. Please login again.",
    });
  }
};
