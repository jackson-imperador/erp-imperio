export type FiscalDocumentType = 'NFE' | 'NFCE' | 'NFSE' | 'CTE' | 'MDFE';

export type FiscalDocumentStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'INUTILIZED'
  | 'CONTINGENCY'
  | 'PROCESSING';

export interface FiscalDocument {
  id: string;
  companyId: string;
  type: FiscalDocumentType;
  status: FiscalDocumentStatus;
  series: string;
  number: number;
  accessKey?: string;
  protocol?: string;
  issueDate: string;
  authorizationDate?: string;
  totalAmount: number;
  taxAmount: number;
  customerName?: string;
  customerDocument?: string;
  cancellationReason?: string;
  xmlUrl?: string;
  danfeUrl?: string;
  environment: 'HOMOLOGATION' | 'PRODUCTION';
  relatedOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FiscalDashboardMetrics {
  totalAuthorized: number;
  totalRejected: number;
  totalCancelled: number;
  totalTaxes: number;
  documentsByType: { type: FiscalDocumentType; count: number }[];
}

export interface FiscalFilters {
  type?: FiscalDocumentType;
  status?: FiscalDocumentStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface DigitalCertificate {
  id: string;
  companyId: string;
  subjectName: string;
  issuerName: string;
  validFrom: string;
  validTo: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  thumbprint: string;
  createdAt: string;
}

export interface SpedReport {
  id: string;
  companyId: string;
  type: 'FISCAL' | 'CONTRIBUICOES';
  period: string; // YYYY-MM
  status: 'GENERATING' | 'READY' | 'ERROR';
  fileUrl?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface FiscalEvent {
  id: string;
  documentId: string;
  eventType: string; // 'AUTHORIZATION', 'CANCELLATION', 'CCE', etc.
  description: string;
  sequence: number;
  protocol?: string;
  xmlUrl?: string;
  createdAt: string;
}

export interface SefazLot {
  id: string;
  companyId: string;
  lotNumber: string;
  status: 'PROCESSING' | 'PROCESSED' | 'ERROR';
  receipt?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}
