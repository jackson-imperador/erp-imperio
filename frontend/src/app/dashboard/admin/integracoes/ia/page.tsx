'use client';

import { IntegrationManagerTemplate } from '@/components/admin/integracoes/IntegrationManagerTemplate';
import { IntegrationCategory } from '@/types/integrations';

const iaCategory: IntegrationCategory = {
  id: 'ia',
  name: 'Inteligência Artificial',
  description: 'Modelos de linguagem para automação, suporte e análise.',
  providers: [
    {
      id: 'openai',
      name: 'OpenAI (ChatGPT)',
      description: 'Modelos GPT-4 e GPT-3.5.',
      status: 'ACTIVE',
      healthStatus: 'ONLINE',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true },
        { name: 'organizationId', label: 'Organization ID', type: 'text' }
      ]
    },
    {
      id: 'anthropic',
      name: 'Anthropic (Claude)',
      description: 'Modelos Claude 3 Opus, Sonnet e Haiku.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'apiKey', label: 'API Key', type: 'password', required: true }
      ]
    },
    {
      id: 'google-vertex',
      name: 'Google Vertex AI (Gemini)',
      description: 'Modelos Gemini via Google Cloud.',
      status: 'INACTIVE',
      healthStatus: 'UNKNOWN',
      circuitBreakerStatus: 'CLOSED',
      fields: [
        { name: 'projectId', label: 'Project ID', type: 'text', required: true },
        { name: 'location', label: 'Location (Region)', type: 'text', required: true },
        { name: 'serviceAccountKey', label: 'Service Account JSON Key', type: 'password', required: true }
      ]
    }
  ]
};

export default function IAPage() {
  return (
    <div className="p-6">
      <IntegrationManagerTemplate category={iaCategory} />
    </div>
  );
}
