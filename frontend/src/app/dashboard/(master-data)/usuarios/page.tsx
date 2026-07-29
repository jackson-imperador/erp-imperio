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
import { api } from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';

export default function UsuriosPage() {
  const companyId = useAuthStore(s => s.user?.companyId || '');
  const queryClient = useQueryClient();
  const { items, isLoading, update, remove, isMutating } = useCrud<any>(`/users/company/${companyId}`, ['usuarios', companyId]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [isInviting, setIsInviting] = useState(false);

  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'E-mail' }
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
        setIsInviting(true);
        const nameParts = (formData.name || '').trim().split(' ');
        const firstName = nameParts[0] || 'Novo';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Usuário';
        
        const payload = {
          email: formData.email,
          firstName,
          lastName,
          role: 'EMPLOYEE'
        };
        await api.post(`/users/company/${companyId}/invite`, payload);
        toast.success('Convite enviado com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['usuarios', companyId] });
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error('Erro ao salvar registro.');
    } finally {
      setIsInviting(false);
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
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestão de Usuários</h1>
        <Button onClick={() => handleOpen()} disabled={isMutating || isInviting}>Novo Registro</Button>
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
        title={editingItem ? 'Editar Usuários' : 'Novo Usuários'}
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
            <Label>E-mail</Label>
            <Input 
              value={formData['email'] || ''} 
              onChange={e => setFormData({ ...formData, 'email': e.target.value })} 
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isMutating || isInviting}>Salvar</Button>
          </div>
        </div>
      </GenericDialog>
    </div>
  );
}