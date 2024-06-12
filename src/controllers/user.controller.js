import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { checkIfAllMandatoryFieldsExist } from "../helpers/validators.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { userModelKey } from "../constants.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while creating accessToken and refreshToken"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  // Grabbing the data
  const { username, firstName, lastName, password, email, phone } = req.body;

  // Validation of data
  const vadilator = checkIfAllMandatoryFieldsExist(userModelKey, req.body);

  if (vadilator.length > 0) {
    throw new ApiError(
      400,
      vadilator.join(",") +
        `${vadilator.length === 1 ? " is" : " are"} missing. Please fill all the mandatory fields`
    );
  }

  // Checking if user already exists
  const alreadyExistUser = await User.findOne({
    $or: [{ username }, { email }, { phone }],
  });

  if (alreadyExistUser) {
    throw new ApiError(409, "User with same username or email already exists");
  }

  // Upload avatar if exists
  let avatarCloudinaryPath = "";

  if (req.file && req.file.path) {
    const avatarLocalPath = req.file.path;
    const uploadResult = await uploadOnCloudinary(avatarLocalPath);
    avatarCloudinaryPath = uploadResult?.url || "";
  }

  // Saving the data to backend
  const user = await User.create({
    username,
    firstName,
    lastName,
    avatar: avatarCloudinaryPath,
    password,
    email,
    phone,
  });

  // Checking if user is actually created by fetching from db
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating the user");
  }

  // Giving response
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { data: createdUser },
        "User registered successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  // Debugging to see the request body
  // check if sufficient data is coming to log in user
  const { userId, password } = req.body;

  if (!userId) {
    throw new ApiError(400, "Username or phone is required");
  }
  if (!password) {
    throw new ApiError(400, "password is required");
  }
  // finding User
  const user = await User.findOne({
    $or: [{ phone: userId }, { username: userId }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist. Please sign up!");
  }

  // check for password
  const isValidPassword = await user.isPasswordCorrect(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Password is incorrect");
  }

  // generate access and refresh token
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const optionForCookie = {
    httpOnly: true,
    secure: false,
  };

  const modifiedUser = await User.findById(user?._id)?.select(
    "-refreshToken -password -__v"
  );

  res
    .status(200)
    .cookie("refreshToken", refreshToken, optionForCookie)
    .cookie("accessToken", accessToken, optionForCookie)
    .json(
      new ApiResponse(
        200,
        { user: modifiedUser, accessToken, refreshToken },
        "User is login successful"
      )
    );
});

const getNewToken = asyncHandler(async (req, res) => {
  // check if sufficient data is coming to log in user
  const { oldRefreshToken } = req.body;
  if (!oldRefreshToken) {
    throw new ApiError(400, "oldRefershToken is required");
  }

  // finding User
  const user = await User.findOne({
    refreshToken: oldRefreshToken,
  });

  if (!user) {
    throw new ApiError(404, "User does not exist. Please sign up!");
  }
  // generate access and refresh token
  const accessToken = user.generateAccessToken();
  const optionForCookie = {
    httpOnly: true,
    secure: false,
  };

  res
    .status(200)
    .cookie("refreshToken", oldRefreshToken, optionForCookie)
    .cookie("accessToken", accessToken, optionForCookie)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: oldRefreshToken },
        "New token generated successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // finding user using req.user and resetting refreshToken
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // it removes the key all together
      },
    },
    { new: true }
  );

  const optionForCookie = {
    httpOnly: true,
    secure: false,
  };
  res
    .status(200)
    .clearCookie("refreshToken", optionForCookie)
    .clearCookie("accessToken", optionForCookie)
    .json(new ApiResponse(200, {}, "User is logged out successful"));
});

const editProfile = asyncHandler(async (req, res) => {
  // grab the data from req.body and req.file
  const { firstName, lastName, email } = req.body;
  if (!firstName && !lastName && !email && !(req.file && req.file.path)) {
    throw new ApiError(400, "Bad Request");
  }

  // Uploading file on cloudinary
  let avatarCloudinaryPath = "";
  if (req.file && req.file.path) {
    const avatarLocalPath = req.file.path;
    const uploadResult = await uploadOnCloudinary(avatarLocalPath);
    avatarCloudinaryPath = uploadResult?.url || "";
  }

  // updating db
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(email ? { email } : {}),
        ...(avatarCloudinaryPath ? { avatar: avatarCloudinaryPath } : {}),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password -refreshToken -__v");

  // Will have access of user from req.user
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "successfully modified data"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, changedPassword } = req.body;
  if (!oldPassword || !changedPassword) {
    throw new ApiError(400, "Bad Request");
  }

  if (changedPassword === oldPassword) {
    throw new ApiError(
      400,
      "The new password must be different from the current password. Please choose a different password."
    );
  }

  // checking password is even changed or not
  const currentUser = await User.findById(req.user._id);
  const isValidPassword = await currentUser.isPasswordCorrect(oldPassword);

  if (!isValidPassword) {
    throw new ApiError(400, "Old password is not valid");
  }

  // saving new password for db
  currentUser.password = changedPassword;

  await currentUser.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  editProfile,
  changePassword,
  getNewToken,
};
