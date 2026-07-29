'use client';

import { useInventoryDashboard, useStockMovements } from '@/hooks/useInventory';
import { InventorySummaryCards, InventoryChart, InventoryTimeline } from '@/components/inventory/InventoryWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Plus } from 'lucide-react';
import Link from 'next/link';

export default function InventoryDashboardPage() {
  const { data: metrics, isLoading } = useInventoryDashboard();
  const { data: recentMovements = [], isLoading: isLoadingMovements } = useStockMovements();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard de Estoque</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão unificada de inventário e almoxarifados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />Relatório PDF
          </Button>
          <Link href="/dashboard/estoque/movimentacoes">
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Nova Movimentação</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <InventorySummaryCards metrics={metrics} />

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Volume de Movimentações</h2>
            <InventoryChart data={metrics?.movementsByDay || []} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Últimas Movimentações</h2>
              <InventoryTimeline movements={recentMovements} isLoading={isLoadingMovements} />
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Curva ABC</h2>
              <div className="space-y-4">
                {(metrics?.abcCurve || []).slice(0, 5).map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{item.product}</p>
                      <p className="text-xs text-zinc-500">{item.percentage}% de representatividade</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${item.class === 'A' ? 'bg-emerald-100 text-emerald-700' : item.class === 'B' ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-100 text-zinc-700'}`}>
                      {item.class}
                    </div>
                  </div>
                ))}
                {(!metrics?.abcCurve || metrics.abcCurve.length === 0) && (
                  <p className="text-zinc-500 text-center py-4">Dados insuficientes para Curva ABC</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
