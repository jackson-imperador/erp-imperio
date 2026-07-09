'use client';

import { IntegrationManagerTemplate } from '@/components/admin/integracoes/IntegrationManagerTemplate';
import { IntegrationCategory } from '@/types/integrations';

const storageCategory: IntegrationCategory = {
  id: 'storage',
  name: 'Armazenamento em Nuvem',
  description: 'Provedores de Object Storage (S3, GCS, Blob).',
  providers: [
    {
      id: 'aws-s3',
      name: 'Amazon S3',
      description: 'Armazenamento de arquivos padrão do mercado.',
      status: 'ACTIVE',
      healthStatus: 'ONLINE',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'bucketName', label: 'Bucket Name', type: 'text', required: true },
        { name: 'region', label: 'Region', type: 'text', required: true },
        { name: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true }
      ]
    },
    {
      id: 'google-cloud-storage',
      name: 'Google Cloud Storage',
      description: 'Armazenamento na infraestrutura do Google.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'bucketName', label: 'Bucket Name', type: 'text', required: true },
        { name: 'projectId', label: 'Project ID', type: 'text', required: true },
        { name: 'clientEmail', label: 'Client Email', type: 'text', required: true },
        { name: 'privateKey', label: 'Private Key', type: 'password', required: true }
      ]
    },
    {
      id: 'minio',
      name: 'MinIO (S3 Compatible)',
      description: 'Servidor S3 self-hosted ou compatíveis (Cloudflare R2, DigitalOcean Spaces).',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'endpoint', label: 'Endpoint (URL)', type: 'url', required: true },
        { name: 'bucketName', label: 'Bucket Name', type: 'text', required: true },
        { name: 'accessKey', label: 'Access Key', type: 'text', required: true },
        { name: 'secretKey', label: 'Secret Key', type: 'password', required: true }
      ]
    }
  ]
};

export default function StoragePage() {
  return (
    <div className="p-6">
      <IntegrationManagerTemplate category={storageCategory} />
    </div>
  );
}
