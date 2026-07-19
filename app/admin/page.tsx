'use client';

import { AlertCircle, Clock, CheckCircle2, FileText, MapPin } from 'lucide-react';
import styles from './Dashboard.module.css';
import { useAppContext } from '@/context/AppContext';
import Link from 'next/link';

export default function AdminDashboard() {
  const { stats, complaints, currentUser, isAuthLoading } = useAppContext();
  
  if (isAuthLoading || !currentUser) return null;

  // Guard: Ouvidoria should go directly to Triage or Reports, but we'll show a message here if they land here
    if (currentUser.role === 'ouvidoria') {
      return (
        <div className={styles.container}>
          <div style={{ padding: 40, textAlign: 'center', color: '#71717a' }}>
            <h2 style={{ color: '#18181b', marginBottom: '16px' }}>Bem-vindo, {currentUser.name}</h2>
            <p>Sua conta de Ouvidoria tem acesso aos módulos de <strong>Triagem</strong> e <strong>Relatórios</strong>.</p>
            <div style={{ marginTop: 30, display: 'flex', gap: 15, justifyContent: 'center' }}>
              <Link href="/admin/triage" className={styles.btnAction} style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none' }}>Ir para Triagem</Link>
              <Link href="/admin/reports" className={styles.btnAction} style={{ padding: '12px 24px' }}>Ver Relatórios</Link>
            </div>
          </div>
        </div>
      );
    }
  
  const statsConfig = [
    { label: 'Denúncias Hoje', value: stats.today.toString().padStart(2, '0'), icon: <FileText size={24} />, color: '#00458e', href: '/admin/triage' },
    { label: 'Em Triagem', value: stats.triage.toString().padStart(2, '0'), icon: <Clock size={24} />, color: '#f9a825', href: '/admin/triage?tab=Pendentes' },
    { label: 'Urgentes', value: stats.urgent.toString().padStart(2, '0'), icon: <AlertCircle size={24} />, color: '#c62828', href: '/admin/triage?tab=Urgentes' },
    { label: 'Concluídas', value: stats.completed.toString().padStart(2, '0'), icon: <CheckCircle2 size={24} />, color: '#2e7d32', href: '/admin/triage?tab=Concluídas' },
  ];

  const recentAlerts = complaints
    .filter(c => c.priority === 'alta' && c.status !== 'concluída')
    .slice(0, 3);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Visão Geral</h1>
      
      <div className={styles.statsGrid}>
        {statsConfig.map(stat => (
          <Link href={stat.href} key={stat.label} className={styles.statLink} style={{ textDecoration: 'none' }}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: stat.color }}>
                {stat.icon}
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{stat.value}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className={styles.row}>
        <div className={styles.recentSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, color: '#18181b', fontSize: '1.25rem', fontWeight: 700 }}>Alertas Críticos</h2>
            <Link href="/admin/triage?tab=Urgentes" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Ver todos</Link>
          </div>
          {recentAlerts.length > 0 ? recentAlerts.map(alert => (
            <div key={alert.id} className={`${styles.alert} ${styles.high}`}>
              <AlertCircle size={20} />
              <div className={styles.alertContent}>
                <strong>{alert.title}</strong>
                <span>Protocolo: {alert.id} | Local: {alert.location}</span>
              </div>
              <Link href={`/admin/triage?id=${alert.id}`} className={styles.btnAction} style={{ textDecoration: 'none' }}>Ver Detalhes</Link>
            </div>
          )) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#71717a', border: '1px dashed rgba(0, 0, 0, 0.12)', borderRadius: '12px', background: '#fafafa' }}>
              Nenhum alerta urgente pendente.
            </div>
          )}
        </div>
        
        <div className={styles.chartPlaceholder}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, color: '#18181b', fontSize: '1.25rem', fontWeight: 700 }}>Monitoramento Geográfico</h2>
            <Link href="/admin/heatmap" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Abrir Mapa Full</Link>
          </div>
          <div className={styles.mapBox} style={{ height: '300px' }}>
            <div className="scanline-overlay" style={{ opacity: 0.05 }}></div>
            {complaints.slice(0, 15).map(c => {
              const hash = c.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const top = `${25 + (hash % 50)}%`;
              const left = `${30 + (hash % 40)}%`;
              return (
                <Link key={c.id} href={`/admin/triage?id=${c.id}`}>
                  <div 
                    className={styles.mapDotSmall} 
                    style={{ 
                      top, 
                      left, 
                      background: c.priority === 'alta' ? '#ff4081' : 'var(--primary)',
                      boxShadow: `0 0 10px ${c.priority === 'alta' ? '#ff4081' : 'var(--primary)'}`
                    }}
                    title={`${c.title} - ${c.location}`}
                  ></div>
                </Link>
              );
            })}
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.3, fontWeight: 900 }}>Radar LUMI Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
