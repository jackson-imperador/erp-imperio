'use client';

import { useSpedReports } from '@/hooks/useFiscal'; // Reusing SPED hooks for structural similarity
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { SpedReport } from '@/types/fiscal';
import { FileDown, RefreshCw } from 'lucide-react';

export default function ReinfPage() {
  const { data: reports = [], isLoading } = useSpedReports('CONTRIBUICOES'); // Treating REINF similarly

  const columns = [
    { key: 'period', header: 'Período Apuração', render: (r: SpedReport) => r.period },
    { key: 'status', header: 'Status do Envio', render: (r: SpedReport) => r.status },
    { key: 'createdAt', header: 'Gerado em', render: (r: SpedReport) => r.createdAt ? new Date(r.createdAt).toLocaleString('pt-BR') : '-' },
    {
      key: 'actions',
      header: '',
      render: (r: SpedReport) => (
        <Button variant="outline" size="sm" disabled={r.status !== 'READY'}>
          <FileDown className="w-4 h-4 mr-2" />Recibo de Entrega
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">EFD-Reinf</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Retenções de impostos (IR, CSLL, COFINS, PIS) e INSS
          </p>
        </div>
        <Button size="sm"><RefreshCw className="w-4 h-4 mr-2" />Transmitir Eventos</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={reports} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
