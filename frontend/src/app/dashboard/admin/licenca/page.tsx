'use client';

import { useLicense } from '@/hooks/useAdmin';
import { LicenseCard } from '@/components/admin/AdminWidgets';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

export default function LicencaPage() {
  const { data: license, isLoading } = useLicense();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Licença e Assinatura</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Informações sobre o plano atual, limites e faturamento
          </p>
        </div>
        <Button size="sm"><CreditCard className="w-4 h-4 mr-2" />Fazer Upgrade</Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 max-w-md rounded-xl" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LicenseCard license={license} />
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
             <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Adicionais Contratados</h3>
             <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
               <li className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                 <span>Armazenamento Extra (S3)</span>
                 <span className="font-medium text-emerald-500">+100 GB</span>
               </li>
               <li className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                 <span>Requisições API</span>
                 <span className="font-medium text-emerald-500">Ilimitado</span>
               </li>
               <li className="flex justify-between pb-2">
                 <span>Módulo IA (Predições)</span>
                 <span className="font-medium text-indigo-500">Ativado</span>
               </li>
             </ul>
          </div>
        </div>
      )}
    </div>
  );
}
