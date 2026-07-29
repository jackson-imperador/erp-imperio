'use client';

import { useState, useMemo } from 'react';
import { useWithdrawals } from '@/hooks/usePDV';
import { useCashDrawers } from '@/hooks/usePDV';
import {
  Landmark, Download, Filter, Search, X, TrendingDown,
  Calendar, MonitorSmartphone, User, MapPin, Eye, Printer,
  ChevronLeft, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

/* ─── Design tokens (identidade visual Imperio) ─────────────────────────────── */
const G = {
  bg:       '#0a0908',
  surface:  '#0e0c0a',
  card:     '#111010',
  border:   '#2a2215',
  borderG:  'rgba(201,148,26,0.28)',
  gold:     '#c9941a',
  goldL:    '#e8b84b',
  goldBg:   'rgba(201,148,26,0.08)',
  goldGlow: 'rgba(201,148,26,0.40)',
  green:    '#22c55e',
  greenBg:  'rgba(34,197,94,0.10)',
  greenBrd: 'rgba(34,197,94,0.28)',
  red:      '#ef4444',
  redBg:    'rgba(239,68,68,0.10)',
  redBrd:   'rgba(239,68,68,0.28)',
  amber:    '#f59e0b',
  amberBg:  'rgba(245,158,11,0.08)',
  amberBrd: 'rgba(245,158,11,0.28)',
  muted:    '#7a6840',
  text:     '#f0e8d8',
  dim:      '#4a3e28',
};

const DESTINATIONS: Record<string, string> = {
  SAFE: 'Cofre', BANK: 'Banco', PAYMENTS: 'Pagamentos',
  TROCO: 'Troco', ADMIN: 'Administrativo', FINANCIAL: 'Financeiro', OTHER: 'Outro',
};

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── PDF Export utility ────────────────────────────────────────────────────── */
function exportPDF(items: any[], filters: any, total: number) {
  const win = window.open('', '_blank')!;
  const rows = items.map(m => `
    <tr>
      <td>R$ ${fmt(m.amount)}</td>
      <td>${DESTINATIONS[m.destination] || m.destination || '—'}</td>
      <td>${m.reason || '—'}</td>
      <td>${m.performedBy || '—'}</td>
      <td>${m.terminal || '—'}</td>
      <td>R$ ${fmt(m.balanceBefore || 0)}</td>
      <td>R$ ${fmt(m.balanceAfter || 0)}</td>
      <td>${new Date(m.createdAt).toLocaleDateString('pt-BR')}</td>
      <td>${new Date(m.createdAt).toLocaleTimeString('pt-BR')}</td>
      <td>${m.observacao || '—'}</td>
    </tr>
  `).join('');

  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>Sangrias — ERP Império</title>
    <meta charset="utf-8"/>
    <style>
      body { font-family: 'Arial', sans-serif; background: #fff; color: #222; padding: 24px; }
      h1 { font-size: 22px; color: #c9941a; margin-bottom: 4px; }
      .sub { color: #666; font-size: 12px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #c9941a; color: #fff; padding: 8px 10px; text-align: left; }
      td { padding: 7px 10px; border-bottom: 1px solid #eee; }
      tr:nth-child(even) td { background: #faf8f4; }
      .total { margin-top: 16px; text-align: right; font-size: 14px; font-weight: bold; color: #c9941a; }
      @media print { button { display: none; } }
    </style></head><body>
    <h1>⚡ ERP Império — Relatório de Sangrias</h1>
    <div class="sub">Gerado em ${new Date().toLocaleString('pt-BR')}</div>
    <table>
      <thead><tr>
        <th>Valor</th><th>Destino</th><th>Motivo</th><th>Operador</th>
        <th>Terminal</th><th>Saldo Antes</th><th>Saldo Depois</th><th>Data</th><th>Hora</th><th>Observação</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="total">Total: R$ ${fmt(total)}</div>
    <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
    </body></html>
  `);
  win.document.close();
}

/* ─── Excel/CSV Export utility ──────────────────────────────────────────────── */
function exportExcel(items: any[], total: number) {
  const headers = ['Valor', 'Destino', 'Motivo', 'Operador', 'Terminal', 'Saldo Antes', 'Saldo Depois', 'Data', 'Hora', 'Observação', 'IP'];
  const rows = items.map(m => [
    m.amount,
    DESTINATIONS[m.destination] || m.destination || '',
    m.reason || '',
    m.performedBy || '',
    m.terminal || '',
    m.balanceBefore ? fmt(m.balanceBefore) : '0,00',
    m.balanceAfter ? fmt(m.balanceAfter) : '0,00',
    new Date(m.createdAt).toLocaleDateString('pt-BR'),
    new Date(m.createdAt).toLocaleTimeString('pt-BR'),
    m.observacao || '',
    m.ipAddress || '',
  ]);

  const csvContent = [headers, ...rows, ['', '', '', '', '', '', 'TOTAL', fmt(total), '']]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sangrias_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Detail Modal ───────────────────────────────────────────────────────────── */
function DetailModal({ item, onClose }: { item: any; onClose: () => void }) {
  if (!item) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
      <div style={{ width: '100%', maxWidth: 440, borderRadius: 20, background: '#0f0d0a', border: `1px solid ${G.amberBrd}`, overflow: 'hidden', boxShadow: `0 24px 80px rgba(0,0,0,0.8)` }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${G.amber}, #f97316, ${G.amber})` }} />
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>Detalhe da Sangria</h3>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: G.dim, cursor: 'pointer' }}><X style={{ width: 18, height: 18 }} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Valor', `R$ ${fmt(item.amount)}`, G.amber],
              ['Destino', DESTINATIONS[item.destination] || item.destination || '—', G.text],
              ['Motivo', item.reason || '—', G.text],
              ['Terminal', item.terminal || '—', G.goldL],
              ['Saldo Antes', `R$ ${fmt(item.balanceBefore || 0)}`, G.muted],
              ['Saldo Depois', `R$ ${fmt(item.balanceAfter || 0)}`, G.muted],
              ['Operador', item.performedBy || '—', G.text],
              ['Data/Hora', `${new Date(item.createdAt).toLocaleDateString('pt-BR')} às ${new Date(item.createdAt).toLocaleTimeString('pt-BR')}`, G.muted],
              ['Observação', item.observacao || '—', G.muted],
              ['IP', item.ipAddress || '—', G.dim],
              ['ID', item.id, G.dim],
            ].map(([label, value, color]) => (
              <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: '#0a0906', border: `1px solid ${G.border}` }}>
                <span style={{ fontSize: 11, color: G.muted, fontWeight: 600 }}>{label as string}</span>
                <span style={{ fontSize: 12, color: color as string, fontWeight: 700, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{value as string}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { exportPDF([item], {}, item.amount); }}
            style={{ marginTop: 14, width: '100%', height: 38, borderRadius: 10, background: G.amberBg, border: `1px solid ${G.amberBrd}`, color: G.amber, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Printer style={{ width: 13, height: 13 }} /> Imprimir esta sangria
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
/* MAIN PAGE                                                                    */
/* ════════════════════════════════════════════════════════════════════════════ */
export default function SangriasFinanceiroPage() {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate]   = useState(today);
  const [endDate, setEndDate]       = useState(today);
  const [drawerId, setDrawerId]     = useState('');
  const [destination, setDestination] = useState('');
  const [search, setSearch]         = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: drawers = [] }      = useCashDrawers();
  const { data: result, isLoading, refetch } = useWithdrawals({
    startDate: startDate || undefined,
    endDate:   endDate   || undefined,
    drawerId:  drawerId  || undefined,
    destination: destination || undefined,
  });

  const items  = result?.items || [];
  const total  = result?.total || 0;
  const count  = result?.count || 0;

  // Filtro de busca local
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(m =>
      (m.terminal?.toLowerCase().includes(q)) ||
      (m.performedBy?.toLowerCase().includes(q)) ||
      (m.reason?.toLowerCase().includes(q)) ||
      (m.observacao?.toLowerCase().includes(q)) ||
      (m.destination && DESTINATIONS[m.destination]?.toLowerCase().includes(q))
    );
  }, [items, search]);

  const cardSt = (accent: string, bg: string, brd: string): React.CSSProperties => ({
    padding: '14px 18px', borderRadius: 14,
    background: bg, border: `1px solid ${brd}`,
    display: 'flex', flexDirection: 'column', gap: 4,
  });

  const inputSt: React.CSSProperties = {
    padding: '8px 12px', borderRadius: 10, fontSize: 13,
    background: '#0d0b09', border: `1px solid ${G.border}`,
    color: '#fff', outline: 'none', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: G.bg, padding: '24px 28px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Link href="/dashboard/financeiro">
              <button style={{ padding: '6px 8px', borderRadius: 8, background: 'transparent', border: `1px solid ${G.border}`, color: G.muted, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = G.borderG; e.currentTarget.style.color = G.goldL; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; }}>
                <ChevronLeft style={{ width: 15, height: 15 }} />
              </button>
            </Link>
            <div style={{ padding: 10, borderRadius: 12, background: G.amberBg, border: `1px solid ${G.amberBrd}` }}>
              <Landmark style={{ width: 20, height: 20, color: G.amber }} />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Sangrias</h1>
              <p style={{ fontSize: 13, color: G.muted, marginTop: 2 }}>Histórico completo auditável de retiradas de caixa</p>
            </div>
          </div>
        </div>

        {/* Botões de exportação */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => refetch()}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: G.goldBg, border: `1px solid ${G.borderG}`, color: G.goldL, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <RefreshCw style={{ width: 13, height: 13 }} /> Atualizar
          </button>
          <button onClick={() => exportExcel(filtered, total)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: G.greenBg, border: `1px solid ${G.greenBrd}`, color: G.green, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <Download style={{ width: 13, height: 13 }} /> Excel
          </button>
          <button onClick={() => exportPDF(filtered, { startDate, endDate }, total)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: G.redBg, border: `1px solid ${G.redBrd}`, color: G.red, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <Printer style={{ width: 13, height: 13 }} /> PDF
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <div style={cardSt(G.amber, G.amberBg, G.amberBrd)}>
          <span style={{ fontSize: 10, color: G.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Sangrado</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: G.amber }}>R$ {fmt(total)}</span>
          <span style={{ fontSize: 11, color: G.dim }}>{count} sangria{count !== 1 ? 's' : ''}</span>
        </div>
        <div style={cardSt(G.red, G.redBg, G.redBrd)}>
          <span style={{ fontSize: 10, color: G.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Maior Sangria</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: G.red }}>
            R$ {fmt(items.reduce((max, m) => Math.max(max, m.amount), 0))}
          </span>
          <span style={{ fontSize: 11, color: G.dim }}>no período</span>
        </div>
        <div style={cardSt(G.goldL, G.goldBg, G.borderG)}>
          <span style={{ fontSize: 10, color: G.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Média por Sangria</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: G.goldL }}>
            R$ {fmt(count > 0 ? total / count : 0)}
          </span>
          <span style={{ fontSize: 11, color: G.dim }}>por operação</span>
        </div>
        <div style={cardSt(G.green, G.greenBg, G.greenBrd)}>
          <span style={{ fontSize: 10, color: G.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Exibindo</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: G.green }}>{filtered.length}</span>
          <span style={{ fontSize: 11, color: G.dim }}>de {count} registros</span>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div style={{ background: G.card, borderRadius: 16, border: `1px solid ${G.border}`, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Filter style={{ width: 14, height: 14, color: G.gold }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: G.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Filtros</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          <div>
            <label style={{ fontSize: 10, color: G.dim, fontWeight: 600, display: 'block', marginBottom: 4 }}>Data Inicial</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputSt, width: '100%' }}
              onFocus={e => { e.currentTarget.style.borderColor = G.borderG; }} onBlur={e => { e.currentTarget.style.borderColor = G.border; }} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: G.dim, fontWeight: 600, display: 'block', marginBottom: 4 }}>Data Final</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputSt, width: '100%' }}
              onFocus={e => { e.currentTarget.style.borderColor = G.borderG; }} onBlur={e => { e.currentTarget.style.borderColor = G.border; }} />
          </div>
          <div>
            <label style={{ fontSize: 10, color: G.dim, fontWeight: 600, display: 'block', marginBottom: 4 }}>Terminal</label>
            <select value={drawerId} onChange={e => setDrawerId(e.target.value)} style={{ ...inputSt, width: '100%', cursor: 'pointer' }}>
              <option value="">Todos os terminais</option>
              {(drawers as any[]).map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: G.dim, fontWeight: 600, display: 'block', marginBottom: 4 }}>Destino</label>
            <select value={destination} onChange={e => setDestination(e.target.value)} style={{ ...inputSt, width: '100%', cursor: 'pointer' }}>
              <option value="">Todos os destinos</option>
              {Object.entries(DESTINATIONS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 10, color: G.dim, fontWeight: 600, display: 'block', marginBottom: 4 }}>Pesquisar</label>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, color: G.dim, pointerEvents: 'none' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Operador, motivo..."
                style={{ ...inputSt, width: '100%', paddingLeft: 30 }}
                onFocus={e => { e.currentTarget.style.borderColor = G.borderG; }} onBlur={e => { e.currentTarget.style.borderColor = G.border; }} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: G.dim, cursor: 'pointer' }}><X style={{ width: 12, height: 12 }} /></button>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabela ── */}
      <div style={{ background: G.card, borderRadius: 16, border: `1px solid ${G.border}`, overflow: 'hidden' }}>
        {/* Cabeçalho */}
        <div style={{ display: 'grid', gridTemplateColumns: '110px 100px 140px 120px 110px 95px 95px 80px 70px 1fr 90px', gap: 0, padding: '11px 16px', borderBottom: `1px solid ${G.border}`, background: '#0d0b09' }}>
          {['Valor', 'Destino', 'Motivo', 'Operador', 'Terminal', 'S. Antes', 'S. Depois', 'Data', 'Hora', 'Observação', 'Ações'].map((h) => (
            <span key={h} style={{ fontSize: 9, color: G.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
          ))}
        </div>

        {/* Corpo */}
        {isLoading ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: G.muted, fontSize: 13 }}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 16px', textAlign: 'center' }}>
            <TrendingDown style={{ width: 36, height: 36, color: G.dim, opacity: 0.4, margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: G.muted, fontWeight: 600 }}>Nenhuma sangria encontrada</p>
            <p style={{ fontSize: 12, color: G.dim, marginTop: 4 }}>Ajuste os filtros ou realize uma sangria no Caixa Livre.</p>
          </div>
        ) : (
          <div style={{ maxHeight: 520, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: `${G.border} transparent` }}>
            {filtered.map((m, i) => (
              <div key={m.id}
                style={{
                  display: 'grid', gridTemplateColumns: '110px 100px 140px 120px 110px 95px 95px 80px 70px 1fr 90px',
                  gap: 0, padding: '12px 16px',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${G.border}` : 'none',
                  transition: 'background 0.15s',
                  background: 'transparent',
                }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background = G.goldBg; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 13, fontWeight: 900, color: G.amber }}>R$ {fmt(m.amount)}</span>
                <span style={{ fontSize: 11, color: G.text }}>
                  {(m.destination && DESTINATIONS[m.destination]) || m.destination || '—'}
                </span>
                <span style={{ fontSize: 11, color: G.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.reason || '—'}
                </span>
                <span style={{ fontSize: 11, color: G.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.performedBy || '—'}
                </span>
                <span style={{ fontSize: 11, color: G.goldL, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.terminal || '—'}
                </span>
                <span style={{ fontSize: 11, color: G.dim }}>R$ {fmt(m.balanceBefore || 0)}</span>
                <span style={{ fontSize: 11, color: G.muted }}>R$ {fmt(m.balanceAfter || 0)}</span>
                <span style={{ fontSize: 11, color: G.muted }}>{new Date(m.createdAt).toLocaleDateString('pt-BR')}</span>
                <span style={{ fontSize: 11, color: G.muted }}>{new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                <span style={{ fontSize: 11, color: G.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                  {m.observacao || '—'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setSelectedItem(m)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 7, background: G.goldBg, border: `1px solid ${G.borderG}`, color: G.goldL, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    <Eye style={{ width: 11, height: 11 }} /> Ver
                  </button>
                  <button onClick={() => exportPDF([m], {}, m.amount)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 7, background: G.redBg, border: `1px solid ${G.redBrd}`, color: G.red, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                    <Printer style={{ width: 11, height: 11 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer com total */}
        {filtered.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${G.borderG}`, background: G.amberBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: G.muted }}>{filtered.length} registro{filtered.length !== 1 ? 's' : ''} exibidos</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: G.muted }}>Total do período:</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: G.amber }}>R$ {fmt(filtered.reduce((s, m) => s + m.amount, 0))}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
