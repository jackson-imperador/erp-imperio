'use client';

import { useState } from 'react';
import { PosCartItem } from '@/types/pdv';
import { NumericKeyboard } from '@/components/pdv/PDVWidgets';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, User, CreditCard, X, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useProductSearch, usePdvMutations } from '@/hooks/usePDV';
import Link from 'next/link';

export default function FrenteDeCaixaPage() {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const { data: searchResults } = useProductSearch(query);
  const { processSale } = usePdvMutations();

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);

  const addItem = (product: any) => {
    setCart(prev => {
      const existing = prev.find(p => p.productId === product.id);
      if (existing) {
        return prev.map(p => p.productId === product.id ? { ...p, quantity: p.quantity + 1, total: (p.quantity + 1) * p.unitPrice } : p);
      }
      return [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unitPrice: product.price,
        quantity: 1,
        discount: 0,
        total: product.price
      }];
    });
    setQuery('');
  };

  const finalizeSale = async () => {
    if (cart.length === 0) return toast.error('Carrinho vazio.');
    
    try {
      await processSale.mutateAsync({
        cashierId: 'default-drawer',
        operatorId: 'operator',
        items: cart,
        subtotal,
        discountTotal: 0,
        total: subtotal,
        payments: [{ method: 'CASH', amount: subtotal }],
        status: 'COMPLETED'
      });
      toast.success('Venda concluída com sucesso!');
      setCart([]);
    } catch {
      toast.error('Erro ao finalizar venda.');
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] -m-6 flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Esquerda: Carrinho */}
      <div className="w-full md:w-1/3 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-indigo-600 text-white">
          <h2 className="font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> CAIXA LIVRE
          </h2>
          <span className="text-xs bg-indigo-800 px-2 py-1 rounded">OP: ADMIN</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <p>Carrinho vazio</p>
            </div>
          ) : (
            <div className="space-y-1">
              {cart.map((item, index) => (
                <div key={item.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800 flex justify-between items-center group">
                  <div className="flex-1">
                    <p className="text-sm font-semibold truncate max-w-[200px]">{String(index + 1).padStart(3, '0')} - {item.name}</p>
                    <p className="text-xs text-zinc-500">{item.quantity} un x R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <div className="flex justify-between items-end mb-4">
             <span className="text-xl text-zinc-600 dark:text-zinc-400 font-semibold">Total a Pagar</span>
             <span className="text-4xl font-black text-emerald-600 dark:text-emerald-500">
               R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
             </span>
           </div>
           <div className="grid grid-cols-2 gap-2">
             <Button variant="outline" className="h-12" onClick={() => setCart([])}>Cancelar (F4)</Button>
             <Button className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={finalizeSale} disabled={cart.length === 0}>Receber (F3)</Button>
           </div>
        </div>
      </div>

      {/* Direita: Busca e Ações */}
      <div className="w-full md:w-2/3 flex flex-col bg-zinc-50 dark:bg-zinc-950 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400" />
          <Input 
            autoFocus
            className="w-full pl-12 h-14 text-lg bg-white dark:bg-zinc-900 shadow-sm border-zinc-200 dark:border-zinc-800 rounded-xl"
            placeholder="Código de Barras, SKU ou Nome do Produto (F2)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query.length > 2 && searchResults && searchResults.length > 0 && (
            <div className="absolute top-16 left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl z-10 max-h-64 overflow-y-auto">
              {searchResults.map(p => (
                <button 
                  key={p.id} 
                  className="w-full text-left p-4 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 flex justify-between"
                  onClick={() => addItem(p)}
                >
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-zinc-500">Estoque: {p.stock} un</p>
                  </div>
                  <span className="font-bold text-emerald-600">R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
           <div>
             <h3 className="text-sm font-semibold text-zinc-500 uppercase mb-3">Ações Rápidas</h3>
             <div className="grid grid-cols-2 gap-3">
               <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1"><User className="w-5 h-5"/>Identificar Cliente</Button>
               <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1"><Printer className="w-5 h-5"/>Reimprimir Último</Button>
               <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 text-amber-600 dark:text-amber-500"><CreditCard className="w-5 h-5"/>Sangria / Suprimento</Button>
               <Link href="/dashboard/pdv">
                 <Button variant="outline" className="h-16 w-full flex flex-col items-center justify-center gap-1">Voltar ao Menu</Button>
               </Link>
             </div>
           </div>
           
           <div>
             <h3 className="text-sm font-semibold text-zinc-500 uppercase mb-3">Teclado Numérico (Touch)</h3>
             <NumericKeyboard onInput={() => {}} onBackspace={() => {}} onEnter={() => {}} />
           </div>
        </div>
      </div>
    </div>
  );
}
