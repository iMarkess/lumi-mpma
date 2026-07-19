'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import styles from './Acompanhar.module.css';

const mockStatus: any = {
  active: {
    protocol: 'MPMA-X82J91',
    status: 'Em Análise',
    date: '21/03/2026',
    category: 'Criança e Adolescente',
    timeline: [
      { status: 'Denúncia Recebida', date: '21/03/2026 - 14:20', completed: true },
      { status: 'Triagem Inicial', date: '21/03/2026 - 15:00', completed: true },
      { status: 'Encaminhado para Promotoria', date: 'Pendente', completed: false },
      { status: 'Diligência em Aberto', date: 'Pendente', completed: false },
    ]
  }
};

export default function AcompanharPage() {
  const [protocol, setProtocol] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (protocol.toUpperCase() === 'MPMA-X82J91') {
      setResult(mockStatus.active);
      setError('');
    } else {
      setResult(null);
      setError('Protocolo não encontrado. Verifique o número e tente novamente.');
    }
  };

  return (
    <main className={styles.main}>
      <Navbar />
      <div className={`${styles.content} container section-padding`}>
        <div className={styles.searchSection}>
          <div className={styles.badge}>
            <ShieldCheck size={16} /> Acompanhamento de Protocolo
          </div>
          <h1>Acompanhe o status da sua denúncia</h1>
          <p>Informe o número do protocolo gerado no momento do envio para verificar o andamento.</p>
          
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Ex: MPMA-XXXXXX" 
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}><Search size={20} /> Buscar</button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.resultCard}
            >
              <div className={styles.resultHeader}>
                <div className={styles.resInfo}>
                  <span className={styles.resLabel}>Protocolo</span>
                  <span className={styles.resVal}>{result.protocol}</span>
                </div>
                <div className={styles.resStatus}>
                  <span className={styles.statusBadge}>{result.status}</span>
                </div>
              </div>

              <div className={styles.resGrid}>
                <div className={styles.resItem}>
                  <Calendar size={18} />
                  <div>
                    <span>Data de Abertura</span>
                    <strong>{result.date}</strong>
                  </div>
                </div>
                <div className={styles.resItem}>
                  <ShieldCheck size={18} />
                  <div>
                    <span>Categoria</span>
                    <strong>{result.category}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.timeline}>
                <h3>Evolução do Caso</h3>
                {result.timeline.map((item: any, idx: number) => (
                  <div key={idx} className={`${styles.timelineItem} ${item.completed ? styles.completed : ''}`}>
                    <div className={styles.dot}>
                      {item.completed ? <CheckCircle2 size={16} /> : <div className={styles.innerDot} />}
                    </div>
                    <div className={styles.timeContent}>
                      <strong>{item.status}</strong>
                      <span>{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
