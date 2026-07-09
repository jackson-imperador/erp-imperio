'use client';

import { useBankStatements } from '@/hooks/useFinancial';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BankStatement } from '@/types/financial';
import { FileDown, UploadCloud } from 'lucide-react';

export default function ExtratosPage() {
  const { data: statements = [], isLoading } = useBankStatements();

  const columns = [
    {
      key: 'date',
      header: 'Data',
      render: (row: BankStatement) => new Date(row.date).toLocaleDateString('pt-BR'),
    },
    { key: 'description', header: 'Histórico' },
    { key: 'documentNumber', header: 'Documento' },
    {
      key: 'type',
      header: 'Tipo',
      render: (row: BankStatement) => (
        <span className={row.type === 'CREDIT' ? 'text-emerald-500' : 'text-rose-500'}>
          {row.type === 'CREDIT' ? 'CRÉDITO' : 'DÉBITO'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Valor',
      render: (row: BankStatement) =>
        `R$ ${row.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'reconciled',
      header: 'Status',
      render: (row: BankStatement) => (
        <Badge variant={row.reconciled ? 'default' : 'outline'}>
          {row.reconciled ? 'Conciliado' : 'Pendente'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Extratos Bancários</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Importação de OFX e visualização de movimentações
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Button size="sm">
            <UploadCloud className="w-4 h-4 mr-2" />Importar OFX
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={statements} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
