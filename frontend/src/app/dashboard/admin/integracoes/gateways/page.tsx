'use client';

import { IntegrationManagerTemplate } from '@/components/admin/integracoes/IntegrationManagerTemplate';
import { IntegrationCategory } from '@/types/integrations';

const gatewaysCategory: IntegrationCategory = {
  id: 'gateways',
  name: 'Gateways de Pagamento',
  description: 'Provedores de pagamento com cartão de crédito, PIX e outras modalidades.',
  providers: [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Cartão de Crédito e Assinaturas.',
      status: 'ACTIVE',
      healthStatus: 'ONLINE',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'publicKey', label: 'Public Key', type: 'text', required: true },
        { name: 'secretKey', label: 'Secret Key', type: 'password', required: true },
        { name: 'webhookSecret', label: 'Webhook Secret', type: 'password' }
      ]
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      description: 'Checkout Transparente, PIX, Cartão.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'publicKey', label: 'Public Key', type: 'text', required: true },
        { name: 'accessToken', label: 'Access Token', type: 'password', required: true }
      ]
    },
    {
      id: 'pagarme',
      name: 'Pagar.me',
      description: 'Solução completa de pagamentos e split.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'encryptionKey', label: 'Encryption Key', type: 'text' }
      ]
    }
  ]
};

export default function GatewaysPage() {
  return (
    <div className="p-6">
      <IntegrationManagerTemplate category={gatewaysCategory} />
    </div>
  );
}
