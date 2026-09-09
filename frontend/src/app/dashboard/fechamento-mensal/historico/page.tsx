'use client';

import { useMonthlyClosingHistory } from '@/hooks/useMonthlyClosing';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, TrendingUp, TrendingDown } from 'lucide-react';

function fmt(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function FechamentoHistoricoPage() {
  const { data, isLoading } = useMonthlyClosingHistory();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/fechamento-mensal">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Voltar</Button>
        </Link>
        <h1 className="text-2xl font-bold">Historico de Fechamentos</h1>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Nenhum fechamento registrado ainda.</p>
          <Link href="/dashboard/fechamento-mensal">
            <Button className="mt-4">Fazer primeiro fechamento</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3">Periodo</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Fat. Liquido</th>
                <th className="text-right px-4 py-3">CMV</th>
                <th className="text-right px-4 py-3">Lucro Bruto</th>
                <th className="text-right px-4 py-3">Resultado Liq.</th>
                <th className="text-right px-4 py-3">Caixa Final</th>
                <th className="text-center px-4 py-3">Confiab.</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={`${c.year}-${c.month}`} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">
                    {MONTHS[(c.month ?? 1) - 1]}/{c.year}
                  </td>
                  <td className="px-4 py-3">
                    {c.status === 'CLOSED' ? (
                      <span className="flex items-center gap-1 text-blue-700 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />FECHADO
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-700 text-xs font-medium">
                        <Clock className="w-3 h-3" />ABERTO
                      </span>
                    )}
                  </td>
                  <td className="text-right px-4 py-3">{fmt(c.netRevenue)}</td>
                  <td className="text-right px-4 py-3">{fmt(c.cogs)}</td>
                  <td className={`text-right px-4 py-3 font-medium ${c.grossProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {fmt(c.grossProfit)}
                  </td>
                  <td className={`text-right px-4 py-3 font-bold ${c.netIncome >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {c.netIncome >= 0 ? <TrendingUp className="inline w-3 h-3 mr-1" /> : <TrendingDown className="inline w-3 h-3 mr-1" />}
                    {fmt(c.netIncome)}
                  </td>
                  <td className={`text-right px-4 py-3 ${c.cashFinal >= 0 ? '' : 'text-red-600'}`}>{fmt(c.cashFinal)}</td>
                  <td className="text-center px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.cogsReliability === 'FULL' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {c.cogsReliability}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/fechamento-mensal?month=${c.month}&year=${c.year}`}>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
