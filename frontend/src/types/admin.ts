export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  lastCallAt?: string;
  lastStatus?: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptime: number; // in seconds
  database: 'OK' | 'ERROR';
  cache: 'OK' | 'ERROR';
  storage: 'OK' | 'ERROR';
  version: string;
  lastCheck: string;
}

export interface LicenseInfo {
  id: string;
  planName: string;
  features: string[];
  maxUsers: number;
  currentUsers: number;
  validUntil: string;
  status: 'ACTIVE' | 'EXPIRED' | 'TRIAL';
  isWhiteLabel: boolean;
}

export interface AdminDashboardMetrics {
  activeUsers: number;
  totalApiRequests: number;
  failedWebhooks: number;
  storageUsedBytes: number;
  health: SystemHealth;
  license: LicenseInfo;
}

export interface AdminFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  module?: string;
}
