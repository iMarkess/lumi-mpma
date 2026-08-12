'use client';

import { motion } from 'framer-motion';
import { MousePointerClick, PencilLine, Hash, Bell, Phone, TriangleAlert } from 'lucide-react';
import styles from './Guidelines.module.css';

const STEPS = [
  {
    icon: MousePointerClick,
    title: 'Escolha o canal',
    description: 'Criança e adolescente, idosos e vulneráveis ou meio ambiente.',
  },
  {
    icon: PencilLine,
    title: 'Conte o que aconteceu',
    description: 'Descreva o fato, o local e a data. Você decide se quer se identificar.',
  },
  {
    icon: Hash,
    title: 'Receba o protocolo',
    description: 'Um número é gerado na hora. Guarde: é ele que dá acesso ao caso.',
  },
  {
    icon: Bell,
    title: 'Acompanhe',
    description: 'Consulte o andamento a qualquer momento pelo site ou pelo app.',
  },
];

/* Mesmos números do app LUMI (AppConstants.emergencies) — um só conjunto de
   contatos oficiais em todas as plataformas. */
const EMERGENCIES = [
  { number: '190', label: 'Polícia Militar' },
  { number: '100', label: 'Direitos Humanos' },
  { number: '181', label: 'Disque-Denúncia' },
];

export default function Guidelines() {
  return (
    <section id="orientacoes" className={styles.section} aria-labelledby="orientacoes-titulo">
      <div className="container">
        <header className={styles.header}>
          <span className="eyebrow">Orientações</span>
          <h2 id="orientacoes-titulo" className={styles.title}>
            Da denúncia ao acompanhamento, em quatro passos
          </h2>
          <p className={styles.subtitle}>
            Leva poucos minutos. Quanto mais detalhes você conseguir dar, mais
            rápido o caso avança.
          </p>
        </header>

        <ol className={styles.steps}>
          {STEPS.map(({ icon: Icon, title, description }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: i * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={styles.step}
            >
              <span className={styles.stepNumber} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className={styles.stepIcon} aria-hidden="true">
                <Icon size={22} />
              </span>
              <h3 className={styles.stepTitle}>{title}</h3>
              <p className={styles.stepText}>{description}</p>
            </motion.li>
          ))}
        </ol>

        <aside className={styles.emergency} aria-labelledby="emergencia-titulo">
          <div className={styles.emergencyIntro}>
            <span className={styles.emergencyBadge}>
              <TriangleAlert size={16} aria-hidden="true" />
              Risco imediato
            </span>
            <h3 id="emergencia-titulo" className={styles.emergencyTitle}>
              Se alguém está em perigo agora, ligue
            </h3>
            <p className={styles.emergencyText}>
              Esta plataforma não substitui o atendimento de emergência. Em
              situações de risco à vida, procure o socorro primeiro.
            </p>
          </div>

          <ul className={styles.phones}>
            {EMERGENCIES.map(({ number, label }) => (
              <li key={number}>
                <a href={`tel:${number}`} className={styles.phone}>
                  <Phone size={18} aria-hidden="true" />
                  <span className={styles.phoneNumber}>{number}</span>
                  <span className={styles.phoneLabel}>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
