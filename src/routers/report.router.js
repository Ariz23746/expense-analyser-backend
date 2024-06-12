import { Router } from "express";
import { getReports } from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const reportRoutes = Router();

reportRoutes.route("/get-reports").get(verifyJWT, getReports);

export default reportRoutes;
