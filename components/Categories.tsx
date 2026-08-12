'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Baby, HeartPulse, Leaf, ArrowRight } from 'lucide-react';
import styles from './Categories.module.css';

const CATEGORIES = [
  {
    id: 'child',
    title: 'Criança e adolescente',
    description: 'Violência física, sexual, psicológica, negligência e exploração infantil.',
    icon: Baby,
    color: '#00458E',
    soft: 'rgba(0, 69, 142, 0.08)',
  },
  {
    id: 'elderly',
    title: 'Idosos e vulneráveis',
    description: 'Maus-tratos e abandono de idosos, pessoas com deficiência e vulneráveis.',
    icon: HeartPulse,
    color: '#C81E1E',
    soft: 'rgba(200, 30, 30, 0.08)',
  },
  {
    id: 'env',
    title: 'Meio ambiente',
    description: 'Poluição, desmatamento, queimadas e maus-tratos a animais.',
    icon: Leaf,
    color: '#0E7C56',
    soft: 'rgba(14, 124, 86, 0.08)',
  },
];

export default function Categories() {
  return (
    <section id="categories" className={styles.section} aria-labelledby="canais-titulo">
      <div className="container">
        <header className={styles.header}>
          <span className="eyebrow">Canais de denúncia</span>
          <h2 id="canais-titulo" className={styles.title}>
            Como posso te ajudar hoje?
          </h2>
          <p className={styles.subtitle}>
            Escolha a área da denúncia para começar. O sigilo é garantido em
            todas elas.
          </p>
        </header>

        <ul className={styles.grid}>
          {CATEGORIES.map(({ id, title, description, icon: Icon, color, soft }, index) => (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              style={{ '--accent-color': color, '--accent-soft': soft } as React.CSSProperties}
            >
              {/*
                Link de verdade, não div com role="button" + window.location.
                Assim funciona Enter e Espaço, abrir em nova aba, e a navegação
                fica no roteador do Next em vez de recarregar a página inteira.
              */}
              <Link href={`/denunciar/${id}`} className={styles.card}>
                <span className={styles.glow} aria-hidden="true" />
                <span className={styles.iconWrapper} aria-hidden="true">
                  <Icon size={30} />
                </span>
                <h3 className={styles.cardTitle}>{title}</h3>
                <p className={styles.cardDescription}>{description}</p>
                <span className={styles.action}>
                  Iniciar denúncia
                  <ArrowRight size={18} aria-hidden="true" />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
