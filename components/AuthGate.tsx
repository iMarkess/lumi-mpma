'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCitizenAuth } from '@/context/CitizenAuth';

/**
 * Protege rotas do app: sem conta → redireciona para /entrar.
 * Mostra um splash enquanto lê a sessão salva.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, ready } = useCitizenAuth();

  useEffect(() => {
    if (ready && !user) router.replace('/entrar');
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-deep)',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            border: '3px solid rgba(0,69,142,0.2)',
            borderTopColor: 'var(--secondary)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
