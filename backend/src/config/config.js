import dotenv from "dotenv";
dotenv.config();

if(!process.env.DATABASE_URL){
  throw new Error("Database URL is not defined in the Environment Variables");
}

if(!process.env.JWT_SECRET){
  throw new Error("JWT Secret is not defined in the Environment Variables");
}


const config = {
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
}

export default config;
