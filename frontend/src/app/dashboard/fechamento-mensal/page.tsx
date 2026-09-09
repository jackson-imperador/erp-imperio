'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMonthlyClosingPreview, useMonthlyClosingOne, useCloseMonth, useReopenMonth } from '@/hooks/useMonthlyClosing';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Lock, LockOpen, History, TrendingUp, TrendingDown } from 'lucide-react';

function fmt(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function fmt2(value: number, decimals = 1): string {
  return value.toFixed(decimals) + '%';
}

interface CardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean | null;
}
function Card({ label, value, sub, positive }: CardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${positive === true ? 'text-green-600' : positive === false ? 'text-red-600' : ''}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mt-8 mb-3 border-b pb-1">{children}</h2>;
}

const MONTHS = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export default function FechamentoMensalPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);

  const previewQ = useMonthlyClosingPreview(month, year);
  const savedQ = useMonthlyClosingOne(month, year);
  const closeM = useCloseMonth();
  const reopenM = useReopenMonth();

  const isClosed = savedQ.data?.status === 'CLOSED';
  const data = isClosed ? savedQ.data : previewQ.data;
  const loading = isClosed ? savedQ.isLoading : previewQ.isLoading;

  const handleClose = () => {
    if (!confirm('Confirmar fechamento do mes ' + MONTHS[month - 1] + '/' + year + '? Esta acao gera um snapshot imutavel.')) return;
    closeM.mutate({ month, year });
  };

  const handleReopen = () => {
    if (!reopenReason.trim()) { alert('Informe o motivo da reabertura.'); return; }
    reopenM.mutate({ month, year, reason: reopenReason }, {
      onSuccess: () => { setShowReopenModal(false); setReopenReason(''); }
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Fechamento Mensal</h1>
          <p className="text-muted-foreground text-sm">Resultado operacional e financeiro do periodo selecionado</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm bg-background"
          >
            {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm bg-background"
          >
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Link href="/dashboard/fechamento-mensal/historico">
            <Button variant="outline" size="sm"><History className="w-4 h-4 mr-1" />Historico</Button>
          </Link>
        </div>
      </div>

      {/* Status Banner */}
      {isClosed && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2 mb-4 text-sm">
          <Lock className="w-4 h-4" />
          <span>Mes <strong>FECHADO</strong> em {savedQ.data?.closedAt ? new Date(savedQ.data.closedAt).toLocaleString('pt-BR') : '-'}. Os valores abaixo sao o snapshot imutavel.</span>
          <Button variant="ghost" size="sm" className="ml-auto text-blue-700" onClick={() => setShowReopenModal(true)}>
            <LockOpen className="w-4 h-4 mr-1" />Reabrir
          </Button>
        </div>
      )}

      {data?.cogsReliability === 'PARTIAL' && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2 mb-4 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span><strong>Aviso:</strong> {data.cogsIncomplete} {data.cogsIncomplete === 1 ? 'item' : 'itens'} sem custo historico determinavel. O CMV e o Lucro Bruto podem estar subestimados. Margem com confiabilidade PARCIAL.</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !data ? (
        <div className="text-center py-16 text-muted-foreground">Nenhum dado encontrado para este periodo.</div>
      ) : (
        <>
          {/* RESULTADO EXECUTIVO */}
          <div className="flex items-center gap-3 mb-4 mt-2">
            {data.isPositive !== false && data.netIncome >= 0 ? (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <CheckCircle2 className="w-5 h-5" /><span className="font-semibold">Resultado POSITIVO: {fmt(data.netIncome)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                <AlertCircle className="w-5 h-5" /><span className="font-semibold">Resultado NEGATIVO: {fmt(data.netIncome)}</span>
              </div>
            )}
          </div>

          {/* 1. FATURAMENTO */}
          <SectionTitle>1. Faturamento (Regime de Competencia)</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card label="Faturamento Bruto" value={fmt(data.grossRevenue)} />
            <Card label="Descontos" value={fmt(data.discounts)} positive={null} />
            <Card label="Cancelamentos" value={fmt(data.cancellations)} positive={null} />
            <Card label="Faturamento Liquido" value={fmt(data.netRevenue)} positive={data.netRevenue >= 0} />
            <Card label="Qtd Vendas" value={String(data.salesCount)} />
            <Card label="Ticket Medio" value={fmt(data.averageTicket)} />
          </div>

          {/* 2. CMV E LUCRO BRUTO */}
          <SectionTitle>2. CMV e Lucro Bruto</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card label="CMV (Custo Merc. Vendidas)" value={fmt(data.cogs)} sub={data.cogsReliability === 'PARTIAL' ? 'Confiabilidade PARCIAL' : 'Confiabilidade TOTAL'} />
            <Card label="Lucro Bruto" value={fmt(data.grossProfit)} positive={data.grossProfit >= 0} />
            <Card label="Margem Bruta" value={data.netRevenue > 0 ? fmt2((data.grossProfit / data.netRevenue) * 100) : '-'} positive={data.grossProfit >= 0} />
          </div>

          {/* 3. RESULTADO OPERACIONAL */}
          <SectionTitle>3. Resultado Operacional</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card label="Despesas Pagas" value={fmt(data.expensesPaid)} />
            <Card label="Despesas Previstas" value={fmt(data.expensesPending)} sub="A vencer no mes" />
            <Card label="Outras Receitas" value={fmt(data.otherIncomes)} />
            <Card label="Outras Despesas" value={fmt(data.otherExpenses)} />
            <Card label="Resultado Liquido" value={fmt(data.netIncome)} positive={data.netIncome >= 0} />
          </div>

          {/* 4. CAIXA */}
          <SectionTitle>4. Fluxo de Caixa (Regime de Caixa)</SectionTitle>
          <p className="text-xs text-muted-foreground mb-3">Apenas transacoes financeiras liquidadas. Vendas a prazo nao entram no caixa ate o recebimento.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card label="Saldo Inicial" value={fmt(data.cashInitial)} />
            <Card label="Entradas de Caixa" value={fmt(data.cashInflows)} positive />
            <Card label="Saidas de Caixa" value={fmt(data.cashOutflows)} />
            <Card label="Saldo Final" value={fmt(data.cashFinal)} positive={data.cashFinal >= 0} />
            <Card label="Vendas Recebidas" value={fmt(data.salesReceived)} sub="AR quitados no mes" />
            <Card label="A Receber" value={fmt(data.salesPending)} sub="AR pendentes com vencimento no mes" />
          </div>

          {/* 5. ESTOQUE */}
          <SectionTitle>5. Estoque</SectionTitle>
          <p className="text-xs text-muted-foreground mb-3">Compras de mercadoria nao sao despesa — alimentam o estoque. CMV e o custo efetivo das mercadorias saidas.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card label="Estoque Inicial" value={fmt(data.stockInitial)} />
            <Card label="Compras do Mes" value={fmt(data.stockPurchases)} sub="Entradas de estoque (AP com PO)" />
            <Card label="Estoque Final" value={fmt(data.stockFinal)} />
            <Card label="Produtos Vendidos" value={String(data.productsSold)} sub="itens em ordens validas" />
          </div>

          {/* 6. COMISSOES */}
          {data.commissionData && data.commissionData.length > 0 && (
            <>
              <SectionTitle>6. Comissoes por Vendedor</SectionTitle>
              <p className="text-xs text-muted-foreground mb-3">Base = Vendas validas - Descontos - Cancelamentos. Cancelamentos nao geram comissao.</p>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2">Vendedor</th>
                      <th className="text-right px-4 py-2">Venda Bruta</th>
                      <th className="text-right px-4 py-2">Descontos</th>
                      <th className="text-right px-4 py-2">Cancelamentos</th>
                      <th className="text-right px-4 py-2">Base de Comissao</th>
                      <th className="text-right px-4 py-2">Taxa</th>
                      <th className="text-right px-4 py-2 font-bold">Comissao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.commissionData.map((c) => (
                      <tr key={c.sellerId} className="border-t hover:bg-muted/20">
                        <td className="px-4 py-2">{c.sellerName}</td>
                        <td className="text-right px-4 py-2">{fmt(c.grossSales)}</td>
                        <td className="text-right px-4 py-2 text-red-600">-{fmt(c.discounts)}</td>
                        <td className="text-right px-4 py-2 text-red-600">-{fmt(c.cancellations)}</td>
                        <td className="text-right px-4 py-2 font-medium">{fmt(c.commissionBase)}</td>
                        <td className="text-right px-4 py-2">{fmt2(c.commissionRate * 100)}</td>
                        <td className="text-right px-4 py-2 font-bold text-green-700">{fmt(c.commissionValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TOP PRODUCTS */}
          {data.topProducts && data.topProducts.length > 0 && (
            <>
              <SectionTitle>Top Produtos por Receita</SectionTitle>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-2">Produto</th>
                      <th className="text-right px-4 py-2">Qtd Vendida</th>
                      <th className="text-right px-4 py-2">Receita</th>
                      <th className="text-right px-4 py-2">CMV</th>
                      <th className="text-right px-4 py-2">Margem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.slice(0, 10).map((p) => (
                      <tr key={p.productId} className="border-t hover:bg-muted/20">
                        <td className="px-4 py-2">{p.name}</td>
                        <td className="text-right px-4 py-2">{p.qtySold.toFixed(0)}</td>
                        <td className="text-right px-4 py-2">{fmt(p.revenue)}</td>
                        <td className="text-right px-4 py-2">{fmt(p.cogs)}</td>
                        <td className={`text-right px-4 py-2 font-medium ${p.margin >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                          {p.margin >= 0 ? <TrendingUp className="inline w-3 h-3 mr-1" /> : <TrendingDown className="inline w-3 h-3 mr-1" />}
                          {fmt2(p.margin)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* FECHAR MES */}
          {!isClosed && (
            <div className="mt-8 border-t pt-6">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div>
                  <p className="font-semibold text-amber-900">Fechar {MONTHS[month - 1]}/{year}</p>
                  <p className="text-sm text-amber-700">O fechamento congela todos os valores acima em um snapshot permanente. Vendas nao poderao ser canceladas apos o fechamento sem reabertura.</p>
                </div>
                <Button onClick={handleClose} disabled={closeM.isPending} className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white">
                  <Lock className="w-4 h-4 mr-2" />
                  {closeM.isPending ? 'Fechando...' : 'FECHAR MES'}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 shadow-xl max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-2">Reabrir Fechamento</h2>
            <p className="text-sm text-muted-foreground mb-4">Informe o motivo da reabertura. Esta acao sera registrada em auditoria.</p>
            <textarea
              className="w-full border rounded p-2 text-sm min-h-[80px] mb-4"
              placeholder="Motivo obrigatorio..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowReopenModal(false)}>Cancelar</Button>
              <Button onClick={handleReopen} disabled={reopenM.isPending} variant="destructive">
                {reopenM.isPending ? 'Reabrindo...' : 'Confirmar Reabertura'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
