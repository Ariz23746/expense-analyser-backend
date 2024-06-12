import mongoose, { Schema } from "mongoose";
const expenseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    name: {
      type: String,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Number,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Expense = mongoose.model("Expense", expenseSchema);
