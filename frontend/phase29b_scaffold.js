const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const masterDataDir = path.join(srcDir, 'app', 'dashboard', '(master-data)');

const dirsToCreate = [
  'hooks', 'components/datatable', 'components/forms', 'components/dialogs', 'lib', 'types',
  ...['empresas', 'usuarios', 'perfis', 'clientes', 'fornecedores', 'produtos', 'categorias', 'marcas', 'unidades', 'departamentos', 'centros-custo']
    .map(m => path.join('app/dashboard/(master-data)', m))
];

dirsToCreate.forEach(dir => {
  const p = path.join(srcDir, dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

// 1. Generic CRUD Hook
fs.writeFileSync(path.join(srcDir, 'hooks', 'useCrud.ts'), `
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function useCrud<T>(endpoint: string, queryKey: string[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      // Mocking for frontend architecture tests, in real scenarios use backend
      try {
        const { data } = await api.get(endpoint);
        return data.data || data || [];
      } catch (e) {
        return [];
      }
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      const { data } = await api.post(endpoint, newData);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: res } = await api.put(\`\${endpoint}/\${id}\`, data);
      return res;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(\`\${endpoint}/\${id}\`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  return {
    ...query,
    items: (query.data as T[]) || [],
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
`);

// 2. Generic DataTable Component
fs.writeFileSync(path.join(srcDir, 'components', 'datatable', 'GenericDataTable.tsx'), `
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface GenericDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function GenericDataTable<T extends { id?: string }>({ data, columns, isLoading, onEdit, onDelete }: GenericDataTableProps<T>) {
  const [search, setSearch] = useState('');

  const filtered = data.filter((item: any) => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input 
          placeholder="Buscar..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(c => <TableHead key={c.key}>{c.header}</TableHead>)}
              {(onEdit || onDelete) && <TableHead className="w-[150px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map(c => (
                    <TableCell key={c.key}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                  {(onEdit || onDelete) && <TableCell><Skeleton className="h-4 w-20" /></TableCell>}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center h-24 text-zinc-500">
                  Nenhum registro encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item, i) => (
                <TableRow key={item.id || i}>
                  {columns.map(c => (
                    <TableCell key={c.key}>{c.render ? c.render(item) : (item as any)[c.key]}</TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell className="space-x-2">
                      {onEdit && <Button variant="outline" size="sm" onClick={() => onEdit(item)}>Editar</Button>}
                      {onDelete && <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>Excluir</Button>}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
`);

// 3. Generic Modals/Dialogs
fs.writeFileSync(path.join(srcDir, 'components', 'dialogs', 'GenericDialog.tsx'), `
import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface GenericDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function GenericDialog({ open, onOpenChange, title, description, children }: GenericDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
`);

// Modules configuration
const modules = [
  { path: 'empresas', name: 'Empresas', endpoint: '/companies', fields: [{name: 'name', label: 'Nome'}, {name: 'cnpj', label: 'CNPJ'}] },
  { path: 'usuarios', name: 'Usuários', endpoint: '/users', fields: [{name: 'name', label: 'Nome'}, {name: 'email', label: 'E-mail'}] },
  { path: 'perfis', name: 'Perfis e RBAC', endpoint: '/roles', fields: [{name: 'name', label: 'Nome'}, {name: 'description', label: 'Descrição'}] },
  { path: 'clientes', name: 'Clientes', endpoint: '/customers', fields: [{name: 'name', label: 'Nome'}, {name: 'document', label: 'Documento'}] },
  { path: 'fornecedores', name: 'Fornecedores', endpoint: '/suppliers', fields: [{name: 'name', label: 'Nome'}, {name: 'cnpj', label: 'CNPJ'}] },
  { path: 'produtos', name: 'Produtos', endpoint: '/products', fields: [{name: 'name', label: 'Nome'}, {name: 'sku', label: 'SKU'}, {name: 'price', label: 'Preço'}] },
  { path: 'categorias', name: 'Categorias', endpoint: '/categories', fields: [{name: 'name', label: 'Nome'}] },
  { path: 'marcas', name: 'Marcas', endpoint: '/brands', fields: [{name: 'name', label: 'Nome'}] },
  { path: 'unidades', name: 'Unidades', endpoint: '/units', fields: [{name: 'name', label: 'Nome'}, {name: 'symbol', label: 'Símbolo'}] },
  { path: 'departamentos', name: 'Departamentos', endpoint: '/departments', fields: [{name: 'name', label: 'Nome'}] },
  { path: 'centros-custo', name: 'Centros de Custo', endpoint: '/cost-centers', fields: [{name: 'name', label: 'Nome'}, {name: 'code', label: 'Código'}] },
];

modules.forEach(m => {
  const pageContent = `
'use client';
import { useState } from 'react';
import { useCrud } from '@/hooks/useCrud';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { GenericDialog } from '@/components/dialogs/GenericDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ${m.name.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  const { items, isLoading, create, update, remove, isMutating } = useCrud<any>('${m.endpoint}', ['${m.path}']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const columns = [
    ${m.fields.map(f => `{ key: '${f.name}', header: '${f.label}' }`).join(',\n    ')}
  ];

  const handleOpen = (item?: any) => {
    setEditingItem(item || null);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await update({ id: editingItem.id, data: formData });
        toast.success('Registro atualizado com sucesso!');
      } else {
        await create(formData);
        toast.success('Registro criado com sucesso!');
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error('Erro ao salvar registro.');
    }
  };

  const handleDelete = async (item: any) => {
    if (confirm('Deseja realmente excluir este registro?')) {
      try {
        await remove(item.id);
        toast.success('Registro excluído com sucesso!');
      } catch (e) {
        toast.error('Erro ao excluir.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestão de ${m.name}</h1>
        <Button onClick={() => handleOpen()} disabled={isMutating}>Novo Registro</Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
        <GenericDataTable 
          data={items} 
          columns={columns} 
          isLoading={isLoading} 
          onEdit={handleOpen}
          onDelete={handleDelete}
        />
      </div>

      <GenericDialog 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        title={editingItem ? 'Editar ${m.name}' : 'Novo ${m.name}'}
      >
        <div className="space-y-4">
          ${m.fields.map(f => `
          <div>
            <Label>${f.label}</Label>
            <Input 
              value={formData['${f.name}'] || ''} 
              onChange={e => setFormData({ ...formData, '${f.name}': e.target.value })} 
            />
          </div>`).join('\n          ')}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isMutating}>Salvar</Button>
          </div>
        </div>
      </GenericDialog>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(masterDataDir, m.path, 'page.tsx'), pageContent.trim());
});

// Providers Sonner integration
fs.writeFileSync(path.join(srcDir, 'components', 'Providers.tsx'), `
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
`);

console.log('Phase 29B Scaffolding Complete.');
