import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: false,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    totalAmountSpent: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
