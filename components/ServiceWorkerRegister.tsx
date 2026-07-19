'use client';

import { useEffect } from 'react';

/**
 * Registra o service worker (/sw.js) para habilitar PWA:
 * instalação na tela inicial, funcionamento offline e push notifications.
 * Não renderiza nada.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return; // evita SW em dev

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .catch((err) => console.error('Falha ao registrar SW:', err));
    };

    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return null;
}
