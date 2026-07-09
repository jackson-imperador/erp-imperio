'use client';

import { IntegrationManagerTemplate } from '@/components/admin/integracoes/IntegrationManagerTemplate';
import { IntegrationCategory } from '@/types/integrations';

const smsCategory: IntegrationCategory = {
  id: 'sms',
  name: 'SMS e Mensagens de Texto',
  description: 'Envio de 2FA, alertas e lembretes por SMS.',
  providers: [
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'API global de comunicação via SMS.',
      status: 'ACTIVE',
      healthStatus: 'ONLINE',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'accountSid', label: 'Account SID', type: 'text', required: true },
        { name: 'authToken', label: 'Auth Token', type: 'password', required: true },
        { name: 'fromNumber', label: 'Número de Origem', type: 'text', required: true }
      ]
    },
    {
      id: 'zenvia',
      name: 'Zenvia',
      description: 'Solução brasileira para envio de SMS.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'apiToken', label: 'API Token', type: 'password', required: true }
      ]
    },
    {
      id: 'aws-sns',
      name: 'Amazon SNS',
      description: 'Envio de SMS via infraestrutura AWS.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
        { name: 'region', label: 'AWS Region', type: 'text', required: true }
      ]
    }
  ]
};

export default function SmsPage() {
  return (
    <div className="p-6">
      <IntegrationManagerTemplate category={smsCategory} />
    </div>
  );
}
