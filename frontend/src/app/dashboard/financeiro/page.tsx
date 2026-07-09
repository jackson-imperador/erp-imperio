'use client';

import { useFinancialDashboard } from '@/hooks/useFinancial';
import { FinancialSummaryCards, CashFlowChart } from '@/components/financial/FinancialWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Plus } from 'lucide-react';
import Link from 'next/link';

export default function FinanceiroDashboardPage() {
  const { data: metrics, isLoading } = useFinancialDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard Financeiro</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Visão geral consolidada do fluxo de caixa e obrigações
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />Relatório PDF
          </Button>
          <Link href="/dashboard/financeiro/contas-receber">
            <Button size="sm"><Plus className="w-4 h-4 mr-2" />Novo Recebimento</Button>
          </Link>
          <Link href="/dashboard/financeiro/contas-pagar">
            <Button size="sm" variant="secondary"><Plus className="w-4 h-4 mr-2" />Novo Pagamento</Button>
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
          <FinancialSummaryCards metrics={metrics} />

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Fluxo de Caixa Projetado</h2>
            <CashFlowChart data={metrics?.cashFlowSeries || []} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Acesso Rápido</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/financeiro/contas-receber" className="p-4 border rounded-lg hover:border-indigo-500 transition-colors">
                  <p className="font-medium">Contas a Receber</p>
                  <p className="text-xs text-zinc-500 mt-1">Gestão de faturamento</p>
                </Link>
                <Link href="/dashboard/financeiro/contas-pagar" className="p-4 border rounded-lg hover:border-rose-500 transition-colors">
                  <p className="font-medium">Contas a Pagar</p>
                  <p className="text-xs text-zinc-500 mt-1">Obrigações e despesas</p>
                </Link>
                <Link href="/dashboard/financeiro/conciliacao" className="p-4 border rounded-lg hover:border-emerald-500 transition-colors">
                  <p className="font-medium">Conciliação Bancária</p>
                  <p className="text-xs text-zinc-500 mt-1">Extratos e vínculos</p>
                </Link>
                <Link href="/dashboard/financeiro/fluxo-caixa" className="p-4 border rounded-lg hover:border-indigo-500 transition-colors">
                  <p className="font-medium">Fluxo de Caixa</p>
                  <p className="text-xs text-zinc-500 mt-1">Relatórios detalhados</p>
                </Link>
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Últimas Transações (Pendentes)</h2>
              <div className="text-center py-10 text-zinc-500 text-sm">
                Acesse o módulo específico para listar as transações.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
