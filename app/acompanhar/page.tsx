'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import styles from './Acompanhar.module.css';
import { useAppContext } from '@/context/AppContext';

const CATEGORY_LABEL: Record<string, string> = {
  child: 'Criança e Adolescente',
  elderly: 'Idosos e Vulneráveis',
  env: 'Meio Ambiente',
};
const STATUS_LABEL: Record<string, string> = {
  recebida: 'Recebida', em_triagem: 'Em Triagem', em_analise: 'Em Análise',
  'concluída': 'Concluída', rejeitada: 'Rejeitada',
};
const STEPS = ['Denúncia Recebida', 'Triagem Inicial', 'Em Análise', 'Concluída'];
const STEP_INDEX: Record<string, number> = {
  recebida: 0, em_triagem: 1, em_analise: 2, 'concluída': 3, rejeitada: 3,
};

export default function AcompanharPage() {
  const { trackComplaint } = useAppContext();
  const [protocol, setProtocol] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    const q = protocol.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    const c = await trackComplaint(q);
    setLoading(false);
    if (!c) {
      setResult(null);
      setError('Protocolo não encontrado. Verifique o número e tente novamente.');
      return;
    }
    const idx = STEP_INDEX[c.status] ?? 0;
    setResult({
      protocol: c.id,
      status: STATUS_LABEL[c.status] || c.status,
      date: c.date,
      category: CATEGORY_LABEL[c.category] || c.category,
      timeline: STEPS.map((s, i) => ({
        status: s,
        date: i <= idx ? 'Concluído' : 'Pendente',
        completed: i <= idx,
      })),
    });
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
              placeholder="Ex: LUMI-XXXXXX" 
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={loading}><Search size={20} /> {loading ? 'Buscando...' : 'Buscar'}</button>
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
