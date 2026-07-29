'use client';
import { useState } from 'react';
import { useCrud } from '@/hooks/useCrud';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { GenericDialog } from '@/components/dialogs/GenericDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileDown } from 'lucide-react';
import { exportToCsv } from '@/utils/exportCsv';

import { useAuthStore } from '@/store/authStore';

export default function ProdutosPage() {
  const companyId = useAuthStore(s => s.user?.companyId || '');
  const { items, isLoading, create, update, remove, isMutating } = useCrud<any>(`/company/${companyId}/catalog/products`, ['produtos', companyId]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'sku', header: 'SKU' },
    { key: 'barcode', header: 'Cód. Barras' },
    { key: 'costPrice', header: 'Pr. Custo', render: (row: any) => `R$ ${Number(row.costPrice || 0).toFixed(2)}` },
    { key: 'salePrice', header: 'Pr. Venda', render: (row: any) => `R$ ${Number(row.salePrice || 0).toFixed(2)}` }
  ];

  const handleOpen = (item?: any) => {
    setEditingItem(item || null);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name || 'Produto Sem Nome',
        sku: formData.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
        costPrice: Number(formData.costPrice || 0),
        salePrice: Number(formData.salePrice || 0),
        type: formData.type || 'PHYSICAL',
        ...(formData.initialStock ? { initialStock: Number(formData.initialStock) } : {}),
        ...(formData.barcode ? { barcode: formData.barcode } : {})
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestão de Produtos</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCsv('produtos_cadastro.csv', items)}>
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Button onClick={() => handleOpen()} disabled={isMutating}>Novo Registro</Button>
        </div>
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
        title={editingItem ? 'Editar Produtos' : 'Novo Produtos'}
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
            <Label>SKU</Label>
            <Input 
              value={formData['sku'] || ''} 
              onChange={e => setFormData({ ...formData, 'sku': e.target.value })} 
            />
          </div>

          <div>
            <Label>Código de Barras</Label>
            <Input 
              value={formData['barcode'] || ''} 
              onChange={e => setFormData({ ...formData, 'barcode': e.target.value })} 
              placeholder="Bipe o código aqui"
            />
          </div>

          <div>
            <Label>Quantidade Inicial (Estoque)</Label>
            <Input 
              type="number"
              value={formData['initialStock'] || 0} 
              onChange={e => setFormData({ ...formData, 'initialStock': parseInt(e.target.value) || 0 })} 
              placeholder="Quantos você tem agora?"
            />
            <span className="text-xs text-zinc-500">Isso fará uma entrada automática no estoque principal.</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Preço de Custo (R$)</Label>
              <Input 
                type="number"
                step="0.01"
                value={formData['costPrice'] || ''} 
                onChange={e => setFormData({ ...formData, 'costPrice': parseFloat(e.target.value) || 0 })} 
              />
            </div>
            <div>
              <Label>Preço de Venda (R$)</Label>
              <Input 
                type="number"
                step="0.01"
                value={formData['salePrice'] || ''} 
                onChange={e => setFormData({ ...formData, 'salePrice': parseFloat(e.target.value) || 0 })} 
              />
            </div>
          </div>
          
          {(formData.costPrice > 0 && formData.salePrice > 0) && (
            <div className="text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-800 p-2 rounded">
              <strong>Markup / Lucro Bruto: </strong>
              {(((formData.salePrice - formData.costPrice) / formData.costPrice) * 100).toFixed(2)}% 
              (R$ {(formData.salePrice - formData.costPrice).toFixed(2)})
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isMutating}>Salvar</Button>
          </div>
        </div>
      </GenericDialog>
    </div>
  );
}