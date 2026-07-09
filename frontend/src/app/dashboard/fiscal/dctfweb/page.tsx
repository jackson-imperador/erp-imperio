'use client';

import { useSpedReports } from '@/hooks/useFiscal';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { SpedReport } from '@/types/fiscal';
import { FileDown, Globe } from 'lucide-react';

export default function DctfWebPage() {
  // Utilizing same endpoint but we'd filter or handle DCTFWeb uniquely in backend later
  const { data: reports = [], isLoading } = useSpedReports('CONTRIBUICOES');

  const columns = [
    { key: 'period', header: 'Período', render: (r: SpedReport) => r.period },
    { key: 'status', header: 'Status', render: (r: SpedReport) => r.status },
    { key: 'createdAt', header: 'Atualizado em', render: (r: SpedReport) => r.createdAt ? new Date(r.createdAt).toLocaleString('pt-BR') : '-' },
    {
      key: 'actions',
      header: '',
      render: (r: SpedReport) => (
        <Button variant="outline" size="sm" disabled={r.status !== 'READY'}>
          <FileDown className="w-4 h-4 mr-2" />Guia DARF
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">DCTFWeb</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Declaração de Débitos e Créditos Tributários Federais Previdenciários
          </p>
        </div>
        <Button size="sm"><Globe className="w-4 h-4 mr-2" />Acessar Portal e-CAC</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={reports} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
