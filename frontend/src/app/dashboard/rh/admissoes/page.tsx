'use client';

import { useEmployees } from '@/hooks/useHr';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { Employee } from '@/types/hr';
import { FilePlus } from 'lucide-react';
import Link from 'next/link';

export default function AdmissoesPage() {
  const { data: employees = [], isLoading } = useEmployees({ status: 'ADMISSION' });

  const columns = [
    { key: 'name', header: 'Nome do Candidato/Colaborador' },
    { key: 'cpf', header: 'CPF' },
    { key: 'positionName', header: 'Cargo Pretendido' },
    { key: 'esocialStatus', header: 'Status eSocial (S-2200)' },
    {
      key: 'actions',
      header: '',
      render: (r: Employee) => (
        <Link href={`/dashboard/rh/${r.id}`}>
          <Button variant="outline" size="sm">Continuar Processo</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Processos de Admissão</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão de novos colaboradores e envio preliminar ao eSocial
          </p>
        </div>
        <Button size="sm"><FilePlus className="w-4 h-4 mr-2" />Iniciar Admissão</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={employees} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
