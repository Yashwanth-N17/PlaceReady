import dotenv from "dotenv";
dotenv.config();

const requiredEnv = ["DATABASE_URL", "JWT_SECRET", "REFRESH_TOKEN_SECRET"];
requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`${env} is not defined in the Environment Variables`);
  }
});

const config = {
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
};

export default config;
