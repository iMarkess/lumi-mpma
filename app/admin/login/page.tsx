'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import styles from './Login.module.css';

const formatCpf = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})-?(\d{1,2})$/, '$1-$2');
};

export default function AdminLoginPage() {
  const { login } = useAppContext();
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await login(cpf, password);
    setLoading(false);
    if (res.success) router.replace('/admin');
    else setError(res.error || 'CPF ou senha incorretos.');
  };

  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <form className={styles.card} onSubmit={submit}>
        <Image src="/icons/icon-192.png" alt="" width={56} height={56} className={styles.logo} priority />
        <h1 className={styles.title}>Painel da equipe</h1>
        <p className={styles.subtitle}>Acesso restrito a quem trata as denúncias da LUMI.</p>

        <label className={styles.field}>
          <span>CPF</span>
          <span className={styles.inputWrap}>
            <User size={18} aria-hidden="true" />
            <input
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              autoComplete="username"
              required
            />
          </span>
        </label>

        <label className={styles.field}>
          <span>Senha</span>
          <span className={styles.inputWrap}>
            <Lock size={18} aria-hidden="true" />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              required
            />
            <button type="button" className={styles.eye} onClick={() => setShow((v) => !v)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? 'Entrando…' : (<>Entrar <ArrowRight size={18} aria-hidden="true" /></>)}
        </button>

        <button type="button" className={styles.link} onClick={() => setForgot((v) => !v)} aria-expanded={forgot}>
          Esqueci minha senha
        </button>
        {forgot && (
          <p className={styles.help}>
            Peça a um(a) promotor(a) da equipe para gerar uma nova senha em <strong>Equipe</strong>.
            Por segurança, a senha do painel não é enviada por e-mail.
          </p>
        )}

        <Link href="/" className={styles.back}>Voltar ao site</Link>
      </form>
    </main>
  );
}
