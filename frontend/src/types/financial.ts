export type FinancialTransactionType = 'RECEIVABLE' | 'PAYABLE';

export type FinancialTransactionStatus =
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'PIX'
  | 'BOLETO'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'OTHER';

export interface FinancialTransaction {
  id: string;
  companyId: string;
  type: FinancialTransactionType;
  status: FinancialTransactionStatus;
  referenceNumber: string;
  description: string;
  amount: number;
  originalAmount: number;
  paidAmount: number;
  discountAmount: number;
  interestAmount: number;
  penaltyAmount: number;
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  accountId?: string;
  categoryId?: string;
  costCenterId?: string;
  customerId?: string;
  supplierId?: string;
  orderId?: string;
  invoiceId?: string;
  installments?: number;
  currentInstallment?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialFilters {
  type?: FinancialTransactionType;
  status?: FinancialTransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  paymentDateFrom?: string;
  paymentDateTo?: string;
  customerId?: string;
  supplierId?: string;
  search?: string;
}

export interface DashboardMetrics {
  totalReceivables: number;
  totalPayables: number;
  overdueReceivables: number;
  overduePayables: number;
  balance: number;
  cashFlowSeries: {
    date: string;
    inflow: number;
    outflow: number;
    balance: number;
  }[];
}

export interface PixCharge {
  id: string;
  transactionId: string;
  txid: string;
  amount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  qrCode: string;
  qrCodeText: string;
  expiresAt: string;
  createdAt: string;
}

export interface Boleto {
  id: string;
  transactionId: string;
  barcode: string;
  digitableLine: string;
  url: string;
  status: 'REGISTERED' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  dueDate: string;
  amount: number;
  createdAt: string;
}

export interface BankStatement {
  id: string;
  accountId: string;
  date: string;
  description: string;
  documentNumber: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  reconciled: boolean;
  transactionId?: string;
}

export interface CreateTransactionDto {
  type: FinancialTransactionType;
  description: string;
  amount: number;
  dueDate: string;
  issueDate?: string;
  paymentMethod?: PaymentMethod;
  accountId?: string;
  categoryId?: string;
  costCenterId?: string;
  customerId?: string;
  supplierId?: string;
  installments?: number;
  notes?: string;
}

export interface PayTransactionDto {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  accountId: string;
  discountAmount?: number;
  interestAmount?: number;
  penaltyAmount?: number;
  notes?: string;
}
