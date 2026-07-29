'use client';

import { usePayroll } from '@/hooks/useHr';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PayrollProcessing } from '@/types/hr';
import { Calculator, FileDown } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';
import { toast } from 'sonner';

export default function FolhaPage() {
  const { data: payrolls = [], isLoading } = usePayroll();

  const columns = [
    { key: 'referenceMonth', header: 'Competência', render: (r: PayrollProcessing) => `${String(r.referenceMonth).padStart(2, '0')}/${r.referenceYear}` },
    { key: 'totalEmployees', header: 'Funcionários Processados' },
    { key: 'totalGrossAmount', header: 'Total Bruto', render: (r: PayrollProcessing) => `R$ ${(r.totalGrossAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { key: 'totalDiscounts', header: 'Total Descontos', render: (r: PayrollProcessing) => <span className="text-rose-500">R$ ${(r.totalDiscounts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> },
    { key: 'totalNetAmount', header: 'Total Líquido', render: (r: PayrollProcessing) => <span className="font-bold text-indigo-500">R$ ${(r.totalNetAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> },
    { 
      key: 'status', 
      header: 'Status',
      render: (r: PayrollProcessing) => (
        <Badge variant={r.status === 'PAID' ? 'default' : r.status === 'CLOSED' ? 'secondary' : 'outline'} className={r.status === 'PAID' ? 'bg-emerald-500' : ''}>
          {r.status}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Folha de Pagamento</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Processamento de salários, pró-labore e provisões
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCsv('folha.csv', payrolls)}>
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Button size="sm" onClick={() => { const mes = window.prompt("Digite o mês/ano (Ex: 07/2026) para processar a folha:"); if (mes) toast.success(`Folha de ${mes} enviada para processamento!`); }}><Calculator className="w-4 h-4 mr-2" />Processar Folha</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={payrolls} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
