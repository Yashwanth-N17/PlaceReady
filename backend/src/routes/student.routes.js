import express from "express";
import { getDashboardStats, refreshReadiness } from "../controllers/student.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", authenticate, authorize("STUDENT"), getDashboardStats);
router.post("/refresh-readiness", authenticate, authorize("STUDENT"), refreshReadiness);

export default router;
