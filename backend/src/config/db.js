import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import config from "./config.js";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.databaseUrl,
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],
});

export const connectToDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed", error);
  }
};