import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.APP_PORT, 10) || 4000,
  url: process.env.APP_URL || "http://localhost:4000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  name: process.env.APP_NAME || "Imperio ERP",
  version: process.env.APP_VERSION || "0.1.0",
  apiPrefix: process.env.API_PREFIX || "api/v1",
  swaggerEnabled: process.env.SWAGGER_ENABLED === "true",
  swaggerPath: process.env.SWAGGER_PATH || "docs",
  corsOrigins: process.env.CORS_ORIGINS || "http://localhost:3000",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  throttleTtl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  logLevel: process.env.LOG_LEVEL || "info",
  logDir: process.env.LOG_DIR || "./logs",
}));
