'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMonthlyClosingPreview, useCloseMonth, useReopenMonth, useUpdateMonthlyClosingSettings } from '@/hooks/useMonthlyClosing';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Lock, LockOpen, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

function fmt(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function fmtPct(value: number, decimals = 1): string {
  return (value || 0).toFixed(decimals) + '%';
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function mapPaymentMethod(method: string) {
  const map: Record<string, string> = {
    CASH: 'Dinheiro',
    PIX: 'Pix',
    DEBIT_CARD: 'Debito',
    CREDIT_CARD: 'Credito',
  };
  return map[method] || method;
}

export default function FechamentoMensalPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [cashCountedInput, setCashCountedInput] = useState('');
  
  // Settings modal
  const [showSettings, setShowSettings] = useState(false);
  
  const previewQ = useMonthlyClosingPreview(month, year);
  const closeM = useCloseMonth();
  const reopenM = useReopenMonth();
  const updateSettingsM = useUpdateMonthlyClosingSettings();

  const data = previewQ.data;
  const loading = previewQ.isLoading;
  const isError = previewQ.isError;
  const isClosed = data?.status === 'CLOSED';

  // dynamic difference if open
  const cashCounted = isClosed ? (data?.cashCounted || 0) : (Number(cashCountedInput.replace(/\D/g, '')) / 100 || 0);
  const cashDifference = isClosed ? (data?.cashDifference || 0) : (cashCounted - (data?.cashFinal || 0));

  const handleClose = () => {
    closeM.mutate({ month, year, cashCounted }, {
      onSuccess: () => setShowCloseModal(false)
    });
  };

  const handleReopen = () => {
    if (!reopenReason.trim()) { alert('Informe o motivo da reabertura.'); return; }
    reopenM.mutate({ month, year, reason: reopenReason }, {
      onSuccess: () => { setShowReopenModal(false); setReopenReason(''); }
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">Fechamento Mensal</h1>
          <p className="text-muted-foreground">Analise financeira e de vendas do mes.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border rounded px-3 py-2 text-sm bg-background font-semibold"
          >
            {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded px-3 py-2 text-sm bg-background font-semibold"
          >
            {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Link href="/dashboard/fechamento-mensal/historico">
            <Button variant="outline"><History className="w-4 h-4 mr-2" />Historico</Button>
          </Link>
          <Button variant="outline" onClick={() => setShowSettings(true)}><Settings className="w-4 h-4" /></Button>

          {data && (
            isClosed ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm font-bold bg-gray-100 text-gray-700 px-4 py-2 rounded border">
                  <Lock className="w-4 h-4" /> MES FECHADO
                </div>
                <Button variant="outline" onClick={() => setShowReopenModal(true)}>
                  <LockOpen className="w-4 h-4 mr-2" /> Reabrir
                </Button>
              </div>
            ) : (
              <Button className="bg-primary text-primary-foreground font-bold" onClick={() => setShowCloseModal(true)}>
                FECHAR MES
              </Button>
            )
          )}
        </div>
      </div>

      {showCloseModal && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background p-6 rounded-xl w-full max-w-lg shadow-xl">
            <h3 className="text-2xl font-bold mb-2">Confirmar Fechamento</h3>
            <p className="text-sm text-muted-foreground mb-6">Esta acao gera um snapshot imutavel do mes {MONTHS[month - 1]}/{year}.</p>
            
            <div className="bg-slate-50 p-4 rounded-lg border mb-6 space-y-2">
              <div className="flex justify-between font-medium"><span>Faturamento:</span> <span>{fmt(data.grossRevenue)}</span></div>
              <div className="flex justify-between font-medium"><span>Lucro Bruto:</span> <span>{fmt(data.grossProfit)}</span></div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Resultado:</span> <span className={data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>{fmt(data.netIncome)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCloseModal(false)}>Cancelar</Button>
              <Button onClick={handleClose} disabled={closeM.isPending}>Confirmar Fechamento</Button>
            </div>
          </div>
        </div>
      )}

      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background p-6 rounded-xl w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-2">Reabrir Mes</h3>
            <p className="text-sm text-muted-foreground mb-4">A reabertura apaga o snapshot atual e ficara registrada na auditoria.</p>
            <Input
              value={reopenReason}
              onChange={e => setReopenReason(e.target.value)}
              className="mb-6"
              placeholder="Motivo da reabertura..."
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowReopenModal(false)}>Cancelar</Button>
              <Button onClick={handleReopen} disabled={reopenM.isPending}>Confirmar Reabertura</Button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background p-6 rounded-xl w-full max-w-lg shadow-xl">
            <h3 className="text-xl font-bold mb-4">Configuracoes de Comissao</h3>
            <p className="text-sm text-muted-foreground mb-6">As alteracoes aplicarao imediatamente a todos os meses abertos.</p>
            {/* Minimal placeholder for settings UI */}
            <p className="text-sm border p-4 bg-orange-50 text-orange-800 rounded">
              Para configurar comissoes, utilize a aba de RH ou edite as configuracoes da empresa via API.
            </p>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setShowSettings(false)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      )}

      {isError && (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-4">
          <AlertCircle className="w-8 h-8" />
          <div>
            <p className="font-bold text-lg">Erro ao carregar dados do fechamento.</p>
            <p className="text-sm opacity-90">{previewQ.error?.message || 'Tente novamente mais tarde.'}</p>
          </div>
        </div>
      )}

      {!loading && !isError && data && (
        <div className="space-y-6">

          {/* 3. RESUMO EXECUTIVO DO MES */}
          <section className="border rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-4">
              <h2 className="text-lg font-bold tracking-wider">RESUMO EXECUTIVO DO MES — {MONTHS[month-1].toUpperCase()}/{year}</h2>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Faturamento</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{fmt(data.grossRevenue)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Qtd Vendas</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{data.salesCount}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Ticket Medio</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{fmt(data.averageTicket)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Recebido</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{fmt(data.salesReceived)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">A Receber</p>
                <p className="text-2xl font-bold text-orange-500 mt-1">{fmt(data.salesPending)}</p>
              </div>
              
              <div className="col-span-2 md:col-span-5 border-t border-slate-100 my-2"></div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">CMV</p>
                <p className="text-2xl font-bold text-red-500 mt-1">{fmt(data.cogs)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Lucro Bruto</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{fmt(data.grossProfit)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Despesas</p>
                <p className="text-2xl font-bold text-red-500 mt-1">{fmt(data.expensesPaid + data.expensesPending)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Margem Bruta</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{fmtPct(data.grossRevenue ? (data.grossProfit/data.grossRevenue)*100 : 0)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Margem Liquida</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{fmtPct(data.grossRevenue ? (data.netIncome/data.grossRevenue)*100 : 0)}</p>
              </div>
            </div>
            
            <div className={`p-4 border-t flex items-center justify-between ${data.netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2">
                {data.netIncome >= 0 ? <CheckCircle2 className="text-green-600" /> : <AlertCircle className="text-red-600" />}
                <span className={`font-bold text-lg ${data.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  RESULTADO {data.netIncome >= 0 ? 'POSITIVO' : 'NEGATIVO'}
                </span>
              </div>
              <span className={`font-black text-3xl tracking-tight ${data.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {fmt(data.netIncome)}
              </span>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. FECHAMENTO DO CAIXA */}
            <section className="border rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50 border-b p-4">
                <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Fechamento do Caixa</h2>
              </div>
              <div className="p-6 flex-1 flex flex-col space-y-4 text-sm">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">SALDO INICIAL</span>
                  <span>{fmt(data.cashInitial)}</span>
                </div>
                <div className="flex justify-between text-green-700 font-medium">
                  <span>+ ENTRADAS (Dinheiro, Pix, Cartoes)</span>
                  <span>{fmt(data.cashInflows)}</span>
                </div>
                <div className="flex justify-between text-red-600 font-medium">
                  <span>- SAIDAS (Sangrias, Despesas)</span>
                  <span>{fmt(data.cashOutflows)}</span>
                </div>
                <hr className="border-slate-100" />
                <div className="flex justify-between font-bold text-base text-blue-700">
                  <span>= SALDO ESPERADO</span>
                  <span>{fmt(data.cashFinal)}</span>
                </div>

                <div className="mt-6 p-4 bg-slate-50 border rounded-xl space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Dinheiro Contado (Fisico)</label>
                    {isClosed ? (
                      <p className="text-xl font-bold mt-1">{fmt(cashCounted)}</p>
                    ) : (
                      <Input 
                        value={cashCountedInput}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setCashCountedInput(raw ? fmt(Number(raw)/100) : '');
                        }}
                        placeholder="R$ 0,00"
                        className="text-lg font-semibold mt-1"
                      />
                    )}
                  </div>
                  
                  <div className={`flex justify-between items-center p-3 rounded-lg border ${Math.abs(cashDifference) < 0.01 ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'}`}>
                    <span className="font-bold text-sm uppercase">
                      {Math.abs(cashDifference) < 0.01 ? 'Caixa Conferido' : 'Diferenca de Caixa'}
                    </span>
                    <span className="font-black text-lg">{fmt(cashDifference)}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. FORMAS DE PAGAMENTO */}
            <section className="border rounded-2xl bg-white shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50 border-b p-4">
                <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Formas de Pagamento (Recebido)</h2>
              </div>
              <div className="p-6 flex-1 text-sm space-y-4">
                {data.paymentForms && data.paymentForms.length > 0 ? (
                  data.paymentForms.map((pf) => (
                    <div key={pf.method} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                      <span className="font-medium text-slate-700">{mapPaymentMethod(pf.method).toUpperCase()}</span>
                      <span className="font-bold text-base">{fmt(pf.amount)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">Nenhum pagamento recebido no periodo.</p>
                )}
                
                <hr className="border-slate-100" />
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border font-bold text-base">
                  <span className="text-slate-600 uppercase">Total Recebido</span>
                  <span className="text-green-700">{fmt(data.salesReceived)}</span>
                </div>
                <p className="text-xs text-slate-400 text-center">* Vendas a prazo pendentes nao entram no recebido.</p>
              </div>
            </section>

          </div>

          {/* 4. RESULTADO DO MES (Detalhamento P&L) */}
          <section className="border rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b p-4">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Detalhamento do Resultado (DRE Simplificada)</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between font-medium"><span>Faturamento Bruto</span> <span>{fmt(data.grossRevenue)}</span></div>
                <div className="flex justify-between text-red-500"><span>(-) Descontos</span> <span>{fmt(data.discounts)}</span></div>
                <div className="flex justify-between text-red-500"><span>(-) Cancelamentos</span> <span>{fmt(data.cancellations)}</span></div>
                <div className="flex justify-between text-red-500"><span>(-) Devolucoes</span> <span>{fmt(data.returns)}</span></div>
                <hr className="border-slate-100" />
                <div className="flex justify-between font-bold text-base"><span>= Faturamento Liquido</span> <span>{fmt(data.netRevenue)}</span></div>
                <div className="flex justify-between text-red-500 pt-2"><span>(-) CMV (Custo da Mercadoria)</span> <span>{fmt(data.cogs)}</span></div>
                <hr className="border-slate-100" />
                <div className="flex justify-between font-bold text-base text-blue-700"><span>= Lucro Bruto</span> <span>{fmt(data.grossProfit)}</span></div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between font-medium text-blue-700"><span>Lucro Bruto</span> <span>{fmt(data.grossProfit)}</span></div>
                <div className="flex justify-between text-green-600"><span>(+) Outras Receitas</span> <span>{fmt(data.otherIncomes)}</span></div>
                <div className="flex justify-between text-red-500"><span>(-) Despesas Pagas</span> <span>{fmt(data.expensesPaid)}</span></div>
                <div className="flex justify-between text-red-500"><span>(-) Despesas Pendentes (Mes)</span> <span>{fmt(data.expensesPending)}</span></div>
                <div className="flex justify-between text-red-500"><span>(-) Outras Saidas</span> <span>{fmt(data.otherExpenses)}</span></div>
                <hr className="border-slate-100 mt-6" />
                <div className="flex justify-between font-black text-lg pt-1">
                  <span>= Resultado Final</span> 
                  <span className={data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>{fmt(data.netIncome)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 5. DESEMPENHO DA EQUIPE */}
          <section className="border rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b p-4">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Desempenho da Equipe e Comissoes</h2>
            </div>
            <div className="p-0 overflow-x-auto">
              {data.commissionData && data.commissionData.length > 0 ? (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-white border-b text-slate-500">
                      <th className="px-6 py-4 font-semibold uppercase text-xs">Vendedor</th>
                      <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Qtd</th>
                      <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Meta (R$)</th>
                      <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Vendido (Liq)</th>
                      <th className="px-6 py-4 font-semibold uppercase text-xs text-right">% Meta</th>
                      <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Taxa</th>
                      <th className="px-6 py-4 font-semibold uppercase text-xs text-right">Comissao</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.commissionData.map((c: any) => (
                      <tr key={c.sellerId} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{c.sellerName}</td>
                        <td className="px-6 py-4 text-right font-medium">{c.salesCount}</td>
                        <td className="px-6 py-4 text-right text-slate-500">{fmt(c.goal)}</td>
                        <td className="px-6 py-4 text-right font-semibold">{fmt(c.commissionBase)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${c.goalPct >= 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {fmtPct(c.goalPct)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500">{fmtPct(c.commissionRate * 100)}</td>
                        <td className="px-6 py-4 text-right font-black text-green-600">{fmt(c.commissionValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma venda atribuida a vendedores neste periodo.
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t text-xs text-slate-400">
              * A comissao incide sobre as vendas liquidas (Faturamento - Descontos - Cancelamentos).
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
