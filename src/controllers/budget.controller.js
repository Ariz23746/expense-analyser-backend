import mongoose from "mongoose";
import { checkIfAllMandatoryFieldsExist } from "../helpers/validators.js";
import { Budget } from "../models/budget.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { budgetModelKey } from "../constants.js";
import { getCurrentMonthAndYear } from "../utils/dateUtils.js";

const generateFilterDateErrorMessage = (data) => {
  const { startMonth, startYear, endMonth, endYear } = data;
  if (!startMonth) {
    return "startMonth is missing for filtering.Either remove all the filter params or provide the missing variable";
  } else if (!startYear) {
    return "startYear is missing for filtering.Either remove all the filter params or provide the missing variable";
  } else if (!endMonth) {
    return "endMonth is missing for filtering.Either remove all the filter params or provide the missing variable";
  } else if (!endYear) {
    return "endYear is missing for filtering.Either remove all the filter params or provide the missing variable";
  }
};
const createBudget = asyncHandler(async (req, res) => {
  const { groupId, userId, amount, date, forGroup } = req.body;

  if (!forGroup && !req.user._id) {
    throw new ApiError(400, "Bad request");
  } else if (forGroup && !groupId) {
    throw new ApiError(400, "groupId is missing");
  }
  const vadilator = checkIfAllMandatoryFieldsExist(budgetModelKey, req.body);
  if (vadilator.length > 0) {
    throw new ApiError(
      400,
      vadilator.join(",") +
        `${vadilator.length === 1 ? " is" : " are"} missing. Please give all the mandatory fields`
    );
  }

  let { month, year } = getCurrentMonthAndYear();

  if (date) {
    const budgetDate = new Date(date); // date = 2024-05-28
    month = budgetDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
    year = budgetDate.getFullYear();
  }

  // check if budget is already created
  const budgetAlreadyExist = await Budget.findOne({
    ...(forGroup ? { groupId } : { userId }),
    month,
    year,
  });

  if (budgetAlreadyExist) {
    throw new ApiError(
      409,
      `Budget for this month of this ${forGroup ? "group" : "user"} already exist`
    );
  }

  // creating budget

  const budget = await Budget.create({
    amount,
    month,
    year,
    ...(forGroup ? { groupId } : { userId: req.user._id }),
  });

  // Checking if budget is actually created by fetching from db
  const createdBudget = await Budget.findById(budget._id);
  if (!createdBudget) {
    throw new ApiError(500, "Something went wrong while creating the budget");
  }

  // Giving response
  return res
    .status(201)
    .json(new ApiResponse(201, createdBudget, "Budget created successfully"));
});

const getBudgets = asyncHandler(async (req, res) => {
  const { entityId, forGroup } = req.body;
  if (forGroup && !entityId) {
    throw new ApiError(400, `groupId is missing`);
  }
  if (forGroup && !mongoose.Types.ObjectId.isValid(entityId)) {
    throw new ApiError(400, `groupId is not a valid ObjectId`);
  }

  const {
    page = 1,
    limit = 6,
    startMonth,
    startYear,
    endMonth,
    endYear,
  } = req.query;

  // Calculate the skip value for pagination
  const skip = (page - 1) * limit;

  // Construct the query object
  const query = {
    ...(forGroup ? { groupId: entityId } : { userId: req.user._id }),
  };

  // Apply date filters if provided
  if (startMonth || startYear || endMonth || endYear) {
    if (startMonth && startYear && endMonth && endYear) {
      if (parseInt(startYear) === parseInt(endYear)) {
        // Same year, check if start month is less than or equal to end month
        if (parseInt(startMonth) <= parseInt(endMonth)) {
          query.month = {
            $gte: parseInt(startMonth),
            $lte: parseInt(endMonth),
          };
          query.year = parseInt(startYear);
        } else {
          throw new ApiError(
            400,
            "Invalid date range. Start Month cannot be greater than endMonth"
          );
        }
      } else if (parseInt(startYear) < parseInt(endYear)) {
        // Different years, query from start to end year inclusively
        query.$or = [
          {
            $and: [
              { year: parseInt(startYear) },
              { month: { $gte: parseInt(startMonth) } },
            ],
          },
          {
            $and: [
              { year: parseInt(endYear) },
              { month: { $lte: parseInt(endMonth) } },
            ],
          },
        ];
      } else {
        // Start year is greater than end year
        // Invalid date range, handle error or return empty result
      }
    } else {
      throw new ApiError(400, generateFilterDateErrorMessage(req.body));
    }
  }

  // Find budgets with pagination and sort by date (latest first)
  const budgets = await Budget.find(query)
    .sort({ year: -1, month: -1 }) // Sort by year and month in descending order
    .skip(skip)
    .limit(parseInt(limit))
    .select("-createdAt -updatedAt -__v -_id")
    .exec();
  // Get the total count for pagination info
  const totalCount = await Budget.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      budgets,
    })
  );
});

const getCurrentBudget = asyncHandler(async (req, res) => {
  const { entityId, forGroup } = req.body;
  if (forGroup && !entityId) {
    throw new ApiError(400, `groupId is missing`);
  }
  if (forGroup && !mongoose.Types.ObjectId.isValid(entityId)) {
    throw new ApiError(400, `groupId is not a valid ObjectId`);
  }

  // Todays date
  const { month, year } = getCurrentMonthAndYear();

  // Construct the query object
  const query = {
    ...(forGroup ? { groupId: entityId } : { userId: req.user._id }),
    year,
    month,
  };

  const budget = await Budget.find(query).sort({ year: -1, month: -1 });

  if (!budget) {
    throw new ApiError(400, "No budget found! Please create one");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, budget, "Budget successfully fetched"));
});

export { createBudget, getBudgets, getCurrentBudget };
