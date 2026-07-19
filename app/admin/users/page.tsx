'use client';

import { useState } from 'react';
import { UserPlus, Mail, Shield, Trash2, Search, UserCheck, X } from 'lucide-react';
import styles from './Users.module.css';
import { useAppContext, Role } from '@/context/AppContext';

export default function UsersPage() {
  const { users, currentUser, addUser, removeUser } = useAppContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', cpf: '', role: 'ouvidoria' as Role });

  // Guard: Only Promotor Geral can access this page
  if (!currentUser || (currentUser.role !== 'promotor' && currentUser.role !== 'master')) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState} style={{ padding: 100, textAlign: 'center' }}>
          <Shield size={48} style={{ marginBottom: 20, color: 'var(--danger)', opacity: 0.5 }} />
          <h2>Acesso Restrito</h2>
          <p>Você não tem permissão para gerenciar usuários ou não está autenticado.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(formData);
    setFormData({ name: '', cpf: '', role: 'ouvidoria' });
    setShowAddForm(false);
  };

  const roleLabels: Record<Role, string> = {
    promotor: 'Promotor Geral',
    secretaria: 'Secretária',
    ouvidoria: 'Ouvidoria',
    master: 'Administrador Master'
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Gestão de Usuários</h1>
          <span>Controle de acessos e cargos da instituição</span>
        </div>
        <button className={styles.btnSave} onClick={() => setShowAddForm(true)}>
          <UserPlus size={18} style={{ marginRight: 8 }} /> Novo Usuário
        </button>
      </header>

      {showAddForm && (
        <div className={styles.addFormCard}>
          <h3>Cadastrar Novo Membro</h3>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>Nome Completo</label>
              <input 
                type="text" 
                placeholder="Ex: Ana Souza"
                required
                className={styles.inputField}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>CPF</label>
              <input 
                type="text" 
                placeholder="000.000.000-00"
                required
                className={styles.inputField}
                value={formData.cpf || ''}
                onChange={e => setFormData({...formData, cpf: e.target.value})}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Cargo / Permissão</label>
              <select 
                className={`${styles.inputField} ${styles.selectField}`}
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as Role})}
              >
                <option value="promotor">Promotor Geral</option>
                <option value="secretaria">Secretária</option>
                <option value="ouvidoria">Ouvidoria</option>
              </select>
            </div>
            <div className={styles.formActions}>
              <button type="button" onClick={() => setShowAddForm(false)} className={styles.btnCancel}>Cancelar</button>
              <button type="submit" className={styles.btnSave}>Salvar</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Membro</th>
              <th>Cargo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={`${styles.avatar} ${styles[user.role]}`}>
                      {user.avatar}
                    </div>
                    <strong>{user.name}</strong>
                  </div>
                </td>
                <td>
                  <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                    <Shield size={14} /> {roleLabels[user.role]}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#81c784', fontSize: '0.8rem', fontWeight: 600 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#81c784' }}></div>
                    Ativo
                  </div>
                </td>
                <td>
                  <button 
                    onClick={() => removeUser(user.id)} 
                    className={styles.removeBtn}
                    title="Remover Usuário"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
