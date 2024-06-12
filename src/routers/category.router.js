import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createCategory,
  fetchUserCategory,
} from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.route("/create").post(verifyJWT, createCategory);
categoryRouter.route("/get-categories").get(verifyJWT, fetchUserCategory);

export default categoryRouter;
