import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createCategory } from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.route("/create").post(verifyJWT, createCategory);

export default categoryRouter;
