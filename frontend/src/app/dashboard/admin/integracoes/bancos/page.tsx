'use client';

import { IntegrationManagerTemplate } from '@/components/admin/integracoes/IntegrationManagerTemplate';
import { IntegrationCategory } from '@/types/integrations';

const bancosCategory: IntegrationCategory = {
  id: 'bancos',
  name: 'Bancos e Baixa de Boletos',
  description: 'Integrações bancárias (CNAB, APIs) para emissão e conciliação de boletos.',
  providers: [
    {
      id: 'bb',
      name: 'Banco do Brasil',
      description: 'API oficial para emissão e PIX.',
      status: 'ACTIVE',
      healthStatus: 'ONLINE',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'developerApplicationKey', label: 'Developer Application Key', type: 'text', required: true }
      ]
    },
    {
      id: 'itau',
      name: 'Banco Itaú',
      description: 'Integração via API Itaú para boletos.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'certificadoCrt', label: 'Certificado CRT', type: 'password' },
        { name: 'certificadoKey', label: 'Chave do Certificado', type: 'password' }
      ]
    },
    {
      id: 'inter',
      name: 'Banco Inter',
      description: 'Conta Digital PJ - Boletos e PIX.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'clientId', label: 'Client ID', type: 'text', required: true },
        { name: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
        { name: 'certificadoCrt', label: 'Certificado CRT', type: 'password' },
        { name: 'certificadoKey', label: 'Chave do Certificado', type: 'password' }
      ]
    }
  ]
};

export default function BancosPage() {
  return (
    <div className="p-6">
      <IntegrationManagerTemplate category={bancosCategory} />
    </div>
  );
}
