import { registerAs } from "@nestjs/config";

export default registerAs("queue", () => ({
  redis: {
    host: process.env.QUEUE_REDIS_HOST || "localhost",
    port: parseInt(process.env.QUEUE_REDIS_PORT, 10) || 6379,
    password: process.env.QUEUE_REDIS_PASSWORD || undefined,
  },
}));
