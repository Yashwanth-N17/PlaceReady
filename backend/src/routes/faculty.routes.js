import express from "express";
import { extractTestMetadata } from "../controllers/faculty.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/extract-metadata", 
  authenticate, 
  authorize("FACULTY"), 
  upload.single("file"), 
  extractTestMetadata
);

export default router;
