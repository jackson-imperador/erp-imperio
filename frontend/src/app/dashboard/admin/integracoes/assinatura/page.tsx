'use client';

import { IntegrationManagerTemplate } from '@/components/admin/integracoes/IntegrationManagerTemplate';
import { IntegrationCategory } from '@/types/integrations';

const assinaturaCategory: IntegrationCategory = {
  id: 'assinatura',
  name: 'Assinatura Eletrônica e Digital',
  description: 'Contratos, propostas e termos com validade jurídica.',
  providers: [
    {
      id: 'docusign',
      name: 'DocuSign',
      description: 'Líder global em assinaturas eletrônicas.',
      status: 'ACTIVE',
      healthStatus: 'ONLINE',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'integrationKey', label: 'Integration Key', type: 'text', required: true },
        { name: 'secretKey', label: 'Secret Key', type: 'password', required: true },
        { name: 'rsaPrivateKey', label: 'RSA Private Key', type: 'password', required: true }
      ]
    },
    {
      id: 'clicksign',
      name: 'Clicksign',
      description: 'Plataforma brasileira de assinaturas.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'accessToken', label: 'Access Token', type: 'password', required: true }
      ]
    },
    {
      id: 'zapsign',
      name: 'ZapSign',
      description: 'Assinatura simplificada via WhatsApp e Email.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'apiToken', label: 'API Token', type: 'password', required: true }
      ]
    }
  ]
};

export default function AssinaturaPage() {
  return (
    <div className="p-6">
      <IntegrationManagerTemplate category={assinaturaCategory} />
    </div>
  );
}
