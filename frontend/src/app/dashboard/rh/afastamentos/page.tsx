'use client';

import { useLeaves } from '@/hooks/useHr';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Leave } from '@/types/hr';
import { Stethoscope } from 'lucide-react';

export default function AfastamentosPage() {
  const { data: leaves = [], isLoading } = useLeaves();

  const columns = [
    { key: 'employeeName', header: 'Funcionário' },
    { key: 'reason', header: 'Motivo' },
    { key: 'startDate', header: 'Início', render: (r: Leave) => new Date(r.startDate).toLocaleDateString('pt-BR') },
    { key: 'endDate', header: 'Previsão Retorno', render: (r: Leave) => r.endDate ? new Date(r.endDate).toLocaleDateString('pt-BR') : 'Indeterminado' },
    { key: 'hasMedicalCertificate', header: 'Atestado', render: (r: Leave) => r.hasMedicalCertificate ? 'Entregue' : 'Pendente' },
    { 
      key: 'status', 
      header: 'Status',
      render: (r: Leave) => (
        <Badge variant={r.status === 'ACTIVE' ? 'destructive' : 'secondary'}>
          {r.status === 'ACTIVE' ? 'Afastado' : 'Retornou'}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Afastamentos e Licenças</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Controle de auxílio-doença, licença maternidade e atestados
          </p>
        </div>
        <Button size="sm"><Stethoscope className="w-4 h-4 mr-2" />Registrar Afastamento</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={leaves} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
