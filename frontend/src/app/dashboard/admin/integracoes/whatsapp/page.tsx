'use client';

import { IntegrationManagerTemplate } from '@/components/admin/integracoes/IntegrationManagerTemplate';
import { IntegrationCategory } from '@/types/integrations';

const whatsappCategory: IntegrationCategory = {
  id: 'whatsapp',
  name: 'WhatsApp API',
  description: 'Envio de mensagens automáticas, cobranças e atendimento.',
  providers: [
    {
      id: 'z-api',
      name: 'Z-API',
      description: 'API não oficial via QR Code.',
      status: 'ACTIVE',
      healthStatus: 'ONLINE',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'instanceId', label: 'ID da Instância', type: 'text', required: true },
        { name: 'token', label: 'Token da Instância', type: 'password', required: true },
        { name: 'clientToken', label: 'Client Token (Segurança)', type: 'password', required: true }
      ]
    },
    {
      id: 'evolutionapi',
      name: 'Evolution API',
      description: 'Solução Open Source para instâncias de WhatsApp.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'apiUrl', label: 'URL da API', type: 'url', required: true },
        { name: 'apiKey', label: 'API Key Global', type: 'password', required: true },
        { name: 'instanceName', label: 'Nome da Instância', type: 'text', required: true }
      ]
    },
    {
      id: 'waba',
      name: 'WhatsApp Cloud API (Oficial)',
      description: 'API Oficial da Meta.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
        { name: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
        { name: 'businessAccountId', label: 'Business Account ID', type: 'text', required: true }
      ]
    }
  ]
};

export default function WhatsappPage() {
  return (
    <div className="p-6">
      <IntegrationManagerTemplate category={whatsappCategory} />
    </div>
  );
}
