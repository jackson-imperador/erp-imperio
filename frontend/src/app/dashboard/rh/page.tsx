'use client';

import { useHrDashboard } from '@/hooks/useHr';
import { HrSummaryCards, HeadcountChart } from '@/components/hr/HrWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function HrDashboardPage() {
  const { data: metrics, isLoading } = useHrDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard de RH</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão estratégica de pessoas, folha e obrigações trabalhistas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />Relatório Geral
          </Button>
          <Link href="/dashboard/rh/admissoes">
            <Button size="sm"><UserPlus className="w-4 h-4 mr-2" />Nova Admissão</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : (
        <>
          <HrSummaryCards metrics={metrics} />

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Evolução do Headcount (Últimos 12 meses)</h2>
            <HeadcountChart data={metrics?.headcountHistory || []} />
          </div>
        </>
      )}
    </div>
  );
}
