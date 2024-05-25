import mongoose, { Schema } from "mongoose";

const budgetSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Budget = mongoose.model("Budget", budgetSchema);
