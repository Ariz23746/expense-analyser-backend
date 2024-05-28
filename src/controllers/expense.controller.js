import mongoose from "mongoose";
import { expenseModelKey } from "../constants.js";
import { checkIfAllMandatoryFieldsExist } from "../helpers/validators.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Expense } from "../models/expense.models.js";
import { Report } from "../models/report.models.js";
import { getCurrentMonthAndYear } from "../utils/dateUtils.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

const addExpense = asyncHandler(async (req, res) => {
  const validator = checkIfAllMandatoryFieldsExist(expenseModelKey, req.body);
  if (validator.length > 0) {
    throw new ApiError(
      400,
      validator.join(",") +
        `${validator.length === 1 ? " is" : " are"} missing. Please fill all the mandatory fields`
    );
  }
  const { categoryId, name, description, amount } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // creating expense
    const { month, year } = getCurrentMonthAndYear();
    const rawExpense = await Expense.create(
      [
        {
          name,
          description,
          amount,
          categoryId,
          userId: req.user._id,
          month,
          year,
        },
      ],
      { session }
    );

    const expense = rawExpense[0];

    // checking explicitly
    if (!expense) {
      throw new ApiError(500, "Something went wrong. Please try again");
    }

    const report = await Report.findOneAndUpdate(
      {
        categoryId,
        userId: req.user._id,
        month,
        year,
      },
      { $inc: { totalAmountSpent: amount } },
      { new: true, session }
    );

    if (!report) {
      throw new ApiError(500, "Something went wrong. Please try again.");
    }

    // committing the transaction
    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(new ApiResponse(201, expense, "Expense added successfully"));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log("err", err);
    throw new ApiError(500, "Failed to add expense. Please try again.");
  }
});

const getCategoryExpense = asyncHandler(async (req, res) => {
  const { month, year } = getCurrentMonthAndYear();
  const query = {
    userId: req.user._id,
    month,
    year,
  };
  const expenseCategoryWise = await Report.find(query);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        expenseCategoryWise,
        "Categ expenses fetched successfully!"
      )
    );
});
const getExpense = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { month, year } = getCurrentMonthAndYear();
  const query = {
    userId: req.user._id,
    month,
    year,
  };
  // Calculate the skip value for pagination
  const skip = (page - 1) * limit;

  const expenses = await Expense.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .exec();

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

export { addExpense, getExpense, getCategoryExpense };
