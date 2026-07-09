export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'VACATION' | 'TERMINATED' | 'ADMISSION';

export interface Department {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  headcount: number;
  isActive: boolean;
}

export interface Position {
  id: string;
  companyId: string;
  title: string;
  departmentId: string;
  departmentName?: string;
  cboCode: string; // Classificação Brasileira de Ocupações
  baseSalary: number;
  isActive: boolean;
}

export interface Employee {
  id: string;
  companyId: string;
  registration: string; // Matrícula
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  positionId: string;
  positionName?: string;
  departmentId: string;
  departmentName?: string;
  admissionDate: string;
  terminationDate?: string;
  baseSalary: number;
  status: EmployeeStatus;
  esocialStatus: 'PENDING' | 'SYNCED' | 'ERROR';
  createdAt: string;
  updatedAt: string;
}

export interface Vacation {
  id: string;
  employeeId: string;
  employeeName?: string;
  periodStart: string;
  periodEnd: string;
  daysTaken: number;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELED';
  paid: boolean;
}

export interface Leave {
  id: string;
  employeeId: string;
  employeeName?: string;
  reason: string; // DOENCA, MATERNIDADE, ACIDENTE
  startDate: string;
  endDate?: string;
  hasMedicalCertificate: boolean;
  status: 'ACTIVE' | 'FINISHED';
}

export interface PayrollProcessing {
  id: string;
  companyId: string;
  referenceMonth: number;
  referenceYear: number;
  totalEmployees: number;
  totalGrossAmount: number;
  totalDiscounts: number;
  totalNetAmount: number;
  status: 'DRAFT' | 'CALCULATED' | 'CLOSED' | 'PAID';
  paymentDate?: string;
  createdAt: string;
}

export interface HrDashboardMetrics {
  totalActiveEmployees: number;
  totalOnLeave: number;
  totalOnVacation: number;
  totalTerminatedThisMonth: number;
  totalAdmissionsThisMonth: number;
  monthlyPayrollCost: number;
  headcountHistory: { month: string; count: number }[];
  turnoverRate: number;
}

export interface HrFilters {
  departmentId?: string;
  positionId?: string;
  status?: EmployeeStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EsocialEvent {
  id: string;
  employeeId?: string;
  employeeName?: string;
  eventType: string; // S-2200, S-2299, etc.
  receiptNumber?: string;
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  message?: string;
  sentAt?: string;
}
