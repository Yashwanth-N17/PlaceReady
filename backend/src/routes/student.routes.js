import express from "express";
import { getMe, getDashboard, getTraining } from "../controllers/student.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/me", authenticate, authorize("STUDENT"), getMe);
router.get("/dashboard", authenticate, authorize("STUDENT"), getDashboard);
router.get("/training", authenticate, authorize("STUDENT"), getTraining);

export default router;
