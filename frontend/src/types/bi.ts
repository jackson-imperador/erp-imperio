export interface KPI {
  id: string;
  title: string;
  value: number | string;
  target?: number;
  format: 'CURRENCY' | 'PERCENTAGE' | 'NUMBER' | 'TIME';
  trend: 'UP' | 'DOWN' | 'STABLE';
  trendValue: number; // e.g. 15.5 meaning +15.5%
  updatedAt: string;
}

export interface ChartDataSeries {
  name: string;
  data: { label: string; value: number; secondaryValue?: number }[];
}

export interface BiDashboardMetrics {
  kpis: KPI[];
  revenueData: ChartDataSeries;
  cashFlowData: ChartDataSeries;
  topProducts: { name: string; value: number }[];
  salesByRegion: { region: string; value: number }[];
  lastRefresh: string;
}

export interface BiFilters {
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  departmentId?: string;
  period?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export interface AnalyticsPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number; // 0 to 100
  trend: 'UP' | 'DOWN' | 'STABLE';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestion: string;
}
