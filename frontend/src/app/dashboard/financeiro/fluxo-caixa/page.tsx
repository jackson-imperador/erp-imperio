'use client';

import { useFinancialDashboard } from '@/hooks/useFinancial';
import { CashFlowChart } from '@/components/financial/FinancialWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileDown, Calendar } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';

export default function FluxoCaixaPage() {
  const { data: metrics, isLoading } = useFinancialDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Fluxo de Caixa</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Projeção de entradas e saídas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <FileDown className="w-4 h-4 mr-2" />Relatório PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToCsv('fluxo-caixa.csv', metrics?.cashFlowSeries || [])}>
            <FileDown className="w-4 h-4 mr-2" />Exportar Dados
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <CashFlowChart data={metrics?.cashFlowSeries || []} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
          <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Total de Entradas Projetadas</h3>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 mt-2">
            R$ {(metrics?.totalReceivables || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-xl border border-rose-100 dark:border-rose-900/20">
          <h3 className="font-semibold text-rose-700 dark:text-rose-400">Total de Saídas Projetadas</h3>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-500 mt-2">
            R$ {(metrics?.totalPayables || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
