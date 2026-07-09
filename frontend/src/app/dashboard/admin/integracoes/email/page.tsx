'use client';

import { IntegrationManagerTemplate } from '@/components/admin/integracoes/IntegrationManagerTemplate';
import { IntegrationCategory } from '@/types/integrations';

const emailCategory: IntegrationCategory = {
  id: 'email',
  name: 'Email Transacional e Marketing',
  description: 'Envio de faturas, alertas e campanhas.',
  providers: [
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'API confiável para e-mails transacionais.',
      status: 'ACTIVE',
      healthStatus: 'ONLINE',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'fromEmail', label: 'Email de Envio Padrão', type: 'text', required: true },
        { name: 'fromName', label: 'Nome de Envio Padrão', type: 'text', required: true }
      ]
    },
    {
      id: 'amazon-ses',
      name: 'Amazon SES',
      description: 'Serviço de e-mail da AWS, alto volume.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
        { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
        { name: 'region', label: 'AWS Region', type: 'text', required: true },
        { name: 'fromEmail', label: 'Email Verificado', type: 'text', required: true }
      ]
    },
    {
      id: 'smtp',
      name: 'SMTP Customizado',
      description: 'Conexão via SMTP padrão.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'host', label: 'Host', type: 'text', required: true },
        { name: 'port', label: 'Port', type: 'number', required: true },
        { name: 'user', label: 'Usuário', type: 'text', required: true },
        { name: 'password', label: 'Senha', type: 'password', required: true },
        { name: 'secure', label: 'Usar SSL/TLS (true/false)', type: 'text', required: true }
      ]
    }
  ]
};

export default function EmailPage() {
  return (
    <div className="p-6">
      <IntegrationManagerTemplate category={emailCategory} />
    </div>
  );
}
