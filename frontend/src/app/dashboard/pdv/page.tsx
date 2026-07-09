'use client';

import { usePdvDashboard } from '@/hooks/usePDV';
import { PdvSummaryCards } from '@/components/pdv/PDVWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, MonitorSmartphone } from 'lucide-react';
import Link from 'next/link';

export default function PdvDashboardPage() {
  const { data: metrics, isLoading } = usePdvDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">PDV e Frente de Caixa</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestão de caixas, sangrias, suprimentos e cupom fiscal (NFC-e)
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/pdv/caixas">
            <Button variant="outline" size="sm">
              <MonitorSmartphone className="w-4 h-4 mr-2" />Terminais
            </Button>
          </Link>
          <Link href="/dashboard/pdv/caixa">
            <Button size="sm">
              <ShoppingCart className="w-4 h-4 mr-2" />Frente de Caixa (F2)
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        </div>
      ) : (
        <PdvSummaryCards metrics={metrics} />
      )}
    </div>
  );
}
