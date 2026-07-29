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
          <Button variant="outline" size="sm" onClick={() => window.print()}>
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

          <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border/40 shadow-sm transition-all duration-300 hover:border-primary/50">
            <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary/80" />
              Fluxo de Caixa Projetado
            </h2>
            <CashFlowChart data={metrics?.cashFlowSeries || []} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border/40 shadow-sm transition-all duration-300 hover:border-primary/50">
              <h2 className="text-lg font-bold text-foreground mb-4">Acesso Rápido</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/financeiro/contas-receber" className="p-4 border border-border/50 rounded-xl hover:border-emerald-500 hover:bg-emerald-500/5 transition-all duration-300">
                  <p className="font-bold text-foreground">Contas a Receber</p>
                  <p className="text-xs text-muted-foreground mt-1">Gestão de faturamento</p>
                </Link>
                <Link href="/dashboard/financeiro/contas-pagar" className="p-4 border border-border/50 rounded-xl hover:border-rose-500 hover:bg-rose-500/5 transition-all duration-300">
                  <p className="font-bold text-foreground">Contas a Pagar</p>
                  <p className="text-xs text-muted-foreground mt-1">Obrigações e despesas</p>
                </Link>
                <Link href="/dashboard/financeiro/conciliacao" className="p-4 border border-border/50 rounded-xl hover:border-emerald-500 hover:bg-emerald-500/5 transition-all duration-300">
                  <p className="font-bold text-foreground">Conciliação Bancária</p>
                  <p className="text-xs text-muted-foreground mt-1">Extratos e vínculos</p>
                </Link>
                <Link href="/dashboard/financeiro/fluxo-caixa" className="p-4 border border-border/50 rounded-xl hover:border-indigo-500 hover:bg-indigo-500/5 transition-all duration-300">
                  <p className="font-bold text-foreground">Fluxo de Caixa</p>
                  <p className="text-xs text-muted-foreground mt-1">Relatórios detalhados</p>
                </Link>
                {/* V2.2 — Sangrias */}
                <Link href="/dashboard/financeiro/sangrias" className="p-4 border rounded-xl transition-all duration-300 col-span-2 shadow-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
                  <p className="font-bold text-amber-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Sangrias de Caixa
                  </p>
                  <p className="text-xs text-amber-500/70 mt-1">Histórico auditável · PDF · Excel</p>
                </Link>
              </div>
            </div>
            
            <div className="bg-card/60 backdrop-blur-sm p-6 rounded-xl border border-border/40 shadow-sm transition-all duration-300 hover:border-primary/50">
              <h2 className="text-lg font-bold text-foreground mb-4">Últimas Transações (Pendentes)</h2>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <span className="text-primary text-xl">⚡</span>
                </div>
                <p className="text-sm font-bold text-muted-foreground">
                  Acesse o módulo específico para gerenciar transações.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
