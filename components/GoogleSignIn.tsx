'use client';

import { useEffect, useRef } from 'react';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

interface Props {
  onCredential: (credential: string) => void;
  /** Mostra o One Tap (seletor de contas aparece sozinho ao abrir a tela). */
  oneTap?: boolean;
}

/**
 * "Continuar com o Google" (Google Identity Services).
 * Ao clicar, abre o seletor de contas do Google; a conta é criada
 * automaticamente no primeiro acesso (o backend/decodificação cuidam disso).
 *
 * Requer NEXT_PUBLIC_GOOGLE_CLIENT_ID no build. Sem ele, mostra um aviso.
 */
export default function GoogleSignIn({ onCredential, oneTap = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CLIENT_ID || !ref.current) return;

    const render = () => {
      // @ts-expect-error GIS injeta window.google
      const g = window.google;
      if (!g?.accounts?.id) return;
      g.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (resp: { credential: string }) => onCredential(resp.credential),
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: 'popup',
      });
      if (ref.current) {
        g.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'center',
          locale: 'pt-BR',
        });
      }
      // Seletor de contas aparece automaticamente (One Tap)
      if (oneTap) g.accounts.id.prompt();
    };

    // @ts-expect-error GIS
    if (window.google?.accounts?.id) {
      render();
      return;
    }
    const existing = document.getElementById('gsi-script');
    if (existing) {
      existing.addEventListener('load', render);
      return;
    }
    const script = document.createElement('script');
    script.id = 'gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = render;
    document.head.appendChild(script);
  }, [onCredential, oneTap]);

  if (!CLIENT_ID) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          height: 52,
          borderRadius: 999,
          border: '1px dashed var(--border-strong)',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
          fontWeight: 600,
          textAlign: 'center',
          padding: '0 12px',
        }}
        title="Defina NEXT_PUBLIC_GOOGLE_CLIENT_ID para ativar"
      >
        Login Google — configure o Client ID (ver GOOGLE-LOGIN.md)
      </div>
    );
  }

  return <div ref={ref} style={{ display: 'flex', justifyContent: 'center' }} />;
}
