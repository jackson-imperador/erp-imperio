/**
 * Império ERP — Service Worker Mínimo (PWA Install Only)
 * 
 * INTENÇÃO: Este SW existe exclusivamente para satisfazer os critérios de
 * instalabilidade do PWA (Chrome, Edge, Safari, Firefox).
 * 
 * NÃO implementa:
 *   - Cache de API
 *   - Cache de páginas / assets estáticos
 *   - Modo offline
 *   - Background Sync
 *   - Push Notifications
 * 
 * Todas as requisições passam diretamente para a rede (passthrough).
 */

const SW_VERSION = 'imperio-erp-pwa-v1';

// Install: ativa imediatamente, sem pré-cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: remove caches antigos (de versões anteriores do SW), assume controle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: passthrough — NENHUMA interceptação, NENHUM cache
// Todas as requisições (API, páginas, assets) vão direto para a rede
self.addEventListener('fetch', (event) => {
  // Não chama event.respondWith() — deixa o browser tratar normalmente
});
