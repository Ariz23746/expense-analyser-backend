import mongoose from "mongoose";
import { categoryModelKey } from "../constants.js";
import { checkIfAllMandatoryFieldsExist } from "../helpers/validators.js";
import { Category } from "../models/category.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Report } from "../models/report.models.js";
import { getCurrentMonthAndYear } from "../utils/dateUtils.js";

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

  try {
    // create category
    const rawCategory = await Category.create(
      [
        {
          name,
          categoryBudget,
          userId: req.user._id,
        },
      ],
      { session }
    );

    const category = await rawCategory[0];

    // Explicitly checking if the category was created successfully
    if (!category) {
      throw new ApiError(500, "Something went wrong while creating category.");
    }

    const { month, year } = getCurrentMonthAndYear();
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
    console.log("err", err);
    throw new ApiError(500, "Failed to create category. Please try again.");
  }
});

export { createCategory };
