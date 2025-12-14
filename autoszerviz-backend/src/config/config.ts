import dotenv from "dotenv";
dotenv.config();

const config = {
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "autoszerviz",
    port: Number(process.env.DB_PORT) || 3306
  },
  jwtSecret: process.env.JWT_SECRET || "secret"
};

export default config;
