'use client';

import { useCashDrawers } from '@/hooks/usePDV';
import { CashDrawerCard } from '@/components/pdv/PDVWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';

export default function PdvCaixasPage() {
  const { data: drawers = [], isLoading } = useCashDrawers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Terminais de Caixa</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Monitoramento em tempo real do saldo e status dos gaveteiros
          </p>
        </div>
        <Button size="sm"><Plus className="w-4 h-4 mr-2" />Novo Terminal</Button>
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
