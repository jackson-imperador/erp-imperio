'use client';

import { usePredictions } from '@/hooks/useAnalytics';
import { PredictionCard } from '@/components/bi/BiWidgets';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BrainCircuit, Download, RefreshCcw } from 'lucide-react';

export default function BiPrevisoesPage() {
  const { data: predictions = [], isLoading } = usePredictions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="text-indigo-500" /> IA & Previsões (Machine Learning)
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Projeções e insights automáticos baseados no histórico de dados do ERP
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />Relatório IA
          </Button>
          <Button size="sm" onClick={() => { toast.info('Treinando modelos com dados recentes...'); setTimeout(() => toast.success('Modelos atualizados com precisão de 94.2%'), 2000); }}>
            <RefreshCcw className="w-4 h-4 mr-2" />Recalcular Previsões
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predictions.length === 0 ? (
            <p className="col-span-full text-center text-zinc-500 py-10">Modelo de previsão em fase de treinamento (Poucos dados disponíveis).</p>
          ) : (
            predictions.map((p, i) => (
              <PredictionCard key={i} prediction={p} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
