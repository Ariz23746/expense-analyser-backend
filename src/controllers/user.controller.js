import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { checkIfAllMandatoryFieldsExist } from "../helpers/userModalHelper.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  const vadilator = checkIfAllMandatoryFieldsExist("user", req.body);

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
  const { phone, username, password } = req.body;

  if (!phone && !username) {
    throw new ApiError(400, "Username or phone is required");
  }

  // finding User
  const user = await User.findOne({
    $or: [{ username }, { phone }],
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
    "-refreshToken -password"
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

export { registerUser, loginUser, logoutUser };
