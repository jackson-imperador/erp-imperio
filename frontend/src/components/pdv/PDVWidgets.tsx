'use client';

import { PdvDashboardMetrics, CashDrawer } from '@/types/pdv';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  MonitorSmartphone,
  Delete,
  CornerDownLeft,
} from 'lucide-react';

/* ─── Design Tokens ─────────────────────────────────────────────────────────── */
const G = {
  bg:       '#0a0908',
  surface:  '#111010',
  card:     '#181510',
  border:   '#2a2215',
  gold:     '#c9941a',
  goldL:    '#e8b84b',
  goldXL:   '#f5d060',
  goldBg:   'rgba(201,148,26,0.10)',
  goldBrd:  'rgba(201,148,26,0.28)',
  goldGlow: 'rgba(201,148,26,0.40)',
  muted:    '#7a6840',
  text:     '#f0e8d8',
};

/* ─── PdvSummaryCards ────────────────────────────────────────────────────────── */

import Link from 'next/link';

export function PdvSummaryCards({ metrics }: { metrics?: PdvDashboardMetrics | null }) {
  const cards = [
    {
      title: 'Vendas Hoje',
      value: metrics?.totalSalesToday || 0,
      icon: ShoppingCart,
      accent: '#c9941a',
      glow:   'rgba(201,148,26,0.25)',
      href: '/dashboard/vendas'
    },
    {
      title: 'Faturamento',
      value: `R$ ${(metrics?.totalRevenueToday || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      accent: '#22c55e',
      glow:   'rgba(34,197,94,0.20)',
      href: '/dashboard/vendas'
    },
    {
      title: 'Ticket Médio',
      value: `R$ ${(metrics?.avgTicket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      accent: '#e8b84b',
      glow:   'rgba(232,184,75,0.20)',
      href: '/dashboard/bi/comercial'
    },
    {
      title: 'Caixas Ativos',
      value: metrics?.activeDrawers || 0,
      icon: MonitorSmartphone,
      accent: '#c9941a',
      glow:   'rgba(201,148,26,0.20)',
      href: '/dashboard/pdv/caixas'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const content = (
          <div
            style={{
              background: `linear-gradient(135deg, ${G.card} 0%, ${G.surface} 100%)`,
              border: `1px solid ${G.border}`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,148,26,0.06)`,
              borderRadius: 16,
            }}
            className="relative overflow-hidden p-5 flex items-center gap-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          >
            <div
              style={{
                background: `rgba(${c.accent === '#c9941a' ? '201,148,26' : c.accent === '#22c55e' ? '34,197,94' : '232,184,75'},0.12)`,
                border: `1px solid rgba(${c.accent === '#c9941a' ? '201,148,26' : c.accent === '#22c55e' ? '34,197,94' : '232,184,75'},0.25)`,
                borderRadius: 12,
                padding: 10,
              }}
            >
              <c.icon style={{ width: 22, height: 22, color: c.accent }} />
            </div>
            <div className="min-w-0">
              <p style={{ fontSize: 11, color: G.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {c.title}
              </p>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.2, marginTop: 2 }}>
                {c.value}
              </p>
            </div>
            {/* Gold corner accent */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: 3, height: '100%', background: `linear-gradient(180deg, ${c.accent} 0%, transparent 100%)`, borderRadius: '0 16px 16px 0', opacity: 0.6 }} />
          </div>
        );
        return c.href ? <Link key={i} href={c.href} className="block">{content}</Link> : <div key={i}>{content}</div>;
      })}
    </div>
  );
}

/* ─── CashDrawerCard ─────────────────────────────────────────────────────────── */

export function CashDrawerCard({
  drawer,
  onOpen,
  onClose,
}: {
  drawer: CashDrawer;
  onOpen?: () => void;
  onClose?: () => void;
}) {
  const isOpen = drawer.status === 'OPEN';

  return (
    <div
      style={{
        background: isOpen
          ? `linear-gradient(135deg, #0d1a0a 0%, ${G.surface} 100%)`
          : `linear-gradient(135deg, ${G.card} 0%, ${G.surface} 100%)`,
        border: isOpen ? '1px solid rgba(34,197,94,0.30)' : `1px solid ${G.border}`,
        boxShadow: isOpen
          ? '0 4px 32px rgba(34,197,94,0.12), 0 0 0 1px rgba(34,197,94,0.06)'
          : '0 4px 24px rgba(0,0,0,0.4)',
        borderRadius: 18,
      }}
      className="relative overflow-hidden p-6 flex flex-col justify-between transition-all duration-200 hover:scale-[1.01]"
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: isOpen
            ? 'linear-gradient(90deg, #22c55e, #16a34a)'
            : `linear-gradient(90deg, ${G.gold}, ${G.goldL})`,
          borderRadius: '18px 18px 0 0',
        }}
      />

      <div>
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: isOpen ? '#22c55e' : G.muted,
                  boxShadow: isOpen ? '0 0 10px rgba(34,197,94,0.8)' : 'none',
                }}
                className={isOpen ? 'animate-pulse' : ''}
              />
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{drawer.name}</h3>
            </div>
            <p style={{ fontSize: 12, color: G.muted }}>
              Operador:{' '}
              <span style={{ color: G.text, fontWeight: 600 }}>{drawer.operatorName || 'Nenhum'}</span>
            </p>
          </div>
          <span
            style={{
              fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
              background: isOpen ? 'rgba(34,197,94,0.12)' : 'rgba(100,80,40,0.2)',
              border: isOpen ? '1px solid rgba(34,197,94,0.3)' : `1px solid ${G.border}`,
              color: isOpen ? '#4ade80' : G.muted,
            }}
          >
            {isOpen ? '● Aberto' : '○ Fechado'}
          </span>
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between items-center" style={{ fontSize: 13 }}>
            <span style={{ color: G.muted }}>Saldo Inicial</span>
            <span style={{ color: G.text, fontWeight: 600 }}>
              R$ {(drawer.initialBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{ height: 1, background: G.border }} />
          <div className="flex justify-between items-center">
            <span style={{ fontSize: 13, color: G.text, fontWeight: 700 }}>Saldo Atual</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: isOpen ? '#4ade80' : G.goldL }}>
              R$ {(drawer.currentBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {isOpen ? (
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 12,
              background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)',
              color: '#f87171', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.20)')}
            onMouseOut={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.10)')}
          >
            Fechar Caixa
          </button>
        ) : (
          <button
            onClick={onOpen}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 12,
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              border: 'none', color: '#0a0908', fontWeight: 800, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: `0 4px 20px ${G.goldGlow}`,
            }}
            onMouseOver={e => (e.currentTarget.style.boxShadow = `0 6px 28px rgba(201,148,26,0.6)`)}
            onMouseOut={e => (e.currentTarget.style.boxShadow = `0 4px 20px ${G.goldGlow}`)}
          >
            Abrir Caixa
          </button>
        )}
      </div>

      {/* Decorative circle */}
      <div style={{ position: 'absolute', right: -24, bottom: -24, width: 80, height: 80, borderRadius: '50%', background: isOpen ? 'rgba(34,197,94,0.07)' : G.goldBg }} />
    </div>
  );
}

/* ─── NumericKeyboard ────────────────────────────────────────────────────────── */

export function NumericKeyboard({
  onInput,
  onBackspace,
  onEnter,
}: {
  onInput: (val: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}) {
  const buttons = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '00', '.'];

  const btnBase: React.CSSProperties = {
    height: 48, borderRadius: 10,
    background: G.card, border: `1px solid ${G.border}`,
    color: G.text, fontSize: 18, fontWeight: 700,
    cursor: 'pointer', transition: 'all 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {buttons.map((b) => (
        <button
          key={b}
          onClick={() => onInput(b)}
          style={btnBase}
          onMouseOver={e => { e.currentTarget.style.border = `1px solid ${G.goldBrd}`; e.currentTarget.style.color = G.goldXL; }}
          onMouseOut={e => { e.currentTarget.style.border = `1px solid ${G.border}`; e.currentTarget.style.color = G.text; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
          onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {b}
        </button>
      ))}

      {/* Backspace */}
      <button
        onClick={onBackspace}
        style={{ ...btnBase, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <Delete style={{ width: 18, height: 18 }} />
      </button>

      {/* Enter */}
      <button
        onClick={onEnter}
        style={{
          ...btnBase,
          gridColumn: 'span 2',
          background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
          border: 'none', color: '#0a0908',
          boxShadow: `0 4px 16px ${G.goldGlow}`,
          fontSize: 13, gap: 6,
        }}
        onMouseOver={e => { e.currentTarget.style.boxShadow = `0 6px 24px rgba(201,148,26,0.55)`; }}
        onMouseOut={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${G.goldGlow}`; }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <CornerDownLeft style={{ width: 16, height: 16 }} />
        ENTER
      </button>
    </div>
  );
}
