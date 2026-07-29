'use client';

import { useState } from 'react';
import { useCashDrawers, usePdvMutations } from '@/hooks/usePDV';
import { CashDrawerCard } from '@/components/pdv/PDVWidgets';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MonitorSmartphone, ArrowLeft, Info, Crown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
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

export default function PdvCaixasPage() {
  const { data: drawers = [], isLoading } = useCashDrawers();
  const { createDrawer, openDrawer, closeDrawer } = usePdvMutations();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [operator, setOperator] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('O nome do terminal é obrigatório.');
      return;
    }
    try {
      await createDrawer.mutateAsync({ name, operatorName: operator, status: 'CLOSED', initialBalance: 0, currentBalance: 0 });
      toast.success('Terminal criado com sucesso!');
      setOpen(false);
      setName('');
      setOperator('');
    } catch (error) {
      toast.error('Erro ao criar terminal.');
    }
  };

  const openCount = (drawers as any[]).filter((d: any) => d.status === 'OPEN').length;

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 42, padding: '0 14px', borderRadius: 10,
    background: '#0d0b09', border: `1px solid ${G.border}`,
    color: '#fff', fontSize: 13, outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard/pdv">
              <button
                style={{
                  padding: '6px 8px', borderRadius: 8,
                  background: 'transparent', border: `1px solid ${G.border}`,
                  color: G.muted, cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = G.goldBrd; e.currentTarget.style.color = G.goldL; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; }}
              >
                <ArrowLeft style={{ width: 15, height: 15 }} />
              </button>
            </Link>
            <div style={{ padding: 8, borderRadius: 12, background: G.goldBg, border: `1px solid ${G.goldBrd}` }}>
              <MonitorSmartphone style={{ width: 20, height: 20, color: G.gold }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              Terminais de Caixa
            </h1>
          </div>
          <div className="flex items-center gap-3" style={{ marginLeft: 4 }}>
            <p style={{ fontSize: 13, color: G.muted }}>
              Monitoramento em tempo real dos gaveteiros
            </p>
            {!isLoading && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                background: openCount > 0 ? 'rgba(34,197,94,0.10)' : 'rgba(100,80,40,0.15)',
                border: openCount > 0 ? '1px solid rgba(34,197,94,0.28)' : `1px solid ${G.border}`,
                color: openCount > 0 ? '#4ade80' : G.muted,
              }}>
                {openCount} aberto{openCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <button
                style={{
                  padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 800,
                  background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                  border: 'none', color: '#0a0908', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: `0 4px 20px ${G.goldGlow}`,
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = `0 6px 28px rgba(201,148,26,0.55)`; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${G.goldGlow}`; }}
              >
                <Plus style={{ width: 15, height: 15 }} />
                Novo Terminal
              </button>
            }
          />

          <DialogContent
            style={{
              background: '#0d0b09',
              border: `1px solid ${G.border}`,
              borderRadius: 20,
              boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px ${G.goldBrd}`,
            }}
          >
            {/* Gold top line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${G.gold}, ${G.goldL}, transparent)`, borderRadius: '20px 20px 0 0' }} />

            <DialogHeader>
              <DialogTitle style={{ color: '#fff', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ padding: 6, borderRadius: 8, background: G.goldBg, border: `1px solid ${G.goldBrd}` }}>
                  <MonitorSmartphone style={{ width: 16, height: 16, color: G.gold }} />
                </div>
                Novo Terminal de Caixa
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreate} style={{ marginTop: 8 }} className="space-y-5">
              <div className="space-y-2">
                <label style={{ fontSize: 12, color: G.muted, fontWeight: 600, display: 'block' }}>
                  Nome do Terminal <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  id="name"
                  placeholder="Ex: Caixa 01"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = G.goldBrd; }}
                  onBlur={e => { e.currentTarget.style.borderColor = G.border; }}
                />
              </div>
              <div className="space-y-2">
                <label style={{ fontSize: 12, color: G.muted, fontWeight: 600, display: 'block' }}>
                  Nome do Operador <span style={{ color: G.muted, fontSize: 11 }}>(Opcional)</span>
                </label>
                <input
                  id="operator"
                  placeholder="Ex: João Silva"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = G.goldBrd; }}
                  onBlur={e => { e.currentTarget.style.borderColor = G.border; }}
                />
              </div>
              <div className="flex justify-end gap-3" style={{ paddingTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    padding: '8px 16px', borderRadius: 10, fontSize: 13,
                    background: 'transparent', border: `1px solid ${G.border}`,
                    color: G.muted, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.color = G.text; e.currentTarget.style.borderColor = G.goldBrd; }}
                  onMouseOut={e => { e.currentTarget.style.color = G.muted; e.currentTarget.style.borderColor = G.border; }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createDrawer.isPending}
                  style={{
                    padding: '8px 24px', borderRadius: 10, fontSize: 13, fontWeight: 800,
                    background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                    border: 'none', color: '#0a0908', cursor: 'pointer',
                    boxShadow: `0 4px 16px ${G.goldGlow}`,
                    opacity: createDrawer.isPending ? 0.7 : 1,
                  }}
                >
                  {createDrawer.isPending ? 'Criando...' : 'Salvar Terminal'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Terminals Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: 200, borderRadius: 18, background: G.card, border: `1px solid ${G.border}` }} className="animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(drawers as any[]).map((d: any, i: number) => (
            <CashDrawerCard
              key={i}
              drawer={d}
              onOpen={async () => {
                const val = window.prompt(`Digite o Saldo Inicial para abrir o ${d.name} (R$):`);
                if (val !== null) {
                  try {
                    await openDrawer.mutateAsync({ drawerId: d.id, amount: Number(val.replace(',', '.')) || 0 });
                    toast.success('Caixa aberto com sucesso!');
                  } catch {
                    toast.error('Erro ao abrir caixa.');
                  }
                }
              }}
              onClose={async () => {
                if (window.confirm(`Tem certeza que deseja fechar o ${d.name}? O Saldo Atual é de R$ ${d.currentBalance}`)) {
                  try {
                    await closeDrawer.mutateAsync({ drawerId: d.id, amount: d.currentBalance });
                    toast.success('Caixa fechado com sucesso!');
                  } catch {
                    toast.error('Erro ao fechar caixa.');
                  }
                }
              }}
            />
          ))}

          {(drawers as any[]).length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-5">
              <div style={{ padding: 24, borderRadius: 20, background: G.card, border: `1px solid ${G.border}` }}>
                <MonitorSmartphone style={{ width: 48, height: 48, color: G.muted, opacity: 0.5 }} />
              </div>
              <div className="text-center">
                <p style={{ color: G.text, fontWeight: 700, fontSize: 16 }}>Nenhum terminal configurado</p>
                <p style={{ color: G.muted, fontSize: 13, marginTop: 4 }}>Clique em &quot;Novo Terminal&quot; para começar</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Info Footer ── */}
      {!isLoading && (drawers as any[]).length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 12, border: `1px solid ${G.border}`, padding: '14px 18px', background: G.goldBg }}>
          <Info style={{ width: 15, height: 15, color: G.muted, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: G.muted }}>
            O terminal deve estar com status <span style={{ color: '#4ade80', fontWeight: 700 }}>Aberto</span> antes de acessar a Frente de Caixa.
          </p>
        </div>
      )}
    </div>
  );
}
