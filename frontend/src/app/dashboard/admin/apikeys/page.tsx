'use client';

import { useApiKeys } from '@/hooks/useAdmin';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiKey } from '@/types/admin';
import { Key, Plus } from 'lucide-react';

export default function ApiKeysPage() {
  const { data: keys = [], isLoading } = useApiKeys();

  const columns = [
    { key: 'name', header: 'Nome da Chave' },
    { key: 'keyPrefix', header: 'Prefixo', render: (r: ApiKey) => <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">{r.keyPrefix}...</code> },
    { key: 'scopes', header: 'Escopos', render: (r: ApiKey) => r.scopes.join(', ') || 'All' },
    { key: 'createdAt', header: 'Criada em', render: (r: ApiKey) => new Date(r.createdAt).toLocaleDateString('pt-BR') },
    { key: 'lastUsedAt', header: 'Último Uso', render: (r: ApiKey) => r.lastUsedAt ? new Date(r.lastUsedAt).toLocaleString('pt-BR') : 'Nunca' },
    { 
      key: 'isActive', 
      header: 'Status',
      render: (r: ApiKey) => (
        <Badge variant={r.isActive ? 'default' : 'destructive'} className={r.isActive ? 'bg-emerald-500' : ''}>
          {r.isActive ? 'Ativa' : 'Revogada'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (r: ApiKey) => (
        r.isActive && <Button variant="destructive" size="sm">Revogar</Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Key className="text-indigo-500" /> API Keys
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão de chaves de acesso para integrações externas (Server-to-Server)
          </p>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-2" />Gerar Nova Chave</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={keys} columns={columns} isLoading={isLoading} />
      </div>
    </div>
  );
}
