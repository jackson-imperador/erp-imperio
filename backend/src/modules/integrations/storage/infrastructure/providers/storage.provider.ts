import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STORAGE_PROVIDER } from '../../domain/interfaces/storage-provider.interface';
import { StorageConfig } from '../../domain/interfaces/storage-config.interface';
import { S3StorageAdapter } from '../adapters/s3-storage.adapter';

export const storageProvider: Provider = {
  provide: STORAGE_PROVIDER,
  useFactory: (configService: ConfigService) => {
    const provider = configService.get<string>('STORAGE_PROVIDER_TYPE', 's3');
    
    // Default configs to S3, but allow overrides for R2 or MinIO
    const config: StorageConfig = {
      provider: provider as any,
      region: configService.get<string>('STORAGE_REGION', 'us-east-1'),
      accessKeyId: configService.get<string>('STORAGE_ACCESS_KEY', ''),
      secretAccessKey: configService.get<string>('STORAGE_SECRET_KEY', ''),
      bucket: configService.get<string>('STORAGE_BUCKET', ''),
    };

    if (provider === 'r2') {
      const accountId = configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
      config.endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
      config.region = 'auto'; // R2 uses 'auto' for region
    } else if (provider === 'minio') {
      config.endpoint = configService.get<string>('MINIO_ENDPOINT');
      config.forcePathStyle = true; // Required for MinIO
    } else {
      // S3 custom endpoint if any (e.g. for testing)
      const endpoint = configService.get<string>('STORAGE_ENDPOINT');
      if (endpoint) {
        config.endpoint = endpoint;
      }
    }

    return new S3StorageAdapter(config);
  },
  inject: [ConfigService],
};
