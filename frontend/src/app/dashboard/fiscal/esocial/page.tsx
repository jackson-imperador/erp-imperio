'use client';

import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function EsocialPage() {
  // Stubbing data as there's no explicit eSocial hook defined yet, reusing structure.
  const data: any[] = [];
  const isLoading = false;

  const columns = [
    { key: 'event', header: 'Evento' },
    { key: 'employee', header: 'Trabalhador' },
    { key: 'status', header: 'Status Sefaz' },
    { key: 'actions', header: '' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">eSocial</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão e transmissão de eventos trabalhistas
          </p>
        </div>
        <Button size="sm"><RefreshCw className="w-4 h-4 mr-2" />Sincronizar Eventos</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
        {data.length === 0 ? (
          <p className="text-zinc-500 py-10">Módulo em integração com folha de pagamento.</p>
        ) : (
          <GenericDataTable data={data} columns={columns} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
