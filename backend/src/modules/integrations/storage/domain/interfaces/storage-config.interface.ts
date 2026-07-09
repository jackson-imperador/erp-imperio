export interface StorageConfig {
  provider: 's3' | 'r2' | 'minio';
  endpoint?: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  forcePathStyle?: boolean;
}
