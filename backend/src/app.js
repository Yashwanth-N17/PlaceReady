import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
connectToDB();

app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    callback(null, origin || true);
  },
  credentials: true,
}));
app.use(cookieParser());

app.use("/api/auth", authRoutes);

export default app;