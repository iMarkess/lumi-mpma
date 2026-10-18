'use client';

import { useState } from 'react';
import { Copy, KeyRound, Plus, UserCheck, UserX } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useAdminData } from '@/components/admin/ui';
import { adminApi, fmtDate, ROLE_LABEL, tempPassword, type Role, type StaffUser } from '@/lib/adminApi';
import s from '../admin.module.css';

const maskCpf = (c: string) => (c.length === 11 ? `***.${c.slice(3, 6)}.${c.slice(6, 9)}-**` : c);

const formatCpf = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})-?(\d{1,2})$/, '$1-$2');
};

type Reveal = { title: string; name: string; password: string };

export default function UsersPage() {
  const { token, currentUser } = useAppContext();
  const { data: users, error, loading, reload } = useAdminData((tk) => adminApi.users(tk));
  const [creating, setCreating] = useState(false);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [busy, setBusy] = useState('');
  const [actionError, setActionError] = useState('');

  const myRole = currentUser?.role;
  const isMe = (u: StaffUser) => u.id === currentUser?.id;

  const toggle = async (u: StaffUser) => {
    if (!token) return;
    if (u.active && !confirm(`Desativar a conta de ${u.name}? A pessoa perde o acesso ao painel na hora.`)) return;
    setBusy(u.id);
    setActionError('');
    try {
      await adminApi.updateUser(token, u.id, { active: !u.active });
      await reload();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy('');
    }
  };

  const resetPassword = async (u: StaffUser) => {
    if (!token || !confirm(`Gerar uma nova senha para ${u.name}? A senha atual deixa de funcionar.`)) return;
    const password = tempPassword();
    setBusy(u.id);
    setActionError('');
    try {
      await adminApi.updateUser(token, u.id, { password });
      setReveal({ title: 'Nova senha gerada', name: u.name, password });
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className={s.page}>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>Equipe</h1>
          <p className={s.subtitle}>Quem acessa o painel. Contas desativadas perdem o acesso imediatamente.</p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={() => setCreating(true)}>
          <Plus size={18} aria-hidden="true" /> Adicionar pessoa
        </button>
      </div>

      {(error || actionError) && <p className={s.error}>{error || actionError}</p>}

      <section className={s.card}>
        {loading && !users ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {[0, 1, 2].map((i) => <span key={i} className={s.skeleton} style={{ height: 48 }} />)}
          </div>
        ) : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Perfil</th>
                  <th>Situação</th>
                  <th>Desde</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((u) => (
                  <tr key={u.id} style={{ opacity: u.active ? 1 : 0.55 }}>
                    <td>
                      <strong>{u.name}</strong>
                      {isMe(u) && <span className={s.hint}> (você)</span>}
                    </td>
                    <td>{maskCpf(u.cpf)}</td>
                    <td>{ROLE_LABEL[u.role]}</td>
                    <td>
                      <span className={s.badge} data-status={u.active ? 'concluida' : 'rejeitada'}>
                        {u.active ? 'Ativa' : 'Desativada'}
                      </span>
                    </td>
                    <td>{fmtDate(u.createdAt, false)}</td>
                    <td>
                      {!isMe(u) && (
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button type="button" className={s.btn} onClick={() => resetPassword(u)} disabled={busy === u.id || !u.active} title="Gerar nova senha">
                            <KeyRound size={16} aria-hidden="true" /> Nova senha
                          </button>
                          <button type="button" className={u.active ? s.btnDanger : s.btn} onClick={() => toggle(u)} disabled={busy === u.id}>
                            {u.active ? <UserX size={16} aria-hidden="true" /> : <UserCheck size={16} aria-hidden="true" />}
                            {u.active ? 'Desativar' : 'Reativar'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className={s.hint}>
        Para trocar a sua própria senha, use <a href="/admin/settings" style={{ textDecoration: 'underline' }}>Minha conta</a>.
      </p>

      {creating && (
        <CreateModal
          canCreateMaster={myRole === 'master'}
          onClose={() => setCreating(false)}
          onCreated={(name, password) => {
            setCreating(false);
            setReveal({ title: 'Conta criada', name, password });
            reload();
          }}
        />
      )}

      {reveal && (
        <div className={s.modalScrim} role="dialog" aria-modal="true" aria-labelledby="senha-titulo">
          <div className={s.modal}>
            <h2 id="senha-titulo" className={s.modalTitle}>{reveal.title}</h2>
            <p>
              Passe esta senha para <strong>{reveal.name}</strong> por um canal seguro. Ela não será
              mostrada de novo. Peça para a pessoa trocar em “Minha conta” no primeiro acesso.
            </p>
            <div className={s.code}>
              <span>{reveal.password}</span>
              <button type="button" className={s.btn} onClick={() => navigator.clipboard?.writeText(reveal.password)}>
                <Copy size={16} aria-hidden="true" /> Copiar
              </button>
            </div>
            <div className={s.modalActions}>
              <button type="button" className={s.btnPrimary} onClick={() => setReveal(null)}>Pronto, anotei</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateModal({
  canCreateMaster,
  onClose,
  onCreated,
}: {
  canCreateMaster: boolean;
  onClose: () => void;
  onCreated: (name: string, password: string) => void;
}) {
  const { token } = useAppContext();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [role, setRole] = useState<Role>('OUVIDORIA');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const password = tempPassword();
    setSaving(true);
    setError('');
    try {
      await adminApi.createUser(token, { name: name.trim(), cpf, role, password });
      onCreated(name.trim(), password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={s.modalScrim} role="dialog" aria-modal="true" aria-labelledby="novo-titulo">
      <form className={s.modal} onSubmit={submit}>
        <h2 id="novo-titulo" className={s.modalTitle}>Adicionar pessoa à equipe</h2>
        <label className={s.field}>
          Nome completo
          <input className={s.input} value={name} onChange={(e) => setName(e.target.value)} required minLength={3} autoFocus />
        </label>
        <label className={s.field}>
          CPF
          <input className={s.input} value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} inputMode="numeric" placeholder="000.000.000-00" required />
          <span className={s.hint}>É o login da pessoa no painel.</span>
        </label>
        <label className={s.field}>
          Perfil
          <select className={s.select} value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="OUVIDORIA">Ouvidoria: vê e trata denúncias</option>
            <option value="SECRETARIA">Secretaria: denúncias e relatórios</option>
            <option value="PROMOTOR">Promotor(a): tudo, inclusive equipe</option>
            {canCreateMaster && <option value="MASTER">Administrador</option>}
          </select>
        </label>
        <p className={s.hint}>Uma senha temporária é gerada e mostrada na próxima tela.</p>
        {error && <p className={s.error}>{error}</p>}
        <div className={s.modalActions}>
          <button type="button" className={s.btn} onClick={onClose}>Cancelar</button>
          <button type="submit" className={s.btnPrimary} disabled={saving}>{saving ? 'Criando…' : 'Criar conta'}</button>
        </div>
      </form>
    </div>
  );
}
