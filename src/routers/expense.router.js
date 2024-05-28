import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addExpense,
  getCategoryExpense,
  getExpense,
} from "../controllers/expense.controller.js";

const expenseRoutes = Router();

expenseRoutes.route("/add-expense").post(verifyJWT, addExpense);
expenseRoutes.route("/get-expenses").get(verifyJWT, getExpense);
expenseRoutes
  .route("/get-category-expenses")
  .get(verifyJWT, getCategoryExpense);
export default expenseRoutes;
