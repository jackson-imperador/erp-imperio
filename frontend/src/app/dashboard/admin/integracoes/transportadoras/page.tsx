'use client';

import { IntegrationManagerTemplate } from '@/components/admin/integracoes/IntegrationManagerTemplate';
import { IntegrationCategory } from '@/types/integrations';

const transportadorasCategory: IntegrationCategory = {
  id: 'transportadoras',
  name: 'Correios e Transportadoras',
  description: 'Cotação de frete, geração de etiquetas e rastreio.',
  providers: [
    {
      id: 'melhorenvio',
      name: 'Melhor Envio',
      description: 'Hub de cotação e geração de etiquetas.',
      status: 'ACTIVE',
      healthStatus: 'ONLINE',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'token', label: 'Token', type: 'password', required: true }
      ]
    },
    {
      id: 'correios',
      name: 'Correios SIGEP',
      description: 'Integração direta com contratos Correios.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'usuario', label: 'Usuário', type: 'text', required: true },
        { name: 'senha', label: 'Senha', type: 'password', required: true },
        { name: 'cartaoPostagem', label: 'Cartão de Postagem', type: 'text', required: true },
        { name: 'codigoAdministrativo', label: 'Código Administrativo', type: 'text', required: true }
      ]
    },
    {
      id: 'jadlog',
      name: 'Jadlog',
      description: 'API Jadlog para cotação e emissão.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'token', label: 'Token de Acesso', type: 'password', required: true }
      ]
    }
  ]
};

export default function TransportadorasPage() {
  return (
    <div className="p-6">
      <IntegrationManagerTemplate category={transportadorasCategory} />
    </div>
  );
}
