import mongoose from "mongoose";
import { categoryModelKey } from "../constants.js";
import { checkIfAllMandatoryFieldsExist } from "../helpers/validators.js";
import { Category } from "../models/category.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Report } from "../models/report.models.js";
import { getCurrentMonthAndYear } from "../utils/dateUtils.js";
import { getRandomColorObject } from "../utils/randomColorPicker.js";
import { Budget } from "../models/budget.models.js";

const createCategory = asyncHandler(async (req, res) => {
  const vadilator = checkIfAllMandatoryFieldsExist(categoryModelKey, req.body);
  if (vadilator.length > 0) {
    throw new ApiError(
      400,
      vadilator.join(",") +
        `${vadilator.length === 1 ? " is" : " are"} missing. Please fill all the mandatory fields`
    );
  }

  const { name, categoryBudget } = req.body;

  const { month, year } = getCurrentMonthAndYear();
  // checking if categoryBudget is greater than total budget

  const userBudget = await Budget.findOne({
    userId: req.user._id,
    month,
    year,
  });

  if (!userBudget) {
    throw new ApiError(400, `budget doesnot exist for this user`);
  }

  // Calculate the total of all existing category budgets for the current month and year
  const categories = await Category.find({
    userId: req.user._id,
    month,
    year,
  });

  const totalCategoryBudget = categories.reduce(
    (acc, category) => acc + category.categoryBudget,
    0
  );

  if (userBudget?.amount < totalCategoryBudget + parseInt(categoryBudget)) {
    throw new ApiError(
      400,
      `Total category amount exceeding your total budget.`
    );
  }

  // checking if category is already created with the categoryName
  const alreadyCategory = await Category.findOne({
    name: name.toLowerCase(),
    userId: req.user._id,
  });

  if (alreadyCategory) {
    throw new ApiError(400, `${name} category already exist`);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const { color, isDark } = getRandomColorObject();
  try {
    // create category
    const rawCategory = await Category.create(
      [
        {
          name,
          categoryBudget,
          userId: req.user._id,
          color,
          isDark,
          month,
          year,
        },
      ],
      { session }
    );

    const category = await rawCategory[0];

    // Explicitly checking if the category was created successfully
    if (!category) {
      throw new ApiError(500, "Something went wrong while creating category.");
    }

    await Report.create(
      [
        {
          categoryId: category._id,
          month,
          year,
          userId: req.user._id,
        },
      ],
      { session }
    );

    // committing the transaction
    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(new ApiResponse(201, category, "category successfully created"));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, "Failed to create category. Please try again.");
  }
});

const fetchUserCategory = asyncHandler(async (req, res) => {
  const { month, year } = getCurrentMonthAndYear();
  const query = {
    userId: req.user._id,
    month,
    year,
  };
  const categories = await Category.find(query);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        categories,
        categories.length
          ? "Categories fetched successfully!"
          : "Please create categories first"
      )
    );
});

export { createCategory, fetchUserCategory };
