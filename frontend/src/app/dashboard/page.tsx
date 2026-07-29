'use client';

import { useExecutiveDashboard } from '@/hooks/useAnalytics';
import { KPIGrid, RevenueChart } from '@/components/bi/BiWidgets';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardOverview() {
  const { data: metrics, isLoading } = useExecutiveDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">ERP IMPERIO BUILD TEST 999</h1>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">ERP IMPERIO BUILD TEST 999</h1>
      
      {/* Real Stats Cards directly from database */}
      <KPIGrid kpis={metrics?.kpis || []} />

      {/* Real Charts directly from database */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-700">
        <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">Performance de Receita</h3>
        <RevenueChart data={metrics?.revenueData || { name: 'Receita', data: [] }} />
      </div>
    </div>
  );
}
