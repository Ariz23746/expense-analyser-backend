import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createBudget,
  getBudgets,
  getCurrentBudget,
} from "../controllers/budget.controller.js";

const budgetRoutes = Router();
budgetRoutes.route("/create-budget").post(verifyJWT, createBudget);
budgetRoutes.route("/get-budgets").get(verifyJWT, getBudgets);
budgetRoutes.route("/current-budget").get(verifyJWT, getCurrentBudget);
export default budgetRoutes;
