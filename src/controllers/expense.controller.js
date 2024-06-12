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

  const { categoryId, name, description, amount, date = "" } = req.body;
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

    const responseExpense = {
      userId: expense.userId,
      categoryId: expense.categoryId,
      name: expense.name,
      description: expense.description,
      amount: expense.amount,
      month: expense.month,
      year: expense.year,
      createdAt: expense.createdAt,
    };

    return res
      .status(201)
      .json(
        new ApiResponse(201, responseExpense, "Expense added successfully")
      );
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
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
  const expenseCategoryWise = await Report.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "categories", // Name of the Category model collection
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },
    {
      $unwind: "$categoryDetails", // Unwind to get individual category details
    },
    {
      $project: {
        _id: 0, // Exclude _id field
        categoryName: "$categoryDetails.name",
        categoryBudget: "$categoryDetails.categoryBudget",
        isDark: "$categoryDetails.isDark",
        color: "$categoryDetails.color",
        categoryId: "$categoryDetails._id",
        month: 1,
        year: 1,
        totalAmountSpent: 1,
      },
    },
  ]);
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
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select("-_id -__v -updatedAt")
    .exec();

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

export { addExpense, getExpense, getCategoryExpense };
