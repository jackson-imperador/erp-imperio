'use client';

import { useKpis } from '@/hooks/useAnalytics';
import { KPIGrid } from '@/components/bi/BiWidgets';
import { Skeleton } from '@/components/ui/skeleton';

export default function BiKpisPage() {
  const { data: kpis = [], isLoading } = useKpis();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Central de KPIs (Indicadores-Chave)</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Monitoramento de todos os indicadores da empresa
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : (
        <KPIGrid kpis={kpis} />
      )}
    </div>
  );
}
