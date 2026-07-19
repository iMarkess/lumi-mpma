'use client';

import { motion } from 'framer-motion';
import { Baby, HeartPulse, Leaf, ArrowRight } from 'lucide-react';
import styles from './Categories.module.css';

const categories = [
  {
    id: 'child',
    title: 'Criança e Adolescente',
    description: 'Proteção contra violência física, sexual, psicológica e negligência.',
    icon: <Baby size={32} />,
    color: '#00458E',
    soft: 'rgba(0, 69, 142, 0.08)',
  },
  {
    id: 'elderly',
    title: 'Idosos e Vulneráveis',
    description: 'Combate à violência contra idosos, pessoas com deficiência e vulneráveis.',
    icon: <HeartPulse size={32} />,
    color: '#E62310',
    soft: 'rgba(230, 35, 16, 0.08)',
  },
  {
    id: 'env',
    title: 'Violência Ambiental',
    description: 'Denúncias de poluição, desmatamento, queimadas e maus-tratos a animais.',
    icon: <Leaf size={32} />,
    color: '#0E9F6E',
    soft: 'rgba(14, 159, 110, 0.08)',
  },
];

export default function Categories() {
  return (
    <section id="categories" className={`${styles.section} section-padding`}>
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Canais de denúncia</span>
          <h2 className={styles.title}>Como posso te ajudar hoje?</h2>
          <p className={styles.subtitle}>
            Selecione uma das áreas abaixo para iniciar sua denúncia.
            Eu garanto o seu sigilo absoluto.
          </p>
        </div>

        <div className={styles.grid}>
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.5 }}
              className={styles.card}
              style={{ '--accent-color': cat.color, '--accent-soft': cat.soft } as React.CSSProperties}
              onClick={() => (window.location.href = `/denunciar/${cat.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') window.location.href = `/denunciar/${cat.id}`;
              }}
            >
              <div className={styles.glow}></div>
              <div className={styles.iconWrapper}>{cat.icon}</div>
              <h3 className={styles.cardTitle}>{cat.title}</h3>
              <p className={styles.cardDescription}>{cat.description}</p>
              <span className={styles.button}>
                Iniciar denúncia <ArrowRight size={18} />
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
