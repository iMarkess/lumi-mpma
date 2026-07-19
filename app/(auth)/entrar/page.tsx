'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import { useCitizenAuth } from '@/context/CitizenAuth';
import GoogleSignIn from '@/components/GoogleSignIn';
import styles from '../Auth.module.css';

export default function EntrarPage() {
  const router = useRouter();
  const { login, loginWithGoogle, loading, user, ready } = useCitizenAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) router.replace('/app');
  }, [ready, user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(identifier, password);
      router.replace('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
    }
  }

  async function onGoogle(credential: string) {
    setError(null);
    try {
      await loginWithGoogle(credential);
      router.replace('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no login Google.');
    }
  }

  return (
    <main className={styles.shell}>
      <div className={styles.hero} />
      <div className={styles.content}>
        <div className={styles.logoBox}>
          <img className={styles.logo} src="/images/lumi_logo.png" alt="MPMA" />
        </div>
        <div className={styles.brandName}>LUMI</div>
        <div className={styles.brandSub}>Ministério Público do Maranhão</div>

        <form className={styles.card} onSubmit={submit}>
          <h1 className={styles.title}>Entrar</h1>
          <p className={styles.subtitle}>Acesse sua conta para denunciar e acompanhar.</p>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>CPF ou e-mail</label>
            <div className={styles.inputWrap}>
              <User size={18} className={styles.inputIcon} />
              <input
                className={styles.input}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="000.000.000-00"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Senha</label>
            <div className={styles.inputWrap}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                className={styles.input}
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.eye}
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner} /> : (<><LogIn size={18} /> Entrar</>)}
          </button>

          <div className={styles.divider}>ou</div>
          <GoogleSignIn onCredential={onGoogle} />

          <div className={styles.switch}>
            Não tem conta? <Link href="/cadastro">Cadastre-se</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
