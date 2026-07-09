'use client';

import { useState } from 'react';
import { useStockMovements, useInventoryMutations, useWarehouses, useInventory } from '@/hooks/useInventory';
import { GenericDataTable } from '@/components/datatable/GenericDataTable';
import { Button } from '@/components/ui/button';
import { GenericDialog } from '@/components/dialogs/GenericDialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { StockMovement } from '@/types/inventory';

export default function TransferenciasPage() {
  const { data: movements = [], isLoading } = useStockMovements({ type: 'TRANSFER' });
  const { data: warehouses = [] } = useWarehouses();
  const { data: products = [] } = useInventory();
  const { executeTransfer, isMutating } = useInventoryMutations();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    originWarehouseId: '',
    destinationWarehouseId: '',
    productId: '',
    quantity: 0,
    observation: ''
  });

  const handleTransfer = async () => {
    if (!formData.originWarehouseId || !formData.destinationWarehouseId || !formData.productId || formData.quantity <= 0) {
      toast.error('Preencha os campos obrigatórios corretamente.');
      return;
    }
    if (formData.originWarehouseId === formData.destinationWarehouseId) {
      toast.error('O depósito de destino deve ser diferente da origem.');
      return;
    }
    try {
      await executeTransfer.mutateAsync(formData);
      toast.success('Transferência realizada com sucesso!');
      setDialogOpen(false);
    } catch {
      toast.error('Erro ao transferir.');
    }
  };

  const columns = [
    { key: 'createdAt', header: 'Data/Hora', render: (r: StockMovement) => new Date(r.createdAt).toLocaleString('pt-BR') },
    { key: 'productName', header: 'Produto' },
    { key: 'quantity', header: 'Quantidade' },
    { key: 'observation', header: 'Observação', render: (r: StockMovement) => r.observation || '-' },
    { key: 'createdByName', header: 'Responsável', render: (r: StockMovement) => r.createdByName || 'Sistema' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Transferências entre Depósitos</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Mova produtos entre diferentes almoxarifados ou filiais
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <ArrowRight className="w-4 h-4 mr-2" />Nova Transferência
        </Button>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <GenericDataTable data={movements} columns={columns} isLoading={isLoading} />
      </div>

      <GenericDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Nova Transferência" description="Selecione origem, destino e o produto para transferir.">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Depósito de Origem</Label>
              <select
                value={formData.originWarehouseId}
                onChange={(e) => setFormData({ ...formData, originWarehouseId: e.target.value })}
                className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
              >
                <option value="">Selecione...</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Depósito de Destino</Label>
              <select
                value={formData.destinationWarehouseId}
                onChange={(e) => setFormData({ ...formData, destinationWarehouseId: e.target.value })}
                className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
              >
                <option value="">Selecione...</option>
                {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label>Produto</Label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full mt-1 rounded-md border border-zinc-300 dark:border-zinc-700 p-2 text-sm bg-white dark:bg-zinc-800"
            >
              <option value="">Selecione o produto em estoque...</option>
              {products.map((p) => <option key={p.productId} value={p.productId}>{p.productName} (Disp: {p.availableQuantity})</option>)}
            </select>
          </div>
          <div>
            <Label>Quantidade</Label>
            <Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} className="mt-1" />
          </div>
          <div>
            <Label>Observação (Opcional)</Label>
            <Input value={formData.observation} onChange={(e) => setFormData({ ...formData, observation: e.target.value })} className="mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleTransfer} disabled={isMutating}>Confirmar Transferência</Button>
          </div>
        </div>
      </GenericDialog>
    </div>
  );
}
