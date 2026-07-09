'use client';

import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { CheckSquare, Play } from 'lucide-react';

export default function InventarioPage() {
  // Stub for inventory count process
  const data: any[] = [];
  const isLoading = false;

  const columns = [
    { key: 'id', header: 'ID do Inventário' },
    { key: 'warehouse', header: 'Depósito' },
    { key: 'status', header: 'Status' },
    { key: 'date', header: 'Data' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Inventário de Balanço</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Contagem física e reconciliação de estoques
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm"><Play className="w-4 h-4 mr-2" />Iniciar Nova Contagem</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
        {data.length === 0 ? (
          <div className="py-10">
            <CheckSquare className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">Nenhum inventário ativo no momento.</p>
          </div>
        ) : (
          <GenericDataTable data={data} columns={columns} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
