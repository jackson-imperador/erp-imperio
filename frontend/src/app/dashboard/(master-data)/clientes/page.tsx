'use client';
import { useState } from 'react';
import { useCrud } from '@/hooks/useCrud';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { GenericDialog } from '@/components/dialogs/GenericDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/authStore';

export default function ClientesPage() {
  const companyId = useAuthStore(s => s.user?.companyId || '');
  const { items, isLoading, create, update, remove, isMutating } = useCrud<any>(`/company/${companyId}/customers`, ['clientes', companyId]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'phone', header: 'Celular' }
  ];

  const handleOpen = (item?: any) => {
    setEditingItem(item || null);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        type: formData.type || 'INDIVIDUAL'
      };

      if (editingItem) {
        await update({ id: editingItem.id, data: payload });
        toast.success('Registro atualizado com sucesso!');
      } else {
        await create(payload);
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
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestão de Clientes</h1>
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
        title={editingItem ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <div className="space-y-4">
          
          <div>
            <Label>Nome</Label>
            <Input 
              value={formData['name'] || ''} 
              onChange={e => setFormData({ ...formData, 'name': e.target.value })} 
            />
          </div>
          
          <div>
            <Label>Número Celular</Label>
            <Input 
              value={formData['phone'] || ''} 
              onChange={e => setFormData({ ...formData, 'phone': e.target.value })} 
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isMutating}>Salvar</Button>
          </div>
        </div>
      </GenericDialog>
    </div>
  );
}