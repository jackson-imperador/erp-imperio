
'use client';
import { useAuthStore } from '@/store/authStore';

export function Header() {
  const user = useAuthStore(s => s.user);

  return (
    <header className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center">
        <span className="text-sm text-zinc-500 font-medium">Ambiente Enterprise: Produção</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{user?.name || 'Administrador'}</span>
            <span className="text-xs text-zinc-500">{user?.role || 'System Admin'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
