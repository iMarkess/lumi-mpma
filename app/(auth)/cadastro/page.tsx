'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  IdCard,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { useCitizenAuth } from '@/context/CitizenAuth';
import GoogleSignIn from '@/components/GoogleSignIn';
import styles from '../Auth.module.css';

function maskCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

export default function CadastroPage() {
  const router = useRouter();
  const { register, loginWithGoogle, loading, user, ready } = useCitizenAuth();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) router.replace('/app');
  }, [ready, user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) return setError('Informe seu nome completo.');
    if (cpf.replace(/\D/g, '').length !== 11) return setError('CPF inválido.');
    if (password.length < 6) return setError('A senha precisa de ao menos 6 caracteres.');
    try {
      await register({ name: name.trim(), cpf, email: email.trim() || undefined, password });
      router.replace('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar.');
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
          <img className={styles.logo} src="/images/lumi_logo.png" alt="LUMI" />
        </div>
        <div className={styles.brandName}>Criar conta</div>
        <div className={styles.brandSub}>Rápido e seguro · Sem burocracia</div>

        <form className={styles.card} onSubmit={submit}>
          <h1 className={styles.title}>Cadastro</h1>
          <p className={styles.subtitle}>Seus dados ficam protegidos e sigilosos.</p>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Nome completo</label>
            <div className={styles.inputWrap}>
              <User size={18} className={styles.inputIcon} />
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>CPF</label>
            <div className={styles.inputWrap}>
              <IdCard size={18} className={styles.inputIcon} />
              <input
                className={styles.input}
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>E-mail <span style={{ fontWeight: 400 }}>(opcional)</span></label>
            <div className={styles.inputWrap}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
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
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
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
            {loading ? <span className={styles.spinner} /> : (<><UserPlus size={18} /> Criar conta</>)}
          </button>

          <div className={styles.divider}>ou</div>
          <GoogleSignIn onCredential={onGoogle} />

          <div className={styles.switch}>
            Já tem conta? <Link href="/entrar">Entrar</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
