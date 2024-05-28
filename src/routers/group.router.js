import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createGroup,
  deleteGroup,
  deleteMember,
  editProfilePicture,
  getGroupDetails,
  getAllGroups,
  editProfileInfo,
} from "../controllers/group.controller.js";

const groupRoutes = Router();

groupRoutes.route("/create-group").post(verifyJWT, createGroup);
groupRoutes
  .route("/delete-member/:groupMemberId")
  .post(verifyJWT, deleteMember);

groupRoutes.route("/delete-group/:groupId").post(verifyJWT, deleteGroup);

groupRoutes
  .route("/edit-profile/profile-picture/:groupId")
  .patch(verifyJWT, editProfilePicture);

groupRoutes
  .route("/edit-profile/group-info/:groupId")
  .patch(verifyJWT, editProfileInfo);
groupRoutes.route("/all").get(verifyJWT, getAllGroups);
groupRoutes.route("/details/:groupId").get(verifyJWT, getGroupDetails);
export default groupRoutes;
