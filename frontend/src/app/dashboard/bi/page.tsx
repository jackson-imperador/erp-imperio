'use client';

import { useExecutiveDashboard } from '@/hooks/useAnalytics';
import { KPIGrid, RevenueChart, BarChartWidget } from '@/components/bi/BiWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw, Download } from 'lucide-react';

export default function BiExecutivePage() {
  const { data: metrics, isLoading } = useExecutiveDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard Executivo (CEO)</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Visão consolidada 360º da empresa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />Exportar PDF
          </Button>
          <Button size="sm">
            <RefreshCcw className="w-4 h-4 mr-2" />Atualizar Dados
          </Button>
        </div>
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
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Evolução de Faturamento</h2>
            <RevenueChart data={metrics?.revenueData || { name: 'Receita', data: [] }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Vendas por Região</h2>
              <BarChartWidget data={{ name: 'Regiões', data: (metrics?.salesByRegion || []).map(r => ({ label: r.region, value: r.value })) }} color="#6366f1" label="Vendas" />
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Top Produtos</h2>
              <div className="space-y-4">
                {(metrics?.topProducts || []).map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg">
                    <p className="font-medium text-sm text-zinc-700 dark:text-zinc-300">{i + 1}. {item.name}</p>
                    <span className="font-bold text-emerald-500">R$ {item.value.toLocaleString('pt-BR')}</span>
                  </div>
                ))}
                {(!metrics?.topProducts || metrics.topProducts.length === 0) && (
                  <p className="text-zinc-500 text-center py-4">Sem dados no período</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
