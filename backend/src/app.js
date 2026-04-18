import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { connectToDB } from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";


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

export default app;