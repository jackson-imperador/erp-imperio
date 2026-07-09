import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { IStorageProvider } from '../../domain/interfaces/storage-provider.interface';
import { StorageConfig } from '../../domain/interfaces/storage-config.interface';

@Injectable()
export class S3StorageAdapter implements IStorageProvider {
  private readonly client: S3Client;
  private readonly logger = new Logger(S3StorageAdapter.name);

  constructor(private readonly config: StorageConfig) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: config.forcePathStyle, // Required for MinIO
    });
  }

  async uploadFile(filename: string, mimetype: string, buffer: Buffer): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: filename,
        Body: buffer,
        ContentType: mimetype,
      });

      await this.client.send(command);
      this.logger.debug(`File ${filename} uploaded successfully to bucket ${this.config.bucket}`);
      
      return filename;
    } catch (error) {
      this.logger.error(`Error uploading file ${filename}: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: filename,
      });

      await this.client.send(command);
      this.logger.debug(`File ${filename} deleted successfully from bucket ${this.config.bucket}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${filename}: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }

  async getFileUrl(filename: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: filename,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error(`Error generating signed URL for ${filename}: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
