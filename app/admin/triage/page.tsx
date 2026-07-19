'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Search, MoreHorizontal, AlertTriangle, Baby, HeartPulse, Leaf, CheckCircle, Clock, Play, XCircle, Download, X, MapPin, Calendar, FileText, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Triage.module.css';
import { useAppContext, Complaint } from '@/context/AppContext';

const categoryIcons: any = {
  child: <Baby size={18} />,
  elderly: <HeartPulse size={18} />,
  env: <Leaf size={18} />
};

const categoryLabels: any = {
  child: 'Infância e Juventude',
  elderly: 'Idosos e Vulneráveis',
  env: 'Meio Ambiente'
};

export default function TriagePage() {
  const { complaints, updateComplaintStatus } = useAppContext();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Todas');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Handle deep-link from Heatmap
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const complaint = complaints.find(c => c.id === id);
      if (complaint) {
        setSelectedComplaint(complaint);
        setSearchQuery(id);
      }
    }
  }, [searchParams, complaints]);

  const filteredComplaints = complaints.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    if (activeTab === 'Todas') return matchesSearch && matchesCategory;
    if (activeTab === 'Pendentes') return matchesSearch && matchesCategory && item.status === 'recebida';
    if (activeTab === 'Urgentes') return matchesSearch && matchesCategory && item.priority === 'alta';
    if (activeTab === 'Concluídas') return matchesSearch && matchesCategory && item.status === 'concluída';
    return matchesSearch && matchesCategory;
  });

  const getTabCount = (tab: string) => {
    if (tab === 'Todas') return complaints.length;
    if (tab === 'Pendentes') return complaints.filter(c => c.status === 'recebida').length;
    if (tab === 'Urgentes') return complaints.filter(c => c.priority === 'alta').length;
    if (tab === 'Concluídas') return complaints.filter(c => c.status === 'concluída').length;
    return 0;
  };

  const handleExport = () => {
    const headers = ['ID', 'Categoria', 'Assunto', 'Localidade', 'Prioridade', 'Status', 'Data'];
    const rows = complaints.map(c => [
      c.id, c.category, c.title, c.location, c.priority, c.status, c.date
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_mpma_denuncias.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Painel de Triagem</h1>
          <span>Gerencie e priorize denúncias do estado do Maranhão</span>
        </div>
        <div className={styles.actions}>
          <button 
            className={styles.btnFilter}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} /> {showFilters ? 'Esconder Filtros' : 'Filtros'}
          </button>
          <button 
            className={styles.btnExport}
            onClick={handleExport}
          >
            <Download size={18} /> Exportar Relatório
          </button>
        </div>
      </header>

      {showFilters && (
        <div className={styles.filterOptions} style={{ 
          padding: '15px', 
          background: '#ffffff', 
          borderRadius: '12px', 
          marginBottom: '20px', 
          display: 'flex', 
          gap: '15px',
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ 
              background: 'rgba(0,0,0,0.3)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: '8px 12px', 
              borderRadius: '8px',
              outline: 'none'
            }}
          >
            <option value="all">Todas as Categorias</option>
            <option value="child">Infância e Juventude</option>
            <option value="elderly">Idosos e Vulneráveis</option>
            <option value="env">Violência Ambiental</option>
          </select>
          <button 
            onClick={() => {setFilterCategory('all'); setSearchQuery('');}}
            style={{ 
              fontSize: '0.8rem', 
              color: '#71717a',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Limpar tudo
          </button>
        </div>
      )}

      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Filtrar por protocolo ou cidade..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.tabs}>
          {['Todas', 'Pendentes', 'Urgentes', 'Concluídas'].map(tab => (
            <button 
              key={tab}
              className={activeTab === tab ? styles.active : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab} <span>{getTabCount(tab).toString().padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Protocolo</th>
              <th>Categoria</th>
              <th>Assunto</th>
              <th>Localidade</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map(item => (
              <tr 
                key={item.id} 
                className={selectedComplaint?.id === item.id ? styles.selectedRow : ''}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedComplaint(item)}
              >
                <td className={styles.protocol}>{item.id}</td>
                <td className={styles.category}>
                  <div className={`${styles.catIcon} ${styles[item.category]}`}>
                    {categoryIcons[item.category]}
                  </div>
                </td>
                <td className={styles.subject}>
                  <strong>{item.title}</strong>
                  <span>{item.date}</span>
                </td>
                <td>{item.location}</td>
                <td>
                  <span className={`${styles.priority} ${styles[item.priority]}`}>
                    {item.priority === 'alta' && <AlertTriangle size={14} />} 
                    {item.priority}
                  </span>
                </td>
                <td>
                  <span className={`${styles.status} ${styles[item.status]}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                  {item.status === 'recebida' && (
                    <button 
                      onClick={() => updateComplaintStatus(item.id, 'em_triagem')} 
                      className={styles.actionIcon} 
                      title="Iniciar Triagem"
                    >
                      <Play size={16} />
                    </button>
                  )}
                  {item.status === 'em_triagem' && (
                    <button 
                      onClick={() => updateComplaintStatus(item.id, 'em_analise')} 
                      className={styles.actionIcon} 
                      title="Mover para Análise"
                    >
                      <Clock size={16} />
                    </button>
                  )}
                  
                  {item.status !== 'concluída' && item.status !== 'rejeitada' ? (
                    <>
                      <button 
                        onClick={() => updateComplaintStatus(item.id, 'concluída')} 
                        className={styles.actionIconSuccess} 
                        title="Finalizar Caso"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button 
                        onClick={() => updateComplaintStatus(item.id, 'rejeitada')} 
                        className={styles.actionIconDanger} 
                        title="Negar / Arquivar"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  ) : (
                    <button className={styles.btnMore}><MoreHorizontal size={20} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredComplaints.length === 0 && (
          <div className={styles.emptyState}>
            Nenhuma denúncia encontrada para os filtros selecionados.
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedComplaint && (
          <div className={styles.modalOverlay} onClick={() => setSelectedComplaint(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.closeBtn} onClick={() => setSelectedComplaint(null)}>
                <X size={24} />
              </button>

              <div className={styles.modalHeader}>
                <div className={`${styles.modalCatIcon} ${styles[selectedComplaint.category]}`}>
                  {categoryIcons[selectedComplaint.category]}
                </div>
                <div>
                  <h2>{selectedComplaint.title}</h2>
                  <p>Protocolo: <strong>{selectedComplaint.id}</strong> | {categoryLabels[selectedComplaint.category]}</p>
                </div>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <MapPin size={18} />
                    <div>
                      <label>Localidade</label>
                      <span>{selectedComplaint.location}</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <Calendar size={18} />
                    <div>
                      <label>Data de Registro</label>
                      <span>{selectedComplaint.date}</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <AlertTriangle size={18} />
                    <div>
                      <label>Prioridade</label>
                      <span className={`${styles.priority} ${styles[selectedComplaint.priority]}`}>{selectedComplaint.priority}</span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <FileText size={18} />
                    <div>
                      <label>Status Atual</label>
                      <span className={`${styles.status} ${styles[selectedComplaint.status]}`}>{selectedComplaint.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.descriptionArea}>
                  <h3><MessageSquare size={18} /> Relato do Cidadão</h3>
                  <div className={styles.descriptionBox}>
                    {selectedComplaint.description || "O cidadão não forneceu uma descrição escrita detalhada."}
                  </div>
                </div>

                {selectedComplaint.victim_name && (
                  <div className={styles.victimArea}>
                    <h3><User size={18} /> Identificação da Vítima (Sigiloso)</h3>
                    <p><strong>Nome/Iniciais:</strong> {selectedComplaint.victim_name}</p>
                  </div>
                )}
              </div>

              <div className={styles.modalFooter}>
                <div className={styles.footerActions}>
                  {selectedComplaint.status !== 'concluída' ? (
                    <>
                      <button 
                        className={styles.btnFinish}
                        onClick={() => {
                          updateComplaintStatus(selectedComplaint.id, 'concluída');
                          setSelectedComplaint(null);
                        }}
                      >
                        <CheckCircle size={18} /> Finalizar Caso
                      </button>
                      <button 
                        className={styles.btnReject}
                        onClick={() => {
                          updateComplaintStatus(selectedComplaint.id, 'rejeitada');
                          setSelectedComplaint(null);
                        }}
                      >
                        <XCircle size={18} /> Rejeitar
                      </button>
                    </>
                  ) : (
                    <button className={styles.btnExportPdf}>
                      <Download size={18} /> Baixar Dossiê PDF
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
