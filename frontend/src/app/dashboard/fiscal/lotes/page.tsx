'use client';

import { useFiscalLots } from '@/hooks/useFiscal';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Badge } from '@/components/ui/badge';
import { SefazLot } from '@/types/fiscal';

export default function LotesPage() {
  const { data: lots = [], isLoading } = useFiscalLots();

  const columns = [
    { key: 'lotNumber', header: 'Número do Lote' },
    { 
      key: 'status', 
      header: 'Status de Processamento',
      render: (r: SefazLot) => (
        <Badge variant={r.status === 'PROCESSED' ? 'default' : r.status === 'ERROR' ? 'destructive' : 'outline'} className={r.status === 'PROCESSED' ? 'bg-emerald-500' : ''}>
          {r.status}
        </Badge>
      )
    },
    { key: 'receipt', header: 'Recibo', render: (r: SefazLot) => r.receipt || '-' },
    { key: 'createdAt', header: 'Enviado em', render: (r: SefazLot) => new Date(r.createdAt).toLocaleString('pt-BR') },
    { key: 'message', header: 'Retorno SEFAZ', render: (r: SefazLot) => r.message || '-' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Monitor de Lotes SEFAZ</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Acompanhamento em tempo real do processamento de documentos fiscais
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={lots} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
