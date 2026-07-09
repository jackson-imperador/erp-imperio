'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEmployees } from '@/hooks/useHr';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { EmployeeStatusBadge } from '@/components/hr/HrWidgets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Employee, HrFilters } from '@/types/hr';
import { FileDown, Filter, UserPlus } from 'lucide-react';

export default function FuncionariosPage() {
  const [filters, setFilters] = useState<HrFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { data: employees = [], isLoading } = useEmployees(filters);

  const columns = [
    { key: 'registration', header: 'Matrícula' },
    { key: 'name', header: 'Nome' },
    { key: 'positionName', header: 'Cargo' },
    { key: 'departmentName', header: 'Departamento' },
    { key: 'status', header: 'Status', render: (r: Employee) => <EmployeeStatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: '',
      render: (r: Employee) => (
        <Link href={`/dashboard/rh/${r.id}`}>
          <Button variant="outline" size="sm">Ficha</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Funcionários</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão do quadro de colaboradores
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />Filtros
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Link href="/dashboard/rh/admissoes">
            <Button size="sm"><UserPlus className="w-4 h-4 mr-2" />Admitir</Button>
          </Link>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">Busca (Nome/CPF/Matrícula)</label>
            <Input placeholder="Pesquisar..." value={filters.search || ''} onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })} />
          </div>
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={() => setFilters({})}>Limpar Filtros</Button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={employees} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
