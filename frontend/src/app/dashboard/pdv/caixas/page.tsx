'use client';

import { useState } from 'react';
import { useCashDrawers, usePdvMutations } from '@/hooks/usePDV';
import { CashDrawerCard } from '@/components/pdv/PDVWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function PdvCaixasPage() {
  const { data: drawers = [], isLoading } = useCashDrawers();
  const { createDrawer } = usePdvMutations();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [operator, setOperator] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('O nome do terminal é obrigatório.');
      return;
    }
    
    try {
      await createDrawer.mutateAsync({ name, operatorName: operator, status: 'CLOSED', initialBalance: 0, currentBalance: 0 });
      toast.success('Terminal criado com sucesso!');
      setOpen(false);
      setName('');
      setOperator('');
    } catch (error) {
      toast.error('Erro ao criar terminal.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Terminais de Caixa</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Monitoramento em tempo real do saldo e status dos gaveteiros
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm"><Plus className="w-4 h-4 mr-2" />Novo Terminal</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Terminal de Caixa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Terminal</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Caixa 01" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator">Nome do Operador (Opcional)</Label>
                <Input 
                  id="operator" 
                  placeholder="Ex: João Silva" 
                  value={operator} 
                  onChange={e => setOperator(e.target.value)} 
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createDrawer.isPending}>
                  {createDrawer.isPending ? 'Criando...' : 'Salvar Terminal'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drawers.map((d, i) => (
            <CashDrawerCard key={i} drawer={d} />
          ))}
          {drawers.length === 0 && (
             <p className="col-span-full text-center text-zinc-500 py-10">Nenhum terminal configurado.</p>
          )}
        </div>
      )}
    </div>
  );
}
