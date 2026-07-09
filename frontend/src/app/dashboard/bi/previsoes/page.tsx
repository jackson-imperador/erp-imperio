'use client';

import { usePredictions } from '@/hooks/useAnalytics';
import { PredictionCard } from '@/components/bi/BiWidgets';
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit } from 'lucide-react';

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
