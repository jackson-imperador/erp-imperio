'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered: ', registration.scope);
          },
          (err) => {
            console.log('SW registration failed: ', err);
          }
        );
      });
    }
  }, []);

  return null;
}
