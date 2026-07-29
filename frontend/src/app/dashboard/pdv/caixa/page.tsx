'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PosCartItem } from '@/types/pdv';
import { NumericKeyboard } from '@/components/pdv/PDVWidgets';
import { toast } from 'sonner';
import { useProductSearch, usePdvMutations, useCashDrawers, useDrawerSummary, QK_PDV_DRAWERS } from '@/hooks/usePDV';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import {
  Search, ShoppingCart, User, CreditCard, X, Printer,
  Plus, Minus, Trash2, Banknote, QrCode, ArrowLeftRight,
  FileText, Building2, Landmark, Coins, ReceiptText,
  RefreshCw, Pause, CheckCircle, Package, ChevronRight,
  AlertCircle, Tag, TrendingUp, DoorOpen, Keyboard,
  Crown, Clock, ArrowLeft, Wallet, TrendingDown,
  AlertTriangle, ChevronDown, ChevronUp, Smartphone, DollarSign,
} from 'lucide-react';

/* ─── Design tokens ────────────────────────────────────────────────────────── */
const G = {
  bg:       '#0a0908',
  surface:  '#0e0c0a',
  card:     '#111010',
  cardHov:  '#161310',
  border:   '#2a2215',
  borderG:  'rgba(201,148,26,0.28)',
  gold:     '#c9941a',
  goldL:    '#e8b84b',
  goldXL:   '#f5d060',
  goldBg:   'rgba(201,148,26,0.08)',
  goldGlow: 'rgba(201,148,26,0.40)',
  green:    '#22c55e',
  greenBg:  'rgba(34,197,94,0.10)',
  greenBrd: 'rgba(34,197,94,0.28)',
  red:      '#ef4444',
  redBg:    'rgba(239,68,68,0.10)',
  redBrd:   'rgba(239,68,68,0.28)',
  amber:    '#f59e0b',
  amberBg:  'rgba(245,158,11,0.10)',
  amberBrd: 'rgba(245,158,11,0.28)',
  muted:    '#7a6840',
  text:     '#f0e8d8',
  dim:      '#4a3e28',
  mp:       '#00b1ea', // Mercado Pago blue
  mk:       '#7c3aed', // Merkaup purple
};

/* ─── Types ────────────────────────────────────────────────────────────────── */
type PaymentMethod = 'CASH' | 'PIX' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'TRANSFER' | 'BOLETO' | 'STORE_CREDIT' | 'MERCADO_PAGO' | 'MERKAUP';
interface SelectedPayment { method: PaymentMethod; amount: number; }

/* ─── Destinos de sangria ──────────────────────────────────────────────────── */
const SANGRIA_DESTINATIONS = [
  { value: 'SAFE',        label: 'Cofre' },
  { value: 'BANK',        label: 'Banco' },
  { value: 'PAYMENTS',    label: 'Pagamentos' },
  { value: 'TROCO',       label: 'Troco' },
  { value: 'ADMIN',       label: 'Administrativo' },
  { value: 'FINANCIAL',   label: 'Financeiro' },
  { value: 'OTHER',       label: 'Outro' },
];

const SANGRIA_REASONS = [
  'Sangria para Cofre',
  'Sangria para Banco',
  'Sangria para Pagamento',
  'Sangria para Troco',
  'Sangria Administrativa',
  'Outro',
];

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function useRealTimeClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

/* ─── Payment methods config — V2.2 inclui Mercado Pago e Merkaup ─────────── */
const PAYMENTS: { method: PaymentMethod; label: string; icon: React.ElementType; color: string; bg: string; brd: string }[] = [
  { method: 'PIX',          label: 'PIX',           icon: QrCode,         color: '#4ade80', bg: 'rgba(34,197,94,0.08)',   brd: 'rgba(34,197,94,0.25)' },
  { method: 'CASH',         label: 'Dinheiro',      icon: Banknote,       color: G.goldL,   bg: G.goldBg,                brd: G.borderG },
  { method: 'DEBIT_CARD',   label: 'Débito',        icon: CreditCard,     color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', brd: 'rgba(96,165,250,0.25)' },
  { method: 'CREDIT_CARD',  label: 'Crédito',       icon: CreditCard,     color: '#c084fc', bg: 'rgba(192,132,252,0.08)',brd: 'rgba(192,132,252,0.25)' },
  { method: 'MERCADO_PAGO', label: 'Mercado Pago',  icon: Smartphone,     color: G.mp,      bg: 'rgba(0,177,234,0.08)',  brd: 'rgba(0,177,234,0.25)' },
  { method: 'MERKAUP',      label: 'Merkaup',       icon: Wallet,         color: G.mk,      bg: 'rgba(124,58,237,0.08)', brd: 'rgba(124,58,237,0.25)' },
  { method: 'TRANSFER',     label: 'Transferência', icon: ArrowLeftRight,  color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', brd: 'rgba(56,189,248,0.25)' },
  { method: 'BOLETO',       label: 'Boleto',        icon: FileText,       color: G.amber,   bg: 'rgba(245,158,11,0.08)', brd: 'rgba(245,158,11,0.25)' },
  { method: 'STORE_CREDIT', label: 'Crédito Loja',  icon: Coins,          color: '#f87171', bg: G.redBg,                 brd: G.redBrd },
];

/* ─── Shared style helpers ─────────────────────────────────────────────────── */
const S = {
  col: (w: string, extra?: React.CSSProperties): React.CSSProperties => ({
    width: w, display: 'flex', flexDirection: 'column', ...extra,
  }),
  card: (extra?: React.CSSProperties): React.CSSProperties => ({
    background: G.card, border: `1px solid ${G.border}`, borderRadius: 14, ...extra,
  }),
  input: (extra?: React.CSSProperties): React.CSSProperties => ({
    width: '100%', background: '#0d0b09', border: `1px solid ${G.border}`,
    borderRadius: 8, color: '#fff', fontSize: 12, padding: '6px 10px',
    outline: 'none', transition: 'border-color 0.2s', ...extra,
  }),
  label: (extra?: React.CSSProperties): React.CSSProperties => ({
    fontSize: 10, color: G.muted, fontWeight: 700, textTransform: 'uppercase' as const,
    letterSpacing: '0.07em', marginBottom: 2, display: 'block', ...extra,
  }),
  divider: (): React.CSSProperties => ({ height: 1, background: G.border, margin: '6px 0' }),
  tag: (color: string, bg: string, brd: string): React.CSSProperties => ({
    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
    color, background: bg, border: `1px solid ${brd}`,
  }),
};

/* ════════════════════════════════════════════════════════════════════════════ */
/* MODAL DE SANGRIA — V2.2                                                     */
/* ════════════════════════════════════════════════════════════════════════════ */
function SangriaModal({
  open,
  onClose,
  onConfirm,
  isPending,
  drawerName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { amount: number; destination: string; reason: string; observacao: string }) => void;
  isPending: boolean;
  drawerName: string;
}) {
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [observacao, setObservacao] = useState('');
  const now = new Date();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(amount.replace(',', '.'));
    if (!v || v <= 0) { toast.error('Informe um valor válido.'); return; }
    if (!destination) { toast.error('Selecione o destino.'); return; }
    if (!reason) { toast.error('Selecione o motivo.'); return; }
    if (reason === 'Outro' && !observacao.trim()) { toast.error('Descreva o motivo em Observação.'); return; }
    onConfirm({ amount: v, destination, reason, observacao });
  };

  const reset = () => { setAmount(''); setDestination(''); setReason(''); setObservacao(''); };

  useEffect(() => { if (!open) reset(); }, [open]);

  if (!open) return null;

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    background: '#0d0b09', border: `1px solid ${G.border}`,
    color: '#fff', fontSize: 13, outline: 'none', transition: 'border-color 0.2s',
  };
  const labelSt: React.CSSProperties = { fontSize: 11, color: G.muted, fontWeight: 600, marginBottom: 4, display: 'block' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 480, borderRadius: 20,
        background: '#0f0d0a', border: `1px solid ${G.amberBrd}`,
        boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px ${G.amberBg}`,
        overflow: 'hidden',
      }}>
        {/* Top bar amber */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${G.amber}, #f97316, ${G.amber})` }} />

        <div style={{ padding: '20px 24px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ padding: 8, borderRadius: 10, background: G.amberBg, border: `1px solid ${G.amberBrd}` }}>
                  <Landmark style={{ width: 16, height: 16, color: G.amber }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>Sangria de Caixa</h2>
              </div>
              <p style={{ fontSize: 11, color: G.muted, marginTop: 4 }}>
                Terminal: <span style={{ color: G.text }}>{drawerName}</span> &nbsp;·&nbsp;
                {now.toLocaleDateString('pt-BR')} {now.toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: G.dim, cursor: 'pointer', padding: 4 }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Valor */}
            <div>
              <label style={labelSt}>Valor da Sangria *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: G.amber, fontWeight: 700, fontSize: 13 }}>R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0,00"
                  style={{ ...inputSt, paddingLeft: 36, fontSize: 18, fontWeight: 900, color: G.amber }}
                  onFocus={e => { e.currentTarget.style.borderColor = G.amber; }}
                  onBlur={e => { e.currentTarget.style.borderColor = G.border; }}
                />
              </div>
            </div>

            {/* Destino */}
            <div>
              <label style={labelSt}>Destino do Dinheiro *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {SANGRIA_DESTINATIONS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDestination(d.value)}
                    style={{
                      height: 36, borderRadius: 8, fontSize: 11, fontWeight: 700,
                      border: destination === d.value ? `2px solid ${G.amber}` : `1px solid ${G.border}`,
                      background: destination === d.value ? G.amberBg : '#0d0b09',
                      color: destination === d.value ? G.amber : G.muted,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label style={labelSt}>Motivo *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {SANGRIA_REASONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    style={{
                      height: 34, borderRadius: 8, fontSize: 12, fontWeight: 600,
                      border: reason === r ? `2px solid ${G.amber}` : `1px solid ${G.border}`,
                      background: reason === r ? G.amberBg : 'transparent',
                      color: reason === r ? G.amber : G.muted,
                      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left', paddingLeft: 12,
                    }}
                  >
                    {r === reason ? '● ' : '○ '}{r}
                  </button>
                ))}
              </div>
            </div>

            {/* Observação — obrigatória se Outro */}
            <div>
              <label style={labelSt}>Observação {reason === 'Outro' ? '*' : '(opcional)'}</label>
              <textarea
                value={observacao}
                onChange={e => setObservacao(e.target.value)}
                placeholder={reason === 'Outro' ? 'Descreva o motivo...' : 'Detalhes adicionais...'}
                rows={2}
                style={{ ...inputSt, resize: 'none', fontSize: 12 }}
                onFocus={e => { e.currentTarget.style.borderColor = G.borderG; }}
                onBlur={e => { e.currentTarget.style.borderColor = G.border; }}
              />
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, height: 42, borderRadius: 10, fontSize: 13,
                  background: 'transparent', border: `1px solid ${G.border}`,
                  color: G.muted, cursor: 'pointer', fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  flex: 2, height: 42, borderRadius: 10, fontSize: 13, fontWeight: 800,
                  background: isPending ? '#2a1f08' : `linear-gradient(135deg, ${G.amber}, #f97316)`,
                  border: 'none', color: '#0a0908', cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.7 : 1,
                  boxShadow: isPending ? 'none' : `0 4px 20px rgba(245,158,11,0.40)`,
                }}
              >
                {isPending ? 'Registrando...' : '✓ Confirmar Sangria'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
/* MODAL DE DESCONTO — V2.3                                                    */
/* ════════════════════════════════════════════════════════════════════════════ */
function DiscountModal({
  open,
  onClose,
  onConfirm,
  subtotal,
  cartCost,
  userName
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { type: 'PERCENTAGE' | 'FIXED'; value: number; reason: string; savedAmount: number }) => void;
  subtotal: number;
  cartCost: number;
  userName: string;
}) {
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED'>('FIXED');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  
  const savedAmount = type === 'FIXED' 
    ? parseFloat(value.replace(',', '.')) || 0 
    : (subtotal * (parseFloat(value.replace(',', '.')) || 0)) / 100;
    
  const afterAmount = Math.max(0, subtotal - savedAmount);
  
  // V2.6 — Cálculos de Impacto no Lucro/Margem
  const profitBefore = subtotal - cartCost;
  const marginBefore = subtotal > 0 ? (profitBefore / subtotal) * 100 : 0;
  
  const profitAfter = afterAmount - cartCost;
  const marginAfter = afterAmount > 0 ? (profitAfter / afterAmount) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(value.replace(',', '.'));
    if (!v || v <= 0) { toast.error('Informe um valor válido.'); return; }
    if (afterAmount < 0) { toast.error('Desconto não pode ser maior que o subtotal.'); return; }
    onConfirm({ type, value: v, reason: reason || 'Desconto Concedido', savedAmount });
  };

  const reset = () => { setValue(''); setReason(''); };

  useEffect(() => { if (!open) reset(); }, [open]);

  if (!open) return null;

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    background: '#0d0b09', border: `1px solid ${G.border}`,
    color: '#fff', fontSize: 13, outline: 'none', transition: 'border-color 0.2s',
  };
  const labelSt: React.CSSProperties = { fontSize: 11, color: G.muted, fontWeight: 600, marginBottom: 4, display: 'block' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 480, borderRadius: 20,
        background: '#0f0d0a', border: `1px solid ${G.borderG}`,
        boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px ${G.goldBg}`,
        overflow: 'hidden',
      }}>
        {/* Top bar gold */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${G.gold}, ${G.goldL}, ${G.gold})` }} />

        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ padding: 8, borderRadius: 10, background: G.goldBg, border: `1px solid ${G.borderG}` }}>
                  <TrendingDown style={{ width: 16, height: 16, color: G.goldL }} />
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>Aplicar Desconto Global</h2>
              </div>
              <p style={{ fontSize: 11, color: G.muted, marginTop: 4 }}>
                Operador: <span style={{ color: G.text }}>{userName}</span>
              </p>
            </div>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: G.dim, cursor: 'pointer', padding: 4 }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelSt}>Tipo de Desconto</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button type="button" onClick={() => setType('FIXED')} style={{
                  height: 38, borderRadius: 8, border: type === 'FIXED' ? `2px solid ${G.goldL}` : `1px solid ${G.border}`,
                  background: type === 'FIXED' ? G.goldBg : '#0d0b09', color: type === 'FIXED' ? G.goldL : G.muted, fontWeight: 700
                }}>Reais (R$)</button>
                <button type="button" onClick={() => setType('PERCENTAGE')} style={{
                  height: 38, borderRadius: 8, border: type === 'PERCENTAGE' ? `2px solid ${G.goldL}` : `1px solid ${G.border}`,
                  background: type === 'PERCENTAGE' ? G.goldBg : '#0d0b09', color: type === 'PERCENTAGE' ? G.goldL : G.muted, fontWeight: 700
                }}>Porcentagem (%)</button>
              </div>
            </div>

            <div>
              <label style={labelSt}>Valor do Desconto</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: G.goldL, fontWeight: 700, fontSize: 13 }}>
                  {type === 'FIXED' ? 'R$' : '%'}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder="0,00"
                  style={{ ...inputSt, paddingLeft: 36, fontSize: 18, fontWeight: 900, color: G.goldL }}
                  onFocus={e => { e.currentTarget.style.borderColor = G.goldL; }}
                  onBlur={e => { e.currentTarget.style.borderColor = G.border; }}
                />
              </div>
            </div>

            <div>
              <label style={labelSt}>Motivo do Desconto (opcional)</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Ex: Fidelidade, Avaria, etc."
                style={inputSt}
                onFocus={e => { e.currentTarget.style.borderColor = G.goldL; }}
                onBlur={e => { e.currentTarget.style.borderColor = G.border; }}
              />
            </div>

            {/* Simulação em tempo real */}
            <div style={{ padding: '12px 14px', borderRadius: 10, background: '#141008', border: `1px solid ${G.borderG}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 10, color: G.dim }}>Valor Subtotal</p>
                  <p style={{ fontSize: 12, color: G.muted, textDecoration: 'line-through' }}>R$ {subtotal.toFixed(2).replace('.', ',')}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 10, color: G.goldL, fontWeight: 700 }}>Economia</p>
                  <p style={{ fontSize: 12, color: G.goldL, fontWeight: 900 }}>- R$ {savedAmount.toFixed(2).replace('.', ',')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: G.dim }}>Total Final</p>
                  <p style={{ fontSize: 16, color: '#fff', fontWeight: 900 }}>R$ {afterAmount.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>

              <div style={{ borderTop: `1px dashed ${G.border}`, paddingTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <p style={{ fontSize: 10, color: G.dim }}>Lucro (Antes ➔ Depois)</p>
                  <p style={{ fontSize: 11, fontWeight: 800 }}>
                    <span style={{ color: G.muted }}>R$ {profitBefore.toFixed(2).replace('.', ',')}</span>
                    <span style={{ color: G.dim, margin: '0 4px' }}>➔</span>
                    <span style={{ color: profitAfter > 0 ? G.green : G.red }}>R$ {profitAfter.toFixed(2).replace('.', ',')}</span>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: G.dim }}>Margem (Antes ➔ Depois)</p>
                  <p style={{ fontSize: 11, fontWeight: 800 }}>
                    <span style={{ color: G.muted }}>{marginBefore.toFixed(1).replace('.', ',')}%</span>
                    <span style={{ color: G.dim, margin: '0 4px' }}>➔</span>
                    <span style={{ color: marginAfter > 0 ? G.goldL : G.red }}>{marginAfter.toFixed(1).replace('.', ',')}%</span>
                  </p>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
              <button type="button" onClick={onClose} style={{ flex: 1, height: 42, borderRadius: 10, fontSize: 13, background: 'transparent', border: `1px solid ${G.border}`, color: G.muted, cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button type="submit" style={{ flex: 2, height: 42, borderRadius: 10, fontSize: 13, fontWeight: 800, background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`, border: 'none', color: '#0a0908', cursor: 'pointer', boxShadow: `0 4px 20px ${G.goldGlow}` }}>
                ✓ Aplicar Desconto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
/* MAIN COMPONENT                                                               */
/* ════════════════════════════════════════════════════════════════════════════ */
export default function FrenteDeCaixaPage() {
  const now = useRealTimeClock();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  /* ── State ─────────────────────────────────────────────────────────────── */
  const [query, setQuery]                       = useState('');
  const [cart, setCart]                         = useState<PosCartItem[]>([]);
  const [saleNumber, setSaleNumber]             = useState(() => Math.floor(Math.random() * 9000) + 1000);
  const [selectedPayments, setSelectedPayments] = useState<SelectedPayment[]>([]);
  const [receivedAmount, setReceivedAmount]     = useState('');
  const [discount, setDiscount]                 = useState(0);
  const [acrescimo, setAcrescimo]               = useState(0);
  const [editingQtyId, setEditingQtyId]         = useState<string | null>(null);
  const [customerName, setCustomerName]         = useState('Consumidor Final');
  const [customerDoc, setCustomerDoc]           = useState('');
  const [customerPhone, setCustomerPhone]       = useState('');
  const [customerObs, setCustomerObs]           = useState('');
  const [selectedProduct, setSelectedProduct]   = useState<any>(null);
  const [productQty, setProductQty]             = useState(1);
  const [showNumpad, setShowNumpad]             = useState(false);
  const [showSangriaModal, setShowSangriaModal] = useState(false);  // V2.2
  const [showSangriaPanel, setShowSangriaPanel] = useState(false);  // V2.2
  const [showDiscountModal, setShowDiscountModal] = useState(false); // V2.3
  const [globalDiscountState, setGlobalDiscountState] = useState<{ type: 'PERCENTAGE' | 'FIXED'; value: number; reason: string; savedAmount: number } | null>(null);

  // V2.2 — Sessão de vendas do caixa
  const [sessionSales, setSessionSales]         = useState(0);
  const [sessionRevenue, setSessionRevenue]     = useState(0);
  const [sessionDiscount, setSessionDiscount]   = useState(0);
  const [sessionAcrescimo, setSessionAcrescimo] = useState(0);
  const [countedValue, setCountedValue]         = useState(''); // V2.5

  const searchRef = useRef<HTMLInputElement>(null);

  const { data: searchResults }       = useProductSearch(query);
  const { data: drawers = [] }        = useCashDrawers();
  const { processSale, createSangria, invalidateAll } = usePdvMutations();

  // V2.2 — Pegar o caixa aberto mais recente
  const openDrawer = (drawers as any[]).find((d: any) => d.status === 'OPEN') || null;
  const drawerId   = openDrawer?.id || '';

  // V2.2 — Resumo financeiro do caixa
  const { data: drawerSummary } = useDrawerSummary(drawerId);

  /* ── Computed ───────────────────────────────────────────────────────────── */
  const subtotal      = cart.reduce((a, i) => a + i.total, 0);
  const totalDiscount = cart.reduce((a, i) => a + i.discount, 0) + (globalDiscountState?.savedAmount || discount);
  const totalGeral    = Math.max(0, subtotal - totalDiscount + acrescimo);
  const received      = parseFloat(receivedAmount.replace(',', '.')) || 0;
  const troco         = Math.max(0, received - totalGeral);
  const totalItems    = cart.reduce((a, i) => a + i.quantity, 0);
  const paidSoFar     = selectedPayments.reduce((a, p) => a + p.amount, 0);

  // V2.3 — Lucro da venda em andamento
  // V2.6 — Lucro da venda em andamento detalhado
  const cartCost = cart.reduce((a, i) => a + ((i as any).costPrice || 0) * i.quantity, 0);
  const cartGrossProfit = subtotal - cartCost;
  const cartNetProfit = totalGeral - cartCost;
  const cartMargin = totalGeral > 0 ? ((cartNetProfit / totalGeral) * 100).toFixed(1).replace('.', ',') : '0';
  const cartMarkup = cartCost > 0 ? ((cartNetProfit / cartCost) * 100).toFixed(1).replace('.', ',') : '0';

  /* ── Cart operations ────────────────────────────────────────────────────── */
  const addItem = (product: any) => {
    setCart(prev => {
      const existing = prev.find(p => p.productId === product.id);
      if (existing) {
        return prev.map(p =>
          p.productId === product.id
            ? { ...p, quantity: p.quantity + productQty, total: (p.quantity + productQty) * p.unitPrice }
            : p
        );
      }
      return [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitPrice: product.price,
        quantity: productQty,
        discount: 0,
        total: product.price * productQty,
        costPrice: product.costPrice || 0,
      }];
    });
    setQuery('');
    setSelectedProduct(null);
    setProductQty(1);
    searchRef.current?.focus();
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setProductQty(1);
    setQuery('');
  };

  const removeItem = (id: string) => setCart(prev => prev.filter(c => c.id !== id));

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setCart(prev => prev.map(p => p.id === id ? { ...p, quantity: qty, total: qty * p.unitPrice - p.discount } : p));
  };

  /* ── Payment ────────────────────────────────────────────────────────────── */
  const togglePayment = (method: PaymentMethod) => {
    setSelectedPayments(prev => {
      const exists = prev.find(p => p.method === method);
      if (exists) return prev.filter(p => p.method !== method);
      const remaining = Math.max(0, totalGeral - paidSoFar);
      return [...prev, { method, amount: remaining }];
    });
  };

  /* ── Finalize ───────────────────────────────────────────────────────────── */
  const finalizeSale = async () => {
    if (cart.length === 0) return toast.error('Carrinho vazio.');
    const companyId = useAuthStore.getState().user?.companyId;
    if (!companyId) { toast.error('Sessão inválida. Faça logout e entre novamente.'); return; }

    let payments;
    if (selectedPayments.length === 1) {
      const p = selectedPayments[0];
      payments = [{ method: (p.method === 'TRANSFER' || p.method === 'BOLETO') ? 'OTHER' : p.method, amount: totalGeral }];
    } else if (selectedPayments.length > 1) {
      payments = selectedPayments.map(p => ({ method: (p.method === 'TRANSFER' || p.method === 'BOLETO') ? 'OTHER' : p.method, amount: p.amount }));
    } else {
      payments = [{ method: 'CASH', amount: totalGeral }];
    }

    try {
      await processSale.mutateAsync({
        cashierId: drawerId || 'default-drawer',
        operatorId: user?.id || 'operator',
        customerName: customerName !== 'Consumidor Final' ? customerName : undefined,
        customerDoc: customerDoc || undefined,
        customerPhone: customerPhone || undefined,
        customerObs: customerObs || undefined,
        items: cart.map(item => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.unitPrice, discount: item.discount, total: item.total })) as any,
        subtotal, discountTotal: totalDiscount, total: totalGeral,
        payments: payments as any,
        status: 'COMPLETED',
        globalDiscount: globalDiscountState ? {
          type: globalDiscountState.type,
          value: globalDiscountState.value,
          reason: globalDiscountState.reason,
          beforeAmount: subtotal,
          afterAmount: totalGeral
        } : undefined
      });

      // V2.2 — Atualizar acumuladores da sessão
      setSessionSales(n => n + 1);
      setSessionRevenue(n => n + totalGeral);
      setSessionDiscount(n => n + totalDiscount);
      setSessionAcrescimo(n => n + acrescimo);

      toast.success('Venda concluída com sucesso!');
      setCart([]); setSelectedPayments([]); setReceivedAmount(''); setDiscount(0); setAcrescimo(0);
      setGlobalDiscountState(null);
      setCustomerName('Consumidor Final'); setCustomerDoc(''); setCustomerPhone(''); setCustomerObs('');
      setSaleNumber(n => n + 1);
      invalidateAll();
    } catch { toast.error('Erro ao finalizar venda.'); }
  };

  /* ── V2.2 — Sangria handler ─────────────────────────────────────────────── */
  const handleSangria = async (data: { amount: number; destination: string; reason: string; observacao: string }) => {
    if (!drawerId) { toast.error('Nenhum caixa aberto encontrado.'); return; }
    try {
      await createSangria.mutateAsync({
        drawerId,
        payload: {
          type: 'SANGRIA',
          amount: data.amount,
          description: `Sangria — ${data.reason}`,
          destination: data.destination,
          reason: data.reason,
          observacao: data.observacao,
        }
      });
      toast.success(`Sangria de R$ ${fmt(data.amount)} registrada com sucesso!`);
      setShowSangriaModal(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Erro ao registrar sangria.');
    }
  };

  /* ── V2.2 — Botão Voltar ao ERP com invalidação total ───────────────────── */
  const handleVoltarERP = useCallback(() => {
    invalidateAll();
    router.push('/dashboard/pdv');
  }, [invalidateAll, router]);

  /* ── Keyboard shortcuts ─────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); setCart([]); setSelectedPayments([]); setSaleNumber(n => n + 1); setGlobalDiscountState(null); }
      if (e.key === 'F3') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F4') { e.preventDefault(); document.getElementById('received-amount-input')?.focus(); }
      if (e.key === 'F6') { e.preventDefault(); setShowDiscountModal(true); }
      if (e.key === 'F7') { e.preventDefault(); setShowSangriaModal(true); }
      if (e.key === 'F9') { e.preventDefault(); finalizeSale(); }
      if (e.key === 'Escape') { e.preventDefault(); setQuery(''); setSelectedProduct(null); setShowSangriaModal(false); setShowDiscountModal(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, totalGeral, selectedPayments]);

  /* ── V2.2 — Sangrias do resumo ──────────────────────────────────────────── */
  const sangriasHoje    = drawerSummary?.sangrias || [];
  const totalSangrado   = drawerSummary?.totalSangrias || 0;
  const ultimaSangria   = sangriasHoje.length > 0 ? sangriasHoje[0] : null;
  const saldoAtual      = drawerSummary?.saldoAtual ?? (openDrawer ? Number(openDrawer.currentBalance) : 0);

  /* ── Payment breakdown do resumo ────────────────────────────────────────── */
  const breakdown       = drawerSummary?.paymentBreakdown || {};

  const fmt2 = (n: number) => `R$ ${fmt(n)}`;

  /* ════════════════════════════════════════════════════════════════════════ */
  /* RENDER                                                                    */
  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,
      background: G.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      <SangriaModal
        open={showSangriaModal}
        onClose={() => setShowSangriaModal(false)}
        onConfirm={handleSangria}
        isPending={createSangria.isPending}
        drawerName={openDrawer?.name || 'Caixa'}
      />

      {/* V2.3 — Modal Desconto */}
      <DiscountModal
        open={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        onConfirm={(d) => {
          setGlobalDiscountState(d);
          setShowDiscountModal(false);
          toast.success(`Desconto de R$ ${d.savedAmount.toFixed(2)} aplicado!`);
        }}
        subtotal={subtotal}
        cartCost={cartCost}
        userName={user?.name || 'Admin'}
      />

      {/* ═══ TOPO DO PDV ═══════════════════════════════════════════════════ */}
      <div style={{
        flexShrink: 0,
        borderBottom: `1px solid ${G.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 52,
        backdropFilter: 'blur(20px)',
        background: 'linear-gradient(180deg, #0f0d09 0%, #0a0908 100%)',
        boxShadow: '0 1px 0 rgba(201,148,26,0.12)',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: G.green, boxShadow: `0 0 8px ${G.green}` }} className="animate-pulse" />
            <span style={{ fontSize: 11, fontWeight: 800, color: G.green, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Caixa Aberto</span>
          </div>
          <div style={{ width: 1, height: 18, background: G.border }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Crown style={{ width: 13, height: 13, color: G.gold }} />
            <span style={{ fontSize: 12, color: G.muted, fontWeight: 600 }}>Império Suplementos</span>
          </div>
          <div style={{ width: 1, height: 18, background: G.border }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <User style={{ width: 12, height: 12, color: G.muted }} />
            <span style={{ fontSize: 12, color: G.muted }}>
              Operador: <span style={{ color: G.text, fontWeight: 700 }}>{user?.name || 'Admin'}</span>
            </span>
          </div>
          {openDrawer && (
            <>
              <div style={{ width: 1, height: 18, background: G.border }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Wallet style={{ width: 12, height: 12, color: G.muted }} />
                <span style={{ fontSize: 12, color: G.muted }}>
                  Terminal: <span style={{ color: G.goldL, fontWeight: 700 }}>{openDrawer.name}</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            padding: '4px 16px', borderRadius: 8,
            background: G.goldBg, border: `1px solid ${G.borderG}`,
            fontSize: 12, fontWeight: 800, color: G.goldL, letterSpacing: '0.04em',
          }}>
            VENDA #{String(saleNumber).padStart(6, '0')}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* V2.5 — Export Buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => window.print()}
              style={{
                padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                background: '#0d0b09', border: `1px solid ${G.border}`, color: G.muted,
                cursor: 'pointer', transition: 'all 0.15s'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = G.gold; e.currentTarget.style.color = G.goldL; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; }}
            >
              PDF
            </button>
            <button
              onClick={() => {
                if (!drawerSummary) return;
                const rows = [
                  ['ERP IMPÉRIO - FECHAMENTO DE CAIXA'],
                  ['Data', new Date().toLocaleDateString('pt-BR')],
                  ['Operador', user?.name || 'Admin'],
                  [''],
                  ['MÉTRICA', 'VALOR'],
                  ['Saldo Inicial', (drawerSummary.drawer.currentBalance - drawerSummary.totalVendas + drawerSummary.totalSangrias - drawerSummary.totalSuprimentos).toFixed(2)],
                  ['Total Vendido', drawerSummary.totalVendas.toFixed(2)],
                  ['Total Descontos', drawerSummary.totalDescontos.toFixed(2)],
                  ['Sangrias', drawerSummary.totalSangrias.toFixed(2)],
                  ['Lucro Bruto', drawerSummary.grossProfit.toFixed(2)],
                  ['Saldo Atual Esperado', drawerSummary.saldoAtual.toFixed(2)],
                  [''],
                  ['FORMA DE PAGAMENTO', 'VALOR', 'VENDAS']
                ];
                if (drawerSummary.paymentStats) {
                  drawerSummary.paymentStats.forEach((p: any) => rows.push([p.method, p.amount.toFixed(2), p.count]));
                }
                const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `Fechamento_Caixa_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('Exportado com sucesso!');
              }}
              style={{
                padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                background: '#0d0b09', border: `1px solid ${G.border}`, color: G.muted,
                cursor: 'pointer', transition: 'all 0.15s'
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = G.gold; e.currentTarget.style.color = G.goldL; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; }}
            >
              CSV / Excel
            </button>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: G.dim }}>
              {now.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
              {now.toLocaleTimeString('pt-BR')}
            </div>
          </div>

          {/* V2.2 — Botão Voltar ao ERP aprimorado */}
          <button
            onClick={handleVoltarERP}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: 'transparent', border: `1px solid ${G.border}`,
              color: G.muted, cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = G.borderG; e.currentTarget.style.color = G.goldL; e.currentTarget.style.background = G.goldBg; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; e.currentTarget.style.background = 'transparent'; }}
            title="Voltar ao ERP — atualiza todos os módulos automaticamente"
          >
            <ArrowLeft style={{ width: 12, height: 12 }} />
            Voltar ao ERP
          </button>
        </div>
      </div>

      {/* V2.4 — PAINEL SUPERIOR DE INDICADORES DO TURNO */}
      {drawerSummary && (
        <div style={{
          flexShrink: 0, padding: '8px 20px', borderBottom: `1px solid ${G.border}`, background: '#080705',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {[
            { label: 'Saldo Inicial', value: fmt2(drawerSummary.drawer.currentBalance - drawerSummary.totalVendas + drawerSummary.totalSangrias - drawerSummary.totalSuprimentos), color: G.muted },
            { label: 'Entradas', value: fmt2(drawerSummary.totalVendas + drawerSummary.totalSuprimentos), color: G.green },
            { label: 'Sangrias', value: fmt2(drawerSummary.totalSangrias), color: G.amber },
            { label: 'Descontos', value: fmt2(drawerSummary.totalDescontos), color: G.red },
            { label: 'Lucro Bruto', value: fmt2(drawerSummary.grossProfit), color: G.goldL },
            { label: 'Margem %', value: drawerSummary.totalVendas > 0 ? `${((drawerSummary.grossProfit / drawerSummary.totalVendas) * 100).toFixed(1).replace('.', ',')}%` : '0%', color: G.goldL },
            { label: 'Ticket Médio', value: fmt2(drawerSummary.avgTicket), color: G.text },
            { label: 'Total Vendas', value: fmt2(drawerSummary.totalVendas), color: G.green },
            { label: 'Saldo Atual', value: fmt2(drawerSummary.saldoAtual), color: G.goldXL },
          ].map((kpi, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 12px', background: G.card, borderRadius: 8, border: `1px solid ${G.border}`, minWidth: 110 }}>
              <span style={{ fontSize: 9, color: G.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
              <span style={{ fontSize: 13, color: kpi.color, fontWeight: 900 }}>{kpi.value.startsWith('R$') ? '' : 'R$ '}{kpi.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ═══ BODY — 3 COLUNAS ══════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ═══ COLUNA ESQUERDA — 32% ══════════════════════════════════════ */}
        <div style={{ ...S.col('32%'), borderRight: `1px solid ${G.border}`, background: G.surface, overflowY: 'auto' }}>

          {/* ── Seção Cliente ── */}
          <div style={{ flexShrink: 0, padding: '10px 12px', borderBottom: `1px solid ${G.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <User style={{ width: 13, height: 13, color: G.gold }} />
              <span style={S.label({ marginBottom: 0 })}>Cliente</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Consumidor Final"
                style={{ ...S.input(), gridColumn: 'span 2', height: 30 }}
                onFocus={e => { e.currentTarget.style.borderColor = G.borderG; }} onBlur={e => { e.currentTarget.style.borderColor = G.border; }} />
              <input value={customerDoc} onChange={e => setCustomerDoc(e.target.value)} placeholder="CPF / CNPJ"
                style={{ ...S.input(), height: 30 }}
                onFocus={e => { e.currentTarget.style.borderColor = G.borderG; }} onBlur={e => { e.currentTarget.style.borderColor = G.border; }} />
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Telefone"
                style={{ ...S.input(), height: 30 }}
                onFocus={e => { e.currentTarget.style.borderColor = G.borderG; }} onBlur={e => { e.currentTarget.style.borderColor = G.border; }} />
              <input value={customerObs} onChange={e => setCustomerObs(e.target.value)} placeholder="Observações..."
                style={{ ...S.input(), gridColumn: 'span 2', height: 30 }}
                onFocus={e => { e.currentTarget.style.borderColor = G.borderG; }} onBlur={e => { e.currentTarget.style.borderColor = G.border; }} />
            </div>
          </div>

          {/* ── Lista da Venda ── */}
          <div style={{ flex: 1, minHeight: 250, overflowY: 'auto', padding: '8px 10px', scrollbarWidth: 'thin', scrollbarColor: `${G.border} transparent` }}>
            {cart.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 68px 72px 28px', gap: 4, padding: '2px 8px 6px', borderBottom: `1px solid ${G.border}`, marginBottom: 6 }}>
                {['Produto', 'Qtd', 'Unit.', 'Total', ''].map((h, i) => (
                  <span key={i} style={{ fontSize: 9, color: G.dim, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: i > 0 ? 'center' : 'left' }}>{h}</span>
                ))}
              </div>
            )}

            {cart.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <div style={{ padding: 20, borderRadius: 16, background: G.card, border: `1px solid ${G.border}` }}>
                  <ShoppingCart style={{ width: 36, height: 36, color: G.dim, opacity: 0.5 }} />
                </div>
                <p style={{ fontSize: 13, color: G.muted, fontWeight: 600 }}>Carrinho vazio</p>
                <p style={{ fontSize: 11, color: G.dim }}>Busque um produto ao centro</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {cart.map((item, index) => (
                  <div key={item.id}
                    style={{ ...S.card({ padding: '7px 8px', borderRadius: 10 }) }}
                    onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = G.borderG; }}
                    onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = G.border; }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 68px 72px 28px', gap: 4, alignItems: 'center' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: G.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ color: G.dim, fontFamily: 'monospace', marginRight: 4 }}>{String(index + 1).padStart(2, '0')}</span>
                          {item.name}
                        </p>
                        <p style={{ fontSize: 9, color: G.muted, marginTop: 1 }}>{item.sku}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} style={{ width: 16, height: 16, borderRadius: 4, background: '#1a1710', border: `1px solid ${G.border}`, color: G.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus style={{ width: 9, height: 9 }} />
                        </button>
                        {editingQtyId === item.id ? (
                          <input autoFocus type="number" defaultValue={item.quantity}
                            style={{ width: 28, textAlign: 'center', fontSize: 11, fontWeight: 800, background: '#1a1710', border: `1px solid ${G.borderG}`, borderRadius: 4, color: '#fff', outline: 'none' }}
                            onBlur={e => { updateQty(item.id, parseInt(e.target.value) || 1); setEditingQtyId(null); }}
                            onKeyDown={e => { if (e.key === 'Enter') { updateQty(item.id, parseInt((e.target as HTMLInputElement).value) || 1); setEditingQtyId(null); } }}
                          />
                        ) : (
                          <button onClick={() => setEditingQtyId(item.id)} style={{ width: 24, textAlign: 'center', fontSize: 12, fontWeight: 900, color: G.goldL, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            {item.quantity}
                          </button>
                        )}
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} style={{ width: 16, height: 16, borderRadius: 4, background: '#1a1710', border: `1px solid ${G.border}`, color: G.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus style={{ width: 9, height: 9 }} />
                        </button>
                      </div>
                      <span style={{ textAlign: 'center', fontSize: 10, color: G.muted }}>R${fmt(item.unitPrice)}</span>
                      <span style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: G.goldL }}>R${fmt(item.total)}</span>
                      <button onClick={() => removeItem(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, background: G.redBg, border: G.redBrd, cursor: 'pointer', color: G.red }}>
                        <Trash2 style={{ width: 11, height: 11 }} />
                      </button>
                    </div>
                    {item.discount > 0 && (
                      <p style={{ fontSize: 9, color: G.red, marginTop: 3 }}>Desconto: -R$ {fmt(item.discount)}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Resumo Financeiro ── */}
          <div style={{ flexShrink: 0, padding: '10px 12px', borderTop: `1px solid ${G.borderG}`, background: '#0c0a07' }}>
            <div style={{ height: 2, background: `linear-gradient(90deg, ${G.gold}, ${G.goldL}, transparent)`, borderRadius: 2, marginBottom: 8 }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { label: `${totalItems} iten${totalItems !== 1 ? 's' : ''}`, value: `R$ ${fmt(subtotal)}`, color: G.text },
                { label: 'Descontos', value: `-R$ ${fmt(totalDiscount)}`, color: totalDiscount > 0 ? G.red : G.dim },
                { label: 'Acréscimos', value: `+R$ ${fmt(acrescimo)}`, color: acrescimo > 0 ? G.amber : G.dim },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: G.muted }}>{label}</span>
                  <span style={{ color, fontWeight: 600 }}>{value}</span>
                </div>
              ))}

              <div style={S.divider()} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: G.text }}>TOTAL GERAL</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: G.goldL, lineHeight: 1 }}>R$ {fmt(totalGeral)}</span>
              </div>

              {selectedPayments.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: G.muted }}>Pago</span>
                  <span style={{ color: G.green, fontWeight: 700 }}>R$ {fmt(paidSoFar)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                <span style={{ color: G.muted }}>Valor Recebido</span>
                <input value={receivedAmount} onChange={e => setReceivedAmount(e.target.value)} placeholder="0,00"
                  style={{ width: 90, textAlign: 'right', background: 'transparent', border: 'none', borderBottom: `1px solid ${G.border}`, color: '#fff', fontSize: 12, fontWeight: 700, outline: 'none', paddingBottom: 2 }} />
              </div>

              {received > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: G.muted }}>Troco</span>
                  <span style={{ color: troco > 0 ? G.amber : G.dim, fontWeight: 800 }}>R$ {fmt(troco)}</span>
                </div>
              )}
            </div>

            {/* V2.6 — Lucro da Venda em Tempo Real Completo */}
            {cart.length > 0 && (
              <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: '#0a0908', border: `1px solid ${G.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: G.muted, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Resumo da Venda</span>
                  <span style={{ fontSize: 10, color: G.goldL, fontWeight: 900 }}>Mg: {cartMargin}%</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: 9, color: G.dim }}>Custo Total</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: G.muted }}>R$ {fmt(cartCost)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: 9, color: G.dim }}>Preço de Venda</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: G.text }}>R$ {fmt(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: 9, color: G.dim }}>Lucro Bruto</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: G.green }}>R$ {fmt(cartGrossProfit)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: 9, color: G.dim }}>Lucro Líquido</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: totalDiscount > 0 ? G.goldL : G.green }}>R$ {fmt(cartNetProfit)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: 9, color: G.dim }}>Markup</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: G.mp }}>{cartMarkup}%</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontSize: 9, color: G.red }}>Descontos</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: G.red }}>-R$ {fmt(totalDiscount)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* V2.3 — Indicadores financeiros da sessão (Premium Dashboard) */}
            {drawerSummary && (
              <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: '#0a0906', border: `1px solid ${G.borderG}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: G.goldL, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Dashboard do Turno</span>
                  <span style={{ fontSize: 9, color: G.dim }}>{openDrawer?.name}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    { label: 'Saldo Inicial', value: fmt2(drawerSummary.drawer.currentBalance - drawerSummary.totalVendas + drawerSummary.totalSangrias - drawerSummary.totalSuprimentos), color: G.muted },
                    { label: 'Total Vendido', value: fmt2(drawerSummary.totalVendas), color: G.green },
                    { label: 'Descontos', value: fmt2(drawerSummary.totalDescontos), color: G.red },
                    { label: 'Sangrias', value: fmt2(drawerSummary.totalSangrias), color: G.amber },
                    { label: 'Lucro Bruto', value: fmt2(drawerSummary.grossProfit), color: G.goldL },
                    { label: 'Margem %', value: drawerSummary.totalVendas > 0 ? `${((drawerSummary.grossProfit / drawerSummary.totalVendas) * 100).toFixed(1).replace('.', ',')}%` : '0%', color: G.goldL },
                    { label: 'Ticket Médio', value: fmt2(drawerSummary.avgTicket), color: G.text },
                    { label: 'Qtd Vendas', value: String(drawerSummary.salesCount), color: G.text },
                    { label: 'Maior Venda', value: fmt2(drawerSummary.maiorVenda), color: G.muted },
                    { label: 'Menor Venda', value: fmt2(drawerSummary.menorVenda), color: G.muted },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontSize: 9, color: G.dim }}>{label}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${G.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: G.muted, fontWeight: 700 }}>Saldo Atual</span>
                  <span style={{ fontSize: 14, color: G.goldL, fontWeight: 900 }}>{fmt2(drawerSummary.saldoAtual)}</span>
                </div>
              </div>
            )}

            {/* V2.3 — Histórico de Sangrias do Turno */}
            {drawerSummary && drawerSummary.sangrias && drawerSummary.sangrias.length > 0 && (
              <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: '#0a0906', border: `1px solid ${G.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: G.amber, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sangrias do Turno</span>
                  <span style={{ fontSize: 10, color: G.dim, fontWeight: 700 }}>{drawerSummary.sangrias.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 120, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: `${G.border} transparent` }}>
                  {drawerSummary.sangrias.map((s: any) => (
                    <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 6, borderBottom: `1px dashed ${G.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: G.amber }}>R$ {fmt(s.amount)}</span>
                        <span style={{ fontSize: 9, color: G.muted }}>{new Date(s.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: G.text }}>{s.destination === 'SAFE' ? 'Cofre' : s.destination === 'BANK' ? 'Banco' : s.destination === 'PAYMENTS' ? 'Pagamentos' : s.destination === 'TROCO' ? 'Troco' : s.destination === 'ADMIN' ? 'Administrativo' : s.destination === 'FINANCIAL' ? 'Financeiro' : 'Outro'}</span>
                        <span style={{ fontSize: 9, color: G.dim }}>{s.performedBy}</span>
                      </div>
                      {s.reason && (
                        <span style={{ fontSize: 9, color: G.dim, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.reason}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* V2.5 — RESUMO FINANCEIRO DO TURNO */}
            {drawerSummary && drawerSummary.paymentStats && (
              <div style={{ marginTop: 10, padding: '12px', borderRadius: 12, background: '#0a0906', border: `1px solid ${G.borderG}` }}>
                <span style={{ fontSize: 11, color: G.goldL, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Resumo Financeiro do Turno</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { id: 'CASH', label: 'DINHEIRO', color: G.green },
                    { id: 'PIX', label: 'PIX', color: '#32bcad' },
                    { id: 'DEBIT_CARD', label: 'DÉBITO', color: G.text },
                    { id: 'CREDIT_CARD', label: 'CRÉDITO', color: G.text },
                    { id: 'MERCADO_PAGO', label: 'MERCADO PAGO', color: G.mp },
                    { id: 'MERKAUP', label: 'MERKAUP', color: G.mk },
                    { id: 'OTHER', label: 'OUTROS', color: G.muted }
                  ].map(pm => {
                    const stat = drawerSummary.paymentStats.find((s: any) => s.method === pm.id) || { amount: 0, count: 0 };
                    const pct = drawerSummary.totalVendas > 0 ? ((stat.amount / drawerSummary.totalVendas) * 100).toFixed(1) : '0';
                    const tkMedio = stat.count > 0 ? stat.amount / stat.count : 0;
                    if (stat.amount === 0 && stat.count === 0) return null;
                    return (
                      <div key={pm.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 8, borderBottom: `1px dashed ${G.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: pm.color }}>{pm.label}</span>
                          <span style={{ fontSize: 11, fontWeight: 900, color: '#fff' }}>R$ {fmt(stat.amount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 9, color: G.dim }}>Vendas: {stat.count}</span>
                          <span style={{ fontSize: 9, color: G.dim }}>Ticket: R$ {fmt(tkMedio)}</span>
                          <span style={{ fontSize: 9, color: pm.color }}>{pct}%</span>
                        </div>
                        {/* V2.6 — Barra gráfica de participação */}
                        <div style={{ width: '100%', height: 4, background: '#1a1814', borderRadius: 2, overflow: 'hidden', marginTop: 2 }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pm.color, borderRadius: 2, transition: 'width 0.5s ease-in-out' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${G.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: G.muted, fontWeight: 700 }}>Total Recebido</span>
                    <span style={{ fontSize: 13, color: G.green, fontWeight: 900 }}>
                      R$ {fmt(drawerSummary.paymentStats.reduce((acc: number, s: any) => acc + s.amount, 0))}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: G.muted, fontWeight: 700 }}>Total de Vendas</span>
                    <span style={{ fontSize: 13, color: G.goldL, fontWeight: 900 }}>
                      R$ {fmt(drawerSummary.totalVendas)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* V2.4 — RESUMO DO DIA */}
            {drawerSummary && (
              <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 12, background: '#0a0906', border: `1px solid ${G.border}` }}>
                <span style={{ fontSize: 10, color: G.muted, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Resumo do Dia</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <div style={{ padding: '6px', background: G.card, borderRadius: 6, border: `1px solid ${G.border}` }}>
                    <p style={{ fontSize: 9, color: G.dim }}>Maior Venda</p>
                    <p style={{ fontSize: 11, fontWeight: 800, color: G.green }}>R$ {fmt2(drawerSummary.maiorVenda)}</p>
                  </div>
                  <div style={{ padding: '6px', background: G.card, borderRadius: 6, border: `1px solid ${G.border}` }}>
                    <p style={{ fontSize: 9, color: G.dim }}>Menor Venda</p>
                    <p style={{ fontSize: 11, fontWeight: 800, color: G.red }}>R$ {fmt2(drawerSummary.menorVenda)}</p>
                  </div>
                  <div style={{ padding: '6px', background: G.card, borderRadius: 6, border: `1px solid ${G.border}` }}>
                    <p style={{ fontSize: 9, color: G.dim }}>Qtd Vendas</p>
                    <p style={{ fontSize: 11, fontWeight: 800, color: G.text }}>{drawerSummary.salesCount}</p>
                  </div>
                  <div style={{ padding: '6px', background: G.card, borderRadius: 6, border: `1px solid ${G.border}` }}>
                    <p style={{ fontSize: 9, color: G.dim }}>Qtd Sangrias</p>
                    <p style={{ fontSize: 11, fontWeight: 800, color: G.amber }}>{drawerSummary.sangrias?.length || 0}</p>
                  </div>
                </div>
                <div style={{ marginTop: 6, padding: '6px', background: G.card, borderRadius: 6, border: `1px solid ${G.border}` }}>
                  <p style={{ fontSize: 9, color: G.dim }}>Última Venda</p>
                  {(() => {
                    const ultVenda = drawerSummary.movements?.slice().reverse().find((m: any) => m.type === 'SALE');
                    return ultVenda ? (
                      <p style={{ fontSize: 11, fontWeight: 800, color: G.goldL }}>
                        R$ {fmt(ultVenda.amount)} <span style={{ color: G.muted, fontWeight: 600, marginLeft: 4 }}>({new Date(ultVenda.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})</span>
                      </p>
                    ) : (
                      <p style={{ fontSize: 11, fontWeight: 800, color: G.dim }}>Nenhuma venda</p>
                    );
                  })()}
                </div>
                {/* Qtd por Forma de Pagamento */}
                <div style={{ marginTop: 6, padding: '6px', background: G.card, borderRadius: 6, border: `1px solid ${G.border}`, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {drawerSummary.paymentStats?.map((s: any) => (
                    <div key={s.method} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 9, color: G.dim }}>{s.method}:</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: G.text }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* V2.5 — CONFERÊNCIA DO CAIXA */}
            {drawerSummary && (
              <div style={{ marginTop: 10, padding: '12px', borderRadius: 12, background: '#0a0906', border: `1px solid ${G.border}` }}>
                <span style={{ fontSize: 11, color: G.muted, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Conferência do Caixa</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: G.dim, fontWeight: 600 }}>Saldo Inicial (+)</span>
                    <span style={{ fontSize: 11, color: G.text, fontWeight: 700 }}>R$ {fmt(drawerSummary.drawer.currentBalance - drawerSummary.totalVendas + drawerSummary.totalSangrias - drawerSummary.totalSuprimentos)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: G.dim, fontWeight: 600 }}>Entradas (+)</span>
                    <span style={{ fontSize: 11, color: G.text, fontWeight: 700 }}>R$ {fmt(drawerSummary.totalVendas + drawerSummary.totalSuprimentos)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: G.dim, fontWeight: 600 }}>Sangrias (-)</span>
                    <span style={{ fontSize: 11, color: G.text, fontWeight: 700 }}>R$ {fmt(drawerSummary.totalSangrias)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingTop: 6, borderTop: `1px solid ${G.border}` }}>
                    <span style={{ fontSize: 11, color: G.goldL, fontWeight: 800 }}>Saldo Esperado (=)</span>
                    <span style={{ fontSize: 12, color: G.goldL, fontWeight: 900 }}>R$ {fmt(drawerSummary.saldoAtual)}</span>
                  </div>
                </div>

                <div style={{ background: G.card, borderRadius: 8, padding: '10px', border: `1px solid ${G.border}` }}>
                  <label style={{ fontSize: 10, color: G.muted, fontWeight: 700, display: 'block', marginBottom: 6 }}>Valor Contado no Caixa</label>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: G.text, fontSize: 12, fontWeight: 700 }}>R$</span>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={countedValue}
                      onChange={e => setCountedValue(e.target.value)}
                      placeholder="0,00"
                      style={{ 
                        width: '100%', background: '#080705', border: `1px solid ${G.border}`, 
                        borderRadius: 6, padding: '8px 8px 8px 30px', color: '#fff', 
                        fontSize: 14, fontWeight: 800, outline: 'none'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = G.gold}
                      onBlur={e => e.currentTarget.style.borderColor = G.border}
                    />
                  </div>
                  
                  {countedValue && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px dashed ${G.border}` }}>
                      {(() => {
                        const parsed = parseFloat(countedValue.replace(',', '.')) || 0;
                        const diff = parsed - drawerSummary.saldoAtual;
                        const isZero = Math.abs(diff) < 0.01;
                        const isSobra = diff > 0.01;
                        
                        const statusColor = isZero ? G.green : (isSobra ? G.amber : G.red);
                        const statusText = isZero ? 'Exato' : (isSobra ? 'Sobra' : 'Falta');
                        const statusIcon = isZero ? '🟢' : (isSobra ? '🟡' : '🔴');
                        
                        return (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 10, color: G.dim, fontWeight: 700 }}>Situação:</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: `${statusColor}15`, border: `1px solid ${statusColor}40` }}>
                                <span style={{ fontSize: 10 }}>{statusIcon}</span>
                                <span style={{ fontSize: 10, fontWeight: 800, color: statusColor, textTransform: 'uppercase' }}>{statusText}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                              <span style={{ fontSize: 9, color: G.dim }}>Diferença</span>
                              <span style={{ fontSize: 13, fontWeight: 900, color: statusColor }}>
                                {isZero ? 'R$ 0,00' : `${diff > 0 ? '+' : ''}R$ ${fmt(diff)}`}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ═══ COLUNA CENTRAL — 40% ══════════════════════════════════════════ */}
        <div style={{ ...S.col('40%'), background: G.bg }}>

          {/* ── Busca ── */}
          <div style={{ flexShrink: 0, padding: '10px 14px', borderBottom: `1px solid ${G.border}` }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: G.muted, pointerEvents: 'none' }} />
              <input
                ref={searchRef}
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Código • Código de Barras • Nome • Referência  (F4)"
                style={{
                  width: '100%', height: 46, paddingLeft: 42, paddingRight: 40,
                  borderRadius: 12, fontSize: 14, color: '#fff',
                  background: '#0d0b09', outline: 'none', transition: 'all 0.2s',
                  border: `1px solid ${G.border}`,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = G.borderG; e.currentTarget.style.boxShadow = `0 0 0 3px ${G.goldBg}`; }}
                onBlur={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.boxShadow = 'none'; }}
              />
              {query && (
                <button onClick={() => { setQuery(''); setSelectedProduct(null); }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: G.muted, cursor: 'pointer' }}>
                  <X style={{ width: 15, height: 15 }} />
                </button>
              )}
            </div>

            {query.length > 2 && searchResults && (searchResults as any[]).length > 0 && (
              <div style={{
                marginTop: 6, borderRadius: 12, border: `1px solid ${G.borderG}`,
                background: '#0d0b09', boxShadow: `0 16px 48px rgba(0,0,0,0.8), 0 0 0 1px ${G.goldBg}`,
                overflow: 'hidden', maxHeight: 220, overflowY: 'auto',
                scrollbarWidth: 'thin', scrollbarColor: `${G.border} transparent`,
              }}>
                {(searchResults as any[]).map((p: any) => (
                  <button key={p.id} onClick={() => handleSelectProduct(p)}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 14px', borderBottom: `1px solid ${G.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, transition: 'background 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.background = G.goldBg; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: 10, color: G.muted, marginTop: 2 }}>{p.sku} · Estoque: {p.stock} un</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 900, color: G.goldL }}>R$ {fmt(p.price)}</span>
                      <ChevronRight style={{ width: 14, height: 14, color: G.dim }} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Área central ── */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '12px 14px' }}>
            {selectedProduct ? (
              <div style={{
                borderRadius: 18, overflow: 'hidden',
                border: `1px solid ${G.borderG}`,
                boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${G.goldBg}`,
                background: `linear-gradient(160deg, #141008 0%, ${G.card} 100%)`,
              }}>
                <div style={{ height: 3, background: `linear-gradient(90deg, ${G.gold}, ${G.goldL}, ${G.goldXL}, ${G.goldL}, ${G.gold})` }} />

                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.2 }}>
                        {selectedProduct.name}
                      </h2>
                      <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                        <span style={S.tag(G.goldL, G.goldBg, G.borderG)}>#{selectedProduct.sku}</span>
                        {selectedProduct.categoryName && (
                          <span style={S.tag(G.muted, '#1a1710', G.border)}>{selectedProduct.categoryName}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} style={{ background: 'transparent', border: 'none', color: G.dim, cursor: 'pointer', padding: 4 }}>
                      <X style={{ width: 16, height: 16 }} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
                    {[
                      { label: 'Compra', value: `R$ ${fmt(selectedProduct.costPrice ?? 0)}`, color: G.muted },
                      { label: 'Venda',  value: `R$ ${fmt(selectedProduct.price)}`,           color: G.goldL },
                      { label: 'Estoque',value: `${selectedProduct.stock} un`,                color: selectedProduct.stock > 0 ? G.green : G.red },
                      { label: 'SKU',    value: selectedProduct.sku,                          color: G.muted },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ padding: '9px 12px', borderRadius: 10, background: '#0d0b09', border: `1px solid ${G.border}`, textAlign: 'center' }}>
                        <p style={{ fontSize: 9, color: G.dim, fontWeight: 600 }}>{label}</p>
                        <p style={{ fontSize: 13, color, fontWeight: 800, marginTop: 2 }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <button onClick={() => setProductQty(q => Math.max(1, q - 1))}
                      style={{ width: 38, height: 38, borderRadius: 10, background: '#1a1710', border: `1px solid ${G.border}`, color: G.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
                      <Minus style={{ width: 14, height: 14 }} />
                    </button>
                    <input type="number" value={productQty}
                      onChange={e => setProductQty(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ flex: 1, height: 38, textAlign: 'center', background: '#0d0b09', border: `1px solid ${G.borderG}`, borderRadius: 10, color: G.goldL, fontSize: 22, fontWeight: 900, outline: 'none' }} />
                    <button onClick={() => setProductQty(q => q + 1)}
                      style={{ width: 38, height: 38, borderRadius: 10, background: '#1a1710', border: `1px solid ${G.border}`, color: G.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus style={{ width: 14, height: 14 }} />
                    </button>
                    <div style={{ padding: '8px 14px', borderRadius: 10, background: G.goldBg, border: `1px solid ${G.borderG}`, textAlign: 'center' }}>
                      <p style={{ fontSize: 9, color: G.muted }}>Subtotal</p>
                      <p style={{ fontSize: 16, fontWeight: 900, color: G.goldXL }}>R$ {fmt(selectedProduct.price * productQty)}</p>
                    </div>
                  </div>

                  <button onClick={() => addItem(selectedProduct)}
                    style={{
                      width: '100%', height: 44, borderRadius: 12,
                      background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                      border: 'none', color: '#0a0908', fontWeight: 900, fontSize: 14,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: `0 6px 24px ${G.goldGlow}`, transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.boxShadow = `0 8px 32px rgba(201,148,26,0.60)`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={e => { e.currentTarget.style.boxShadow = `0 6px 24px ${G.goldGlow}`; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <Plus style={{ width: 18, height: 18 }} />
                    ADICIONAR À VENDA
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <div style={{ padding: 28, borderRadius: 24, background: G.card, border: `1px solid ${G.border}` }}>
                  <Package style={{ width: 52, height: 52, color: G.dim, opacity: 0.4 }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: G.muted }}>Nenhum produto selecionado</p>
                  <p style={{ fontSize: 11, color: G.dim, marginTop: 4 }}>Digite no campo acima para buscar</p>
                </div>
                <button onClick={() => setShowNumpad(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: G.card, border: `1px solid ${G.border}`, color: G.muted, cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = G.borderG; e.currentTarget.style.color = G.goldL; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.color = G.muted; }}
                >
                  <Keyboard style={{ width: 13, height: 13 }} />
                  {showNumpad ? 'Ocultar Teclado' : 'Teclado Numérico'}
                </button>
                {showNumpad && (
                  <div style={{ width: '100%', maxWidth: 280 }}>
                    <NumericKeyboard
                      onInput={key => setQuery(p => p + key)}
                      onBackspace={() => setQuery(p => p.slice(0, -1))}
                      onEnter={() => {}}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══ COLUNA DIREITA — 28% ══════════════════════════════════════════ */}
        <div style={{ ...S.col('28%'), borderLeft: `1px solid ${G.border}`, background: G.surface, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: `${G.border} transparent` }}>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* V2.4 — RESUMO DA VENDA */}
            <div>
              <p style={S.label()}>Resumo da Venda</p>
              <div style={{ padding: '12px 14px', borderRadius: 12, background: '#0a0908', border: `1px solid ${G.borderG}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Qtd Itens / Volumes', value: `${cart.length} / ${cart.reduce((sum, item) => sum + item.quantity, 0)}`, color: G.text },
                  { label: 'Valor Original', value: `R$ ${fmt(subtotal)}`, color: G.muted },
                  { label: 'Desconto', value: `-R$ ${fmt(totalDiscount)}`, color: G.red },
                  { label: 'Custo Total', value: `R$ ${fmt(cartCost)}`, color: G.dim },
                  { label: 'Lucro Bruto', value: `R$ ${fmt(cartGrossProfit)}`, color: G.green },
                  { label: 'Lucro Líquido', value: `R$ ${fmt(cartNetProfit)}`, color: G.goldL },
                  { label: 'Margem % / Markup %', value: `${cartMargin}% / ${cartMarkup}%`, color: G.goldL },
                ].map(({ label, value, color }, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: G.dim }}>{label}</span>
                    <span style={{ color, fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
                
                <div style={{ height: 1, background: `linear-gradient(90deg, ${G.borderG}, transparent)`, margin: '4px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: G.muted }}>Total Final</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: G.goldXL, lineHeight: 1 }}>R$ {fmt(totalGeral)}</span>
                </div>

                {selectedPayments.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                    <span style={{ color: G.dim }}>Valor Recebido</span>
                    <span style={{ color: G.green, fontWeight: 700 }}>R$ {fmt(paidSoFar)}</span>
                  </div>
                )}
                
                {troco > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                    <span style={{ color: G.dim }}>Troco</span>
                    <span style={{ color: G.amber, fontWeight: 700 }}>R$ {fmt(troco)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── FORMAS DE PAGAMENTO ── */}
            <div>
              <p style={S.label()}>Forma de Pagamento</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {PAYMENTS.map(({ method, label, icon: Icon, color, bg, brd }) => {
                  const isActive = selectedPayments.some(p => p.method === method);
                  return (
                    <button key={method} onClick={() => togglePayment(method)}
                      style={{
                        height: 58, borderRadius: 12, border: isActive ? `2px solid ${color}` : `1px solid ${brd}`,
                        background: isActive ? `${color}18` : bg,
                        color, cursor: 'pointer', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 4, transition: 'all 0.18s',
                        boxShadow: isActive ? `0 0 20px ${color}30` : 'none',
                        transform: isActive ? 'scale(0.97)' : 'scale(1)',
                      }}
                      onMouseOver={e => { if (!isActive) { e.currentTarget.style.border = `1px solid ${color}60`; e.currentTarget.style.background = `${color}12`; } }}
                      onMouseOut={e => { if (!isActive) { e.currentTarget.style.border = `1px solid ${brd}`; e.currentTarget.style.background = bg; } }}
                    >
                      <Icon style={{ width: 16, height: 16 }} />
                      <span style={{ fontSize: 10, fontWeight: 700 }}>{label}</span>
                      {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: color }} />}
                    </button>
                  );
                })}
              </div>

              {selectedPayments.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {selectedPayments.map(p => {
                    const m = PAYMENTS.find(pm => pm.method === p.method);
                    const pct = totalGeral > 0 ? ((p.amount / totalGeral) * 100).toFixed(1).replace('.', ',') : '0';
                    return (
                      <div key={p.method} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 8, background: G.card, border: `1px solid ${G.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: m?.color }}>{m?.label}</span>
                          <span style={{ fontSize: 9, color: G.dim, background: '#1a1710', padding: '2px 6px', borderRadius: 4 }}>{pct}%</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="number" value={p.amount}
                            onChange={e => setSelectedPayments(prev => prev.map(sp => sp.method === p.method ? { ...sp, amount: parseFloat(e.target.value) || 0 } : sp))}
                            style={{ width: 70, textAlign: 'right', background: 'transparent', border: 'none', borderBottom: `1px solid ${G.border}`, color: '#fff', fontSize: 11, fontWeight: 700, outline: 'none' }} />
                          <button onClick={() => togglePayment(p.method)} style={{ background: 'transparent', border: 'none', color: G.dim, cursor: 'pointer' }}>
                            <X style={{ width: 12, height: 12 }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── BOTÃO FINALIZAR ── */}
            <button
              onClick={finalizeSale}
              disabled={cart.length === 0 || processSale.isPending}
              style={{
                width: '100%', height: 50, borderRadius: 14,
                background: cart.length === 0 ? '#1a1710' : `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                border: cart.length === 0 ? `1px solid ${G.border}` : 'none',
                color: cart.length === 0 ? G.dim : '#0a0908',
                fontWeight: 900, fontSize: 14, cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: cart.length > 0 ? `0 6px 28px ${G.goldGlow}` : 'none',
                transition: 'all 0.2s', letterSpacing: '0.03em',
              }}
              onMouseOver={e => { if (cart.length > 0) e.currentTarget.style.boxShadow = `0 8px 36px rgba(201,148,26,0.60)`; }}
              onMouseOut={e => { if (cart.length > 0) e.currentTarget.style.boxShadow = `0 6px 28px ${G.goldGlow}`; }}
            >
              <CheckCircle style={{ width: 18, height: 18 }} />
              {processSale.isPending ? 'FINALIZANDO...' : 'FINALIZAR VENDA (F9)'}
            </button>

            {/* ── AÇÕES ── */}
            <div>
              <p style={S.label()}>Ações</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { label: 'Nova Venda', icon: RefreshCw,  color: G.goldL,  bg: G.goldBg,       brd: G.borderG,   fn: () => { setCart([]); setSelectedPayments([]); setDiscount(0); setAcrescimo(0); setSaleNumber(n => n + 1); setGlobalDiscountState(null); setCustomerName('Consumidor Final'); setCustomerDoc(''); setCustomerPhone(''); setCustomerObs(''); }, key: 'F2' },
                  { label: 'Pagamento',  icon: DollarSign, color: G.green,  bg: 'rgba(16,185,129,0.08)', brd: 'rgba(16,185,129,0.28)', fn: () => document.getElementById('received-amount-input')?.focus(), key: 'F4' },
                  { label: 'Desconto',   icon: TrendingDown, color: G.goldL, bg: G.goldBg,      brd: G.borderG,   fn: () => setShowDiscountModal(true), key: 'F6' },
                  { label: 'Sangria',    icon: DollarSign, color: G.amber,  bg: 'rgba(245,158,11,0.08)',brd: 'rgba(245,158,11,0.28)', fn: () => setShowSangriaModal(true), key: 'F7' },
                  { label: 'Cancelar',   icon: X,          color: G.red,    bg: G.redBg,        brd: G.redBrd,    fn: () => { setCart([]); setSelectedPayments([]); setGlobalDiscountState(null); toast.info('Venda cancelada.'); }, key: 'ESC' },
                  { label: 'Gaveta',     icon: DoorOpen,   color: G.muted,  bg: '#1a1710',      brd: G.border,    fn: () => toast.success('Gaveta aberta!') },
                ].map(({ label, icon: Icon, color, bg, brd, fn, key }) => (
                  <button key={label} onClick={fn}
                    style={{
                      height: 40, borderRadius: 10, border: `1px solid ${brd}`,
                      background: bg, color, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(0.98)'; }}
                    onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <Icon style={{ width: 14, height: 14 }} />
                    {label}
                  </button>
                ))}

                {/* V2.2 — Botão Sangria profissional (span 2) */}
                <button
                  onClick={() => setShowSangriaModal(true)}
                  style={{
                    gridColumn: 'span 2', height: 44, borderRadius: 10,
                    border: `1px solid ${G.amberBrd}`, background: G.amberBg,
                    color: G.amber, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: 12, fontWeight: 800, transition: 'all 0.15s',
                    boxShadow: `0 4px 16px rgba(245,158,11,0.15)`,
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.16)'; e.currentTarget.style.boxShadow = `0 6px 24px rgba(245,158,11,0.30)`; }}
                  onMouseOut={e => { e.currentTarget.style.background = G.amberBg; e.currentTarget.style.boxShadow = `0 4px 16px rgba(245,158,11,0.15)`; }}
                >
                  <Landmark style={{ width: 15, height: 15 }} />
                  SANGRIA (F7)
                  <span style={{ fontSize: 9, opacity: 0.6, fontFamily: 'monospace' }}>(F7)</span>
                </button>
              </div>
            </div>

            {/* V2.2 — PAINEL DE SANGRIAS ── */}
            <div>
              <button
                onClick={() => setShowSangriaPanel(v => !v)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 6,
                }}
              >
                <span style={S.label({ marginBottom: 0 })}>Painel de Sangrias</span>
                {showSangriaPanel
                  ? <ChevronUp style={{ width: 13, height: 13, color: G.dim }} />
                  : <ChevronDown style={{ width: 13, height: 13, color: G.dim }} />
                }
              </button>

              {showSangriaPanel && (
                <div style={{ borderRadius: 12, border: `1px solid ${G.amberBrd}`, background: '#0c0a06', overflow: 'hidden' }}>
                  <div style={{ height: 2, background: `linear-gradient(90deg, ${G.amber}, transparent)` }} />
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                      {[
                        { label: 'Total Sangrias', value: sangriasHoje.length.toString(), color: G.amber },
                        { label: 'Total Retirado', value: `R$ ${fmt(totalSangrado)}`, color: G.red },
                        { label: 'Saldo Atual', value: `R$ ${fmt(saldoAtual)}`, color: G.goldL },
                        { label: 'Terminal', value: openDrawer?.name || '—', color: G.muted },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ padding: '7px 9px', borderRadius: 8, background: '#0a0906', border: `1px solid ${G.border}` }}>
                          <p style={{ fontSize: 9, color: G.dim }}>{label}</p>
                          <p style={{ fontSize: 12, fontWeight: 800, color, marginTop: 1 }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {ultimaSangria && (
                      <div style={{ padding: '8px 10px', borderRadius: 8, background: '#0f0c08', border: `1px solid ${G.border}` }}>
                        <p style={{ fontSize: 9, color: G.dim, marginBottom: 4 }}>ÚLTIMA SANGRIA</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 900, color: G.amber }}>R$ {fmt(ultimaSangria.amount)}</p>
                            <p style={{ fontSize: 10, color: G.muted, marginTop: 2 }}>{ultimaSangria.reason || ultimaSangria.description}</p>
                            <p style={{ fontSize: 9, color: G.dim }}>
                              {SANGRIA_DESTINATIONS.find(d => d.value === ultimaSangria.destination)?.label || ultimaSangria.destination || 'N/A'}
                              {' · '}{new Date(ultimaSangria.createdAt).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                          <TrendingDown style={{ width: 20, height: 20, color: G.red, opacity: 0.6 }} />
                        </div>
                      </div>
                    )}

                    {sangriasHoje.length === 0 && (
                      <p style={{ fontSize: 11, color: G.dim, textAlign: 'center', padding: '8px 0' }}>Nenhuma sangria nesta sessão</p>
                    )}

                    <button
                      onClick={() => setShowSangriaModal(true)}
                      style={{
                        marginTop: 8, width: '100%', height: 34, borderRadius: 8,
                        background: G.amberBg, border: `1px solid ${G.amberBrd}`,
                        color: G.amber, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <Plus style={{ width: 12, height: 12 }} />
                      Nova Sangria
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── TECLADO NUMÉRICO ── */}
            <div>
              <p style={S.label()}>Teclado Numérico</p>
              <NumericKeyboard
                onInput={key => setQuery(p => p + key)}
                onBackspace={() => setQuery(p => p.slice(0, -1))}
                onEnter={() => {}}
              />
            </div>

            {/* ── ATALHOS ── */}
            <div>
              <p style={S.label()}>Atalhos de Teclado</p>
              <div style={{ borderRadius: 12, border: `1px solid ${G.border}`, padding: 10, background: '#0d0b09', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  ['F2', 'Nova Venda'],
                  ['F4', 'Pagamento'],
                  ['F6', 'Desconto'],
                  ['F7', 'Sangria'],
                  ['F9', 'Fechar Venda'],
                  ['ESC', 'Cancelar Venda'],
                ].map(([k, d]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <kbd style={{ padding: '2px 8px', borderRadius: 5, background: G.goldBg, border: `1px solid ${G.borderG}`, color: G.goldL, fontSize: 10, fontFamily: 'monospace', fontWeight: 900 }}>{k}</kbd>
                    <span style={{ fontSize: 10, color: G.dim }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
