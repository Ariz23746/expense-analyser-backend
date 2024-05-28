import mongoose, { Schema } from "mongoose";
const categorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    categoryBudget: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
