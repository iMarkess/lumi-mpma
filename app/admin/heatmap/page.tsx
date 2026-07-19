'use client';

import { MapPin, Map as MapIcon, Filter, X, ExternalLink, Calendar, MapPin as MapPinIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import styles from '../Dashboard.module.css';
import { useAppContext, Complaint } from '@/context/AppContext';
import Link from 'next/link';

export default function HeatmapPage() {
  const { complaints, currentUser, isAuthLoading } = useAppContext();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  if (isAuthLoading || !currentUser) return null;
  
  // Guard: Only Promotor, Secretaria or Master
  if (currentUser.role === 'ouvidoria') {
    return (
      <div className={styles.container}>
        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
          <h2>Acesso Restrito</h2>
          <p>Seu cargo (Ouvidoria) não possui permissão para visualizar o Mapa de Calor.</p>
        </div>
      </div>
    );
  }
  
  const getSimulatedCoords = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      top: `${20 + (hash % 60)}%`,
      left: `${35 + (hash % 40)}%`
    };
  };

  return (
    <div className={styles.container}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.title}>Mapa de Calor</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Visualização geográfica de ocorrências no Maranhão</p>
        </div>
        <button className={styles.btnAction} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={18} /> Filtrar Região
        </button>
      </header>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div className={`${styles.chartPlaceholder} tech-border`} style={{ flex: 1, height: '600px', position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at center, #0a192f 0%, #000 100%)' }}>
          <div className="scanline-overlay" style={{ position: 'absolute', opacity: 0.1 }}></div>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', borderRadius: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className={styles.laser} style={{ animationDuration: '4s' }}></div>
            <span style={{ color: 'rgba(255,255,255,0.05)', fontSize: '2rem', fontWeight: 900, letterSpacing: '10px' }}>MARANHÃO SENTINELA</span>
          </div>
          
          {complaints.map(c => {
            const coords = getSimulatedCoords(c.id);
            const isSelected = selectedComplaint?.id === c.id;
            return (
              <motion.div 
                key={c.id} 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: isSelected ? 1.5 : 1, opacity: 1 }}
                whileHover={{ scale: 1.5, zIndex: 10 }}
                className={styles.mapDot} 
                onClick={() => setSelectedComplaint(c)}
                style={{ 
                  top: coords.top, 
                  left: coords.left, 
                  width: c.priority === 'alta' ? '24px' : '16px', 
                  height: c.priority === 'alta' ? '24px' : '16px', 
                  background: c.priority === 'alta' ? '#ff4081' : c.category === 'child' ? '#4fc3f7' : c.category === 'elderly' ? '#ffd54f' : '#81c784',
                  boxShadow: isSelected ? `0 0 30px #fff` : `0 0 15px ${c.priority === 'alta' ? '#ff4081' : c.category === 'child' ? '#4fc3f7' : c.category === 'elderly' ? '#ffd54f' : '#81c784'}`,
                  border: isSelected ? '3px solid white' : '2px solid rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  zIndex: isSelected ? 20 : 1
                }}
              >
                <div className="status-dot" style={{ width: '100%', height: '100%', background: 'transparent', boxShadow: 'none' }}></div>
              </motion.div>
            );
          })}

          <div style={{ position: 'absolute', bottom: 20, left: 20, padding: 15, background: 'rgba(10, 25, 47, 0.8)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', zIndex: 5 }}>
            <h3 style={{ fontSize: '0.8rem', marginBottom: 10, opacity: 0.7 }}>Legenda</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4081' }}></div> Crítico / Alta Prioridade
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4fc3f7' }}></div> Infância e Juventude
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffd54f' }}></div> Idoso / Vulnerável
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#81c784' }}></div> Meio Ambiente
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedComplaint && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="tech-border"
              style={{ width: '350px', background: 'rgba(10, 25, 47, 0.9)', backdropFilter: 'blur(20px)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(0, 255, 255, 0.2)', position: 'relative' }}
            >
              <button onClick={() => setSelectedComplaint(null)} style={{ position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}>
                <X size={20} />
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: selectedComplaint.priority === 'alta' ? '#ff4081' : '#4fc3f7', boxShadow: `0 0 10px ${selectedComplaint.priority === 'alta' ? '#ff4081' : '#4fc3f7'}` }}></div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6 }}>Denúncia {selectedComplaint.id}</span>
              </div>

              <h2 style={{ fontSize: '1.2rem', marginBottom: 15, color: '#fff' }}>{selectedComplaint.title}</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 25 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                  <MapPinIcon size={16} color="var(--primary)" /> {selectedComplaint.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                  <Calendar size={16} color="var(--primary)" /> {selectedComplaint.date}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 25 }}>
                <h4 style={{ fontSize: '0.8rem', marginBottom: 8, opacity: 0.5 }}>Relato Detalhado</h4>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: 'rgba(255,255,255,0.8)' }}>
                  {selectedComplaint.description || "Nenhuma descrição detalhada fornecida pelo cidadão."}
                </p>
              </div>

              <Link href={`/admin/triage?id=${selectedComplaint.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '14px', background: 'var(--primary)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)' }}>
                Abrir na Triagem <ExternalLink size={18} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
