export interface IntegrationField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'url' | 'boolean' | 'select';
  options?: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
}

export interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  logoUrl?: string; // or icon component name
  status: 'ACTIVE' | 'INACTIVE' | 'CONFIGURING';
  healthStatus: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'UNKNOWN';
  circuitBreakerStatus: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  fields: IntegrationField[];
}

export interface IntegrationCategory {
  id: string;
  name: string;
  description: string;
  providers: IntegrationProvider[];
}

export interface IntegrationConfig {
  id: string;
  providerId: string;
  isActive: boolean;
  credentials: Record<string, any>;
  webhooks?: {
    url: string;
    secret?: string;
    activeEvents: string[];
  };
  resilience?: {
    rateLimitRequests: number;
    rateLimitWindowS: number;
    retryCount: number;
    timeoutMs: number;
    circuitBreakerErrorThreshold: number;
  };
}
