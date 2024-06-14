import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const checkForActivity = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, {
      message: "pong",
    })
  );
});

export { checkForActivity };
