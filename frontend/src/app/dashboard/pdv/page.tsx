'use client';

import { usePdvDashboard } from '@/hooks/usePDV';
import { PdvSummaryCards } from '@/components/pdv/PDVWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, MonitorSmartphone, Zap, TrendingUp, Clock, Crown } from 'lucide-react';
import Link from 'next/link';

const G = {
  bg:      '#0a0908',
  card:    '#111010',
  border:  '#2a2215',
  gold:    '#c9941a',
  goldL:   '#e8b84b',
  goldBg:  'rgba(201,148,26,0.09)',
  goldBrd: 'rgba(201,148,26,0.28)',
  goldGlow:'rgba(201,148,26,0.40)',
  muted:   '#7a6840',
  text:    '#f0e8d8',
};

export default function PdvDashboardPage() {
  const { data: metrics, isLoading } = usePdvDashboard();

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div style={{ padding: 8, borderRadius: 12, background: G.goldBg, border: `1px solid ${G.goldBrd}` }}>
              <Crown style={{ width: 20, height: 20, color: G.gold }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              PDV &amp; Frente de Caixa
            </h1>
          </div>
          <p style={{ fontSize: 13, color: G.muted, marginLeft: 4 }}>
            Gestão de caixas, sangrias, suprimentos e cupom fiscal (NFC-e)
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/pdv/caixas">
            <button
              style={{
                padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.border}`,
                color: G.text, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.border = `1px solid ${G.goldBrd}`; e.currentTarget.style.color = G.goldL; }}
              onMouseOut={e => { e.currentTarget.style.border = `1px solid ${G.border}`; e.currentTarget.style.color = G.text; }}
            >
              <MonitorSmartphone style={{ width: 15, height: 15 }} />
              Terminais
            </button>
          </Link>
          <Link href="/dashboard/pdv/caixa">
            <button
              style={{
                padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 800,
                background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                border: 'none', color: '#0a0908', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: `0 4px 20px ${G.goldGlow}`,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = `0 6px 28px rgba(201,148,26,0.55)`; }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${G.goldGlow}`; }}
            >
              <ShoppingCart style={{ width: 15, height: 15 }} />
              Abrir Frente de Caixa
            </button>
          </Link>
        </div>
      </div>

      {/* ── Metrics ── */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 96, borderRadius: 16, background: G.card, border: `1px solid ${G.border}` }} className="animate-pulse" />
          ))}
        </div>
      ) : (
        <PdvSummaryCards metrics={metrics} />
      )}

      {/* ── Quick Access ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            href: '/dashboard/pdv/caixa',
            icon: ShoppingCart,
            label: 'Frente de Caixa',
            desc: 'Iniciar nova venda no terminal PDV',
            accent: G.gold,
            glow: G.goldGlow,
          },
          {
            href: '/dashboard/pdv/caixas',
            icon: MonitorSmartphone,
            label: 'Terminais de Caixa',
            desc: 'Gerenciar e monitorar gaveteiros',
            accent: '#e8b84b',
            glow: 'rgba(232,184,75,0.35)',
          },
          {
            href: '/dashboard/bi/comercial',
            icon: TrendingUp,
            label: 'Desempenho',
            desc: 'Métricas e relatórios em tempo real',
            accent: '#22c55e',
            glow: 'rgba(34,197,94,0.30)',
          },
        ].map(({ href, icon: Icon, label, desc, accent, glow }) => (
          <Link key={href} href={href} className="group block">
            <div
              style={{
                background: `linear-gradient(135deg, ${G.card} 0%, ${G.bg} 100%)`,
                border: `1px solid ${G.border}`,
                borderRadius: 18, padding: 24,
                boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
                transition: 'all 0.25s', overflow: 'hidden', position: 'relative',
              }}
              onMouseOver={e => {
                e.currentTarget.style.border = `1px solid ${accent}50`;
                e.currentTarget.style.boxShadow = `0 8px 40px ${glow}`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.border = `1px solid ${G.border}`;
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.35)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: '18px 18px 0 0' }} />

              <div className="flex items-start gap-4">
                <div style={{ padding: 12, borderRadius: 14, background: `${accent}15`, border: `1px solid ${accent}30`, flexShrink: 0 }}>
                  <Icon style={{ width: 26, height: 26, color: accent }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{label}</h3>
                  <p style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>{desc}</p>
                </div>
              </div>

              <div style={{ position: 'absolute', right: -20, bottom: -20, width: 80, height: 80, borderRadius: '50%', background: `${accent}10` }} />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Shortcut hint ── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          borderRadius: 12, border: `1px solid ${G.border}`,
          padding: '14px 18px', background: 'rgba(201,148,26,0.04)',
        }}
      >
        <Zap style={{ width: 15, height: 15, color: G.gold, flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: G.muted }}>
          <span style={{ color: '#fff', fontWeight: 700 }}>Dica:</span>{' '}
          Acesse a Frente de Caixa pressionando{' '}
          <kbd style={{ padding: '2px 8px', borderRadius: 6, background: G.goldBg, border: `1px solid ${G.goldBrd}`, color: G.goldL, fontSize: 11, fontFamily: 'monospace', fontWeight: 800 }}>F2</kbd>{' '}
          em qualquer tela do PDV.
        </p>
      </div>
    </div>
  );
}
