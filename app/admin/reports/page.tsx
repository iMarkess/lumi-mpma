'use client';

import { BarChart3, TrendingUp, PieChart, Download } from 'lucide-react';
import styles from '../Dashboard.module.css';
import { useAppContext } from '@/context/AppContext';

export default function ReportsPage() {
  const { complaints, stats } = useAppContext();

  const total = complaints.length;
  const childCount = complaints.filter(c => c.category === 'child').length;
  const elderlyCount = complaints.filter(c => c.category === 'elderly').length;
  const envCount = complaints.filter(c => c.category === 'env').length;

  const childPerc = total > 0 ? Math.round((childCount / total) * 100) : 0;
  const elderlyPerc = total > 0 ? Math.round((elderlyCount / total) * 100) : 0;
  const envPerc = total > 0 ? Math.round((envCount / total) * 100) : 0;
  return (
    <div className={styles.container}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.title}>Relatórios e Estatísticas</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Análise detalhada de dados institucionais</p>
        </div>
        <button className={styles.btnAction} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--primary)', borderColor: 'transparent' }}>
          <Download size={18} /> Baixar PDF Completo
        </button>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Taxa de Resolução</span>
            <span className={styles.statValue}>84.2%</span>
            <span style={{ color: '#4caf50', fontSize: '0.8rem', marginTop: 4 }}>+2.4% este mês</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tempo Médio Triagem</span>
            <span className={styles.statValue}>14h 20m</span>
            <span style={{ color: '#ff9800', fontSize: '0.8rem', marginTop: 4 }}>-5.1% otimização</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Denúncias</span>
            <span className={styles.statValue}>{total}</span>
            <span style={{ color: '#4caf50', fontSize: '0.8rem', marginTop: 4 }}>Deste o início do sistema</span>
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.recentSection}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <TrendingUp size={24} color="var(--primary)" />
            <h2 style={{ margin: 0 }}>Crescimento Mensal</h2>
          </div>
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: 4, paddingBottom: 20 }}>
            {[25, 40, 30, 60, 45, 75, total * 5].map((h, i) => (
              <div key={i} style={{ flex: 1, background: `linear-gradient(to top, var(--primary), #ff8a80)`, height: `${Math.min(h, 100)}%`, borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
            <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span>
          </div>
        </div>

        <div className={styles.chartPlaceholder}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <PieChart size={24} color="#ffd54f" />
            <h2 style={{ margin: 0 }}>Por Categoria</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 5 }}>
                <span>Infância e Juventude</span>
                <span>{childPerc}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${childPerc}%`, background: '#ff8a80' }}></div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 5 }}>
                <span>Idoso e Deficiente</span>
                <span>{elderlyPerc}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${elderlyPerc}%`, background: '#ffd54f' }}></div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 5 }}>
                <span>Meio Ambiente</span>
                <span>{envPerc}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${envPerc}%`, background: '#81c784' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
