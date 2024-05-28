import mongoose, { Schema } from "mongoose";

const groupMemberSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    role: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const GroupMember = mongoose.model("GroupMember", groupMemberSchema);
