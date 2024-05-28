import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Group } from "../models/group.models.js";
import { GroupMember } from "../models/groupMember.models.js";
import { ApiError } from "../utils/apiError.js";
import {
  checkIfAllMandatoryFieldsExist,
  groupModelKey,
} from "../helpers/validators.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const checkIfGroupExist = async (groupId) => {
  const groupInfo = await Group.findById(groupId);
  return groupInfo ? groupInfo : false;
};

const createGroup = asyncHandler(async (req, res) => {
  const vadilator = checkIfAllMandatoryFieldsExist(groupModelKey, req.body);
  if (vadilator.length > 0) {
    throw new ApiError(
      400,
      vadilator.join(",") +
        `${vadilator.length === 1 ? " is" : " are"} missing. Please fill all the mandatory fields`
    );
  }
  const { name, members } = req.body;

  // checking if members is an array
  if (!Array.isArray(members)) {
    throw new ApiError(400, `Please pass members of group as an Array`);
  }
  // start transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // creating group
    const group = await Group.create(
      [
        {
          name,
          createdBy: req.user._id,
        },
      ],
      { session }
    );

    const groupMembers = members.map((memberId) => ({
      groupId: group[0]._id,
      userId: memberId,
      role:
        memberId.toString() === req.user._id.toString() ? "admin" : "member",
    }));

    await GroupMember.create(groupMembers, { session });

    // committing the transaction
    await session.commitTransaction();
    session.endSession();
    res
      .status(201)
      .json(new ApiResponse(200, group, "Group created successfully"));
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, "Failed to create group. Please try again.");
  }
});

const getAllGroups = asyncHandler(async (req, res) => {
  // aggregation query for fetching groups and its members
  const groups = await Group.aggregate([
    {
      $match: {
        createdBy: req.user._id,
      },
    },
  ]);

  return res
    .status(groups.length ? 200 : 204)
    .json(
      new ApiResponse(
        groups.length ? 200 : 204,
        groups,
        "Group details fetched successfully"
      )
    );
});

const getGroupDetails = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  if (!groupId) {
    throw new ApiError(400, "please provide groupId to fetch details.");
  }
  // check if group Exist
  const group = checkIfGroupExist(groupId);
  if (!group) {
    throw new ApiError(400, `No such group is present for groupId: ${groupId}`);
  }

  // aggregation query for fetching groups and its members
  const groupWithMembers = await Group.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(groupId),
      },
    },
    {
      $lookup: {
        from: "groupmembers",
        localField: "_id",
        foreignField: "groupId",
        as: "members",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          {
            $addFields: {
              userDetails: {
                $arrayElemAt: ["$userDetails", 0],
              },
            },
          },
        ],
      },
    },

    {
      $project: {
        _id: 1,
        name: 1,
        "members._id": 1,
        "members.role": 1,
        "members.userDetails._id": 1,
        "members.userDetails.username": 1,
        "members.userDetails.email": 1,
        "members.userDetails.firstName": 1,
        "members.userDetails.lastName": 1,
        "members.userDetails.avatar": 1,
        // Add any other fields you need from the user details
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        groupWithMembers[0],
        "Group details fetched successfully"
      )
    );
});

const deleteMember = asyncHandler(async (req, res) => {
  const { groupMemberId } = req.body;
  if (!groupMemberId) {
    throw new ApiError(400, "please pass groupMember id");
  }

  // check if this groupMember exists
  const groupMember = await GroupMember.findById(groupMemberId);
  if (!groupMember) {
    throw new ApiError(404, "Group member not found or already deleted");
  }

  await GroupMember.findByIdAndDelete(groupMemberId);

  res
    .status(204)
    .json(new ApiResponse(204, {}, "Group member removed successfully"));
});

const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  if (!groupId) {
    throw new ApiError(400, "Please provide groupId to delete the group");
  }
  // find the group using that groupId
  const groupInfo = await Group.findById(groupId);
  if (!groupInfo) {
    throw new ApiError(400, "group is not found or already deleted");
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const groupWithMembers = await Group.aggregate([
      {
        $match: {
          _id: groupId,
        },
      },
      {
        $lookup: {
          from: "groupmembers",
          localField: "_id",
          foreignField: "groupId",
          as: "members",
        },
      },
    ]).session(session);

    const members = groupWithMembers[0]?.members || [];

    //checking if the delete is triggered by admin or not
    const isAdmin = members.some((member) => {
      return (
        member.userId.toString() === req.user._id.toString() &&
        member.role === "admin"
      );
    });

    if (!isAdmin) {
      throw new ApiError(403, "Only admin can delete the group");
    }

    // delete groupMembers
    await GroupMember.deleteMany({ groupId }).session(session);

    //delete group
    await Group.findByIdAndDelete(groupId).session(session);

    await session.commitTransaction();
    session.endSession();

    res
      .status(204)
      .json(new ApiResponse(204, {}, "Group deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to delete group. please try again!");
  }
});

const editProfilePicture = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  if (!groupId) {
    throw new ApiError(400, "groupId is missing");
  }
  if (req.file && !req.file.path) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // checking if a group exist or not
  const group = await checkIfGroupExist(groupId);
  if (!group) {
    throw new ApiError(
      400,
      `No such group is present with groupId : ${groupId}`
    );
  }

  //uploading on cloudinary
  let avatarCloudinaryPath = "";
  if (req.file && req.file.path) {
    const avatarLocalPath = req.file.path;
    const uploadResult = await uploadOnCloudinary(avatarLocalPath);
    avatarCloudinaryPath = uploadResult?.url || "";
  }

  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    {
      $set: {
        avatar: avatarCloudinaryPath,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "profile picture is updated"));
});

const editProfileInfo = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const { groupId } = req.params;
  if (!groupId) {
    throw new ApiError(400, "groupId is missing");
  }
  if (!name) {
    throw new ApiError(400, "Please give data to update");
  }

  // checking if a group exist or not
  const group = await checkIfGroupExist(groupId);
  if (!group) {
    throw new ApiError(
      400,
      `No such group is present with groupId : ${groupId}`
    );
  } else if (group?.name === name.toLowerCase()) {
    throw new ApiError(400, `Group name can't be similar to previous name`);
  }

  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    {
      $set: {
        name,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "group info is updated"));
});

export {
  createGroup,
  deleteMember,
  deleteGroup,
  editProfilePicture,
  getGroupDetails,
  getAllGroups,
  editProfileInfo,
};
