import { registerAs } from "@nestjs/config";

export default registerAs("database", () => ({
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  user: process.env.DATABASE_USER || "imperio",
  password: process.env.DATABASE_PASSWORD || "secret",
  name: process.env.DATABASE_NAME || "imperio_erp",
  poolMin: parseInt(process.env.DATABASE_POOL_MIN, 10) || 2,
  poolMax: parseInt(process.env.DATABASE_POOL_MAX, 10) || 20,
}));
