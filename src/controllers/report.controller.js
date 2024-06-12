import { Report } from "../models/report.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 6 } = req.query;

  const query = {
    userId: req.user._id,
  };

  const skip = (page - 1) * limit;

  const reports = await Report.aggregate([
    { $match: query }, // Filter by userId
    {
      $group: {
        _id: { month: "$month", year: "$year" },
        totalAmountSpent: { $sum: "$totalAmountSpent" },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id.month",
        year: "$_id.year",
        totalAmountSpent: 1,
      }, // Unwind to get individual category details
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } }, // Sort by year and month
    { $skip: skip },
    { $limit: parseInt(limit) },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, reports, "Reports fetched successfully!"));
});

export { getReports };
