'use client';

import { useAdminDashboard, useHealth, useLicense } from '@/hooks/useAdmin';
import { AdminSummaryCards, HealthStatusCard, LicenseCard } from '@/components/admin/AdminWidgets';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { data: metrics, isLoading: isMetricsLoading } = useAdminDashboard();
  const { data: health, isLoading: isHealthLoading } = useHealth();
  const { data: license, isLoading: isLicenseLoading } = useLicense();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Central de Administração</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão global da plataforma, infraestrutura e segurança
          </p>
        </div>
      </div>

      {(isMetricsLoading || isHealthLoading || isLicenseLoading) ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 lg:col-span-2 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          <AdminSummaryCards metrics={metrics} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <HealthStatusCard health={health} />
              
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Módulos Ativos</h3>
                <div className="flex flex-wrap gap-2">
                  {license?.features?.map((f, i) => (
                    <span key={i} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-full text-xs font-medium">
                      {f}
                    </span>
                  )) || <span className="text-zinc-500 text-sm">Nenhum módulo detectado</span>}
                </div>
              </div>
            </div>
            
            <div>
              <LicenseCard license={license} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
