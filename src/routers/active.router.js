import { Router } from "express";
import { checkForActivity } from "../controllers/active.controller.js";

const activeRoute = Router();
activeRoute.route("/").get(checkForActivity);
export default activeRoute;
