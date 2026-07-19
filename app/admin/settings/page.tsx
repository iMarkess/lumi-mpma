'use client';

import { Settings, User, Bell, Shield, Database, RefreshCw } from 'lucide-react';
import styles from '../Dashboard.module.css';
import { useAppContext } from '@/context/AppContext';

export default function SettingsPage() {
  const { currentUser, users, setCurrentUser, isAuthLoading } = useAppContext();
  
  if (isAuthLoading || !currentUser) return null;

  const handleSwitchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  };
  return (
    <div className={styles.container}>
      <header>
        <h1 className={styles.title}>Configurações do Sistema</h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Gerencie usuários, permissões e integridade de dados</p>
      </header>

      <div className={styles.row}>
        <div className={styles.recentSection} style={{ flex: 1 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <User size={20} color="var(--primary)" /> Perfil do Usuário
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                background: 'var(--primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '1.5rem', 
                fontWeight: 700 
              }}>{currentUser.avatar}</div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{currentUser.name}</strong>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', textTransform: 'capitalize' }}>{currentUser.role}</span>
              </div>
            </div>
            
            <div style={{ marginTop: 10 }}>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Mudar de Conta (Simulação de Cargos):</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {users.map(u => (
                  <button 
                    key={u.id}
                    onClick={() => handleSwitchUser(u.id)}
                    className={styles.btnAction}
                    style={{ 
                      fontSize: '0.7rem', 
                      background: u.id === currentUser.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      borderColor: u.id === currentUser.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: u.id === currentUser.id ? 'white' : 'rgba(255,255,255,0.6)'
                    }}
                  >
                    {u.name.split(' ')[0]} ({u.role})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.chartPlaceholder} style={{ flex: 1 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={20} color="#ffd54f" /> Notificações
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
              <input type="checkbox" checked readOnly /> Notificar novas denúncias urgentes
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
              <input type="checkbox" checked readOnly /> Resumo diário por e-mail
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
              <input type="checkbox" readOnly /> Sons de alerta no dashboard
            </label>
          </div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={20} color="#81c784" /> Segurança e Sistema
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 20 }}>
          <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Database size={24} color="rgba(255,255,255,0.4)" style={{ marginBottom: 10 }} />
            <strong style={{ display: 'block', marginBottom: 5 }}>Banco de Dados</strong>
            <span style={{ color: '#4caf50', fontSize: '0.8rem' }}>Conectado (Latência: 12ms)</span>
          </div>
          <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Shield size={24} color="rgba(255,255,255,0.4)" style={{ marginBottom: 10 }} />
            <strong style={{ display: 'block', marginBottom: 5 }}>Criptografia</strong>
            <span style={{ color: '#4caf50', fontSize: '0.8rem' }}>Ativada (AES-256)</span>
          </div>
          <div style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <User size={24} color="rgba(255,255,255,0.4)" style={{ marginBottom: 10 }} />
            <strong style={{ display: 'block', marginBottom: 5 }}>API Cloud</strong>
            <span style={{ color: '#4caf50', fontSize: '0.8rem' }}>Online (v2.4.0)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
