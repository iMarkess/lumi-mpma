'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useAdminData } from '@/components/admin/ui';
import { adminApi, ROLE_LABEL } from '@/lib/adminApi';
import s from '../admin.module.css';

export default function SettingsPage() {
  const { token } = useAppContext();
  const { data: me } = useAdminData((tk) => adminApi.me(tk));
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const weak = next.length > 0 && next.length < 8;
  const mismatch = confirmPw.length > 0 && confirmPw !== next;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || weak || mismatch || !next) return;
    setSaving(true);
    setMsg(null);
    try {
      await adminApi.changePassword(token, current, next);
      setMsg({ ok: true, text: 'Senha alterada. Use a nova senha no próximo acesso.' });
      setCurrent('');
      setNext('');
      setConfirmPw('');
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={s.page} style={{ maxWidth: 760 }}>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>Minha conta</h1>
          <p className={s.subtitle}>
            {me ? `${me.name} · ${ROLE_LABEL[me.role]}` : 'Carregando…'}
          </p>
        </div>
      </div>

      <form className={s.card} onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <div className={s.cardHead} style={{ marginBottom: 0 }}>
          <h2 className={s.cardTitle}>Trocar senha</h2>
          <ShieldCheck size={20} color="#059669" aria-hidden="true" />
        </div>
        <p className={s.hint}>
          Use pelo menos 8 caracteres, misturando letras e números. Não reutilize senhas de outros serviços.
        </p>
        <label className={s.field}>
          Senha atual
          <input className={s.input} type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </label>
        <label className={s.field}>
          Nova senha
          <input className={s.input} type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={8} maxLength={72} required aria-invalid={weak} />
          {weak && <span className={s.hint} style={{ color: '#C2290F' }}>Mínimo de 8 caracteres.</span>}
        </label>
        <label className={s.field}>
          Confirmar nova senha
          <input className={s.input} type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" required aria-invalid={mismatch} />
          {mismatch && <span className={s.hint} style={{ color: '#C2290F' }}>As senhas não conferem.</span>}
        </label>
        {msg && <p className={msg.ok ? s.success : s.error} role="status">{msg.text}</p>}
        <div>
          <button type="submit" className={s.btnPrimary} disabled={saving || weak || mismatch || !next}>
            {saving ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </div>
      </form>
    </div>
  );
}
