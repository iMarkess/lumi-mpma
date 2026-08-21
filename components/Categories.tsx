'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Baby, HeartPulse, Leaf, ArrowRight } from 'lucide-react';
import styles from './Categories.module.css';

/*
  Bento: o primeiro cartão ocupa o dobro do espaço. Não é enfeite — denúncias
  contra crianças e adolescentes são o caso de uso mais frequente, então ele
  carrega o peso visual e é o primeiro na ordem de leitura e de tabulação.
*/
const CATEGORIES = [
  {
    id: 'child',
    title: 'Criança e adolescente',
    description:
      'Violência física, sexual ou psicológica, negligência, trabalho e exploração infantil.',
    examples: ['Agressão', 'Negligência', 'Exploração'],
    icon: Baby,
    color: '#1E6FC4',
    soft: 'rgba(30, 111, 196, 0.1)',
    featured: true,
  },
  {
    id: 'elderly',
    title: 'Idosos e vulneráveis',
    description: 'Maus-tratos, abandono e violência patrimonial contra idosos e pessoas com deficiência.',
    examples: ['Abandono', 'Maus-tratos'],
    icon: HeartPulse,
    color: '#C81E1E',
    soft: 'rgba(200, 30, 30, 0.09)',
    featured: false,
  },
  {
    id: 'env',
    title: 'Meio ambiente',
    description: 'Poluição, desmatamento, queimadas e maus-tratos a animais.',
    examples: ['Queimada', 'Animais'],
    icon: Leaf,
    color: '#0E7C56',
    soft: 'rgba(14, 124, 86, 0.09)',
    featured: false,
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
            Escolha a área da denúncia para começar. O sigilo é garantido em todas
            elas, e você não precisa se identificar.
          </p>
        </header>

        <ul className={styles.bento}>
          {CATEGORIES.map(({ id, title, description, examples, icon: Icon, color, soft, featured }, index) => (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={featured ? styles.cellFeatured : styles.cell}
              style={{ '--accent-color': color, '--accent-soft': soft } as React.CSSProperties}
            >
              <Link href={`/denunciar/${id}`} className={styles.card}>
                <span className={styles.sheen} aria-hidden="true" />

                <span className={styles.cardTop}>
                  <span className={styles.iconWrapper} aria-hidden="true">
                    <Icon size={featured ? 34 : 26} />
                  </span>
                  <ul className={styles.tags}>
                    {examples.map((e) => (
                      <li key={e} className={styles.tag}>{e}</li>
                    ))}
                  </ul>
                </span>

                <span className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{title}</h3>
                  <p className={styles.cardDescription}>{description}</p>
                  {featured && (
                    <span className={styles.cardNote}>
                      Na dúvida sobre o canal certo? Comece por aqui — a triagem
                      encaminha para a área correta.
                    </span>
                  )}
                </span>

                <span className={styles.action}>
                  Iniciar denúncia
                  <ArrowRight size={18} aria-hidden="true" />
                </span>

                {featured && (
                  <Image
                    src="/images/lumi-mascote.png"
                    alt=""
                    width={682}
                    height={1024}
                    className={styles.cardArt}
                    loading="lazy"
                    aria-hidden="true"
                  />
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
