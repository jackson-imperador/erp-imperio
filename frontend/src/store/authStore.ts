
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState } from '../types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
      version: 2, // bumped: forces re-login for sessions with missing companyId
      migrate: (persisted: any, version) => {
        // If old session has user without companyId, invalidate it
        if (persisted?.user && !persisted.user.companyId) {
          return { user: null, token: null };
        }
        return persisted;
      },
    }
  )
);
