import { registerAs } from "@nestjs/config";

export default registerAs("storage", () => ({
  provider: process.env.STORAGE_PROVIDER || "minio",
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT, 10) || 9000,
    useSsl: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    bucket: process.env.MINIO_BUCKET_NAME || "imperio-erp",
  },
}));
