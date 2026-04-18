import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.post("/logout", authController.logout);
authRouter.get("/refresh", authController.refreshToken);
authRouter.post("/reset-password", authController.resetPassword);

authRouter.use(authenticate);
authRouter.get("/me", authController.getMe);

export default authRouter;
