'use client';

import { useState } from 'react';
import { useAudit } from '@/hooks/useAdmin';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuditLog, AdminFilters } from '@/types/admin';
import { ShieldCheck, Filter } from 'lucide-react';

export default function AuditoriaPage() {
  const [filters, setFilters] = useState<AdminFilters>({});
  const { data: logs = [], isLoading } = useAudit(filters);

  const columns = [
    { key: 'createdAt', header: 'Data/Hora', render: (r: AuditLog) => new Date(r.createdAt).toLocaleString('pt-BR') },
    { key: 'userName', header: 'Usuário', render: (r: AuditLog) => r.userName || r.userId },
    { key: 'action', header: 'Ação', render: (r: AuditLog) => <span className="font-semibold text-indigo-500">{r.action}</span> },
    { key: 'entity', header: 'Módulo/Entidade' },
    { key: 'details', header: 'Detalhes', render: (r: AuditLog) => <span className="text-xs text-zinc-500 truncate max-w-xs block" title={r.details}>{r.details}</span> },
    { key: 'ipAddress', header: 'IP' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-indigo-500" /> Logs de Auditoria
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Rastreabilidade e compliance de todas as ações sensíveis do sistema
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Buscar (ID/Usuário)</label>
          <Input placeholder="Pesquisar..." value={filters.search || ''} onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })} />
        </div>
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-1 block">Módulo</label>
          <Input placeholder="Ex: FINANCIAL, HR" value={filters.module || ''} onChange={(e) => setFilters({ ...filters, module: e.target.value || undefined })} />
        </div>
        <div className="flex items-end">
          <Button variant="outline" size="sm" onClick={() => setFilters({})}>Limpar Filtros</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={logs} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
