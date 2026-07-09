'use client';

import { IntegrationManagerTemplate } from '@/components/admin/integracoes/IntegrationManagerTemplate';
import { IntegrationCategory } from '@/types/integrations';

const fiscalCategory: IntegrationCategory = {
  id: 'fiscal',
  name: 'Emissão Fiscal',
  description: 'Provedores de emissão de NF-e, NFS-e, NFC-e e MDF-e.',
  providers: [
    {
      id: 'focusnfe',
      name: 'Focus NFe',
      description: 'API Simples para emissão de Notas Fiscais.',
      status: 'ACTIVE',
      healthStatus: 'ONLINE',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'token', label: 'Token de Produção', type: 'password', required: true },
        { name: 'tokenHomologacao', label: 'Token de Homologação', type: 'password' },
        { name: 'ambiente', label: 'Ambiente', type: 'text', placeholder: 'producao ou homologacao' }
      ]
    },
    {
      id: 'enotas',
      name: 'eNotas',
      description: 'Automação fiscal para diversos municípios.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true }
      ]
    },
    {
      id: 'webmania',
      name: 'WebmaniaBR',
      description: 'Emissor de NFe e NFCe.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'consumerKey', label: 'Consumer Key', type: 'text', required: true },
        { name: 'consumerSecret', label: 'Consumer Secret', type: 'password', required: true },
        { name: 'accessToken', label: 'Access Token', type: 'password', required: true },
        { name: 'accessTokenSecret', label: 'Access Token Secret', type: 'password', required: true }
      ]
    }
  ]
};

export default function FiscalPage() {
  return (
    <div className="p-6">
      <IntegrationManagerTemplate category={fiscalCategory} />
    </div>
  );
}
