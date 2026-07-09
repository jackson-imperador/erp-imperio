'use client';

import { useInventoryDashboard } from '@/hooks/useAnalytics';
import { KPIGrid, RevenueChart } from '@/components/bi/BiWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download } from 'lucide-react';

export default function BiEstoquePage() {
  const { data: metrics, isLoading } = useInventoryDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Analytics: Estoque e Compras</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Curva ABC, Custos de Armazenagem e Giro de Estoque
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />Exportar PDF
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <KPIGrid kpis={metrics?.kpis || []} />

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Volume Global de Estoque (Valuation)</h2>
            <RevenueChart data={metrics?.revenueData || { name: 'Estoque', data: [] }} />
          </div>
        </>
      )}
    </div>
  );
}
