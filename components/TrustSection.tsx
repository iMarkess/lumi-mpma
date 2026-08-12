'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff } from 'lucide-react';
import styles from './TrustSection.module.css';

const FEATURES = [
  {
    icon: Shield,
    title: 'Proteção total',
    description:
      'Todo o tráfego é criptografado e a denúncia chega diretamente ao setor responsável, sem intermediários.',
  },
  {
    icon: Lock,
    title: 'Sigilo absoluto',
    description:
      'Seus dados pessoais são tratados no mais alto nível de confidencialidade previsto na LGPD e na lei.',
  },
  {
    icon: EyeOff,
    title: 'Denúncia anônima',
    description:
      'Você decide se quer se identificar. A denúncia anônima tem o mesmo peso e o mesmo acompanhamento.',
  },
];

export default function TrustSection() {
  return (
    <section className={styles.section} aria-labelledby="confianca-titulo">
      <div className="container">
        <header className={styles.header}>
          <span className="eyebrow">Confiança e segurança</span>
          <h2 id="confianca-titulo" className={styles.title}>
            Sua voz protegida em cada etapa
          </h2>
        </header>

        <ul className={styles.grid}>
          {FEATURES.map(({ icon: Icon, title, description }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              /* 40ms por item: sequência perceptível sem parecer lenta. */
              transition={{ delay: i * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className={styles.item}
            >
              <span className={styles.icon}>
                <Icon size={26} aria-hidden="true" />
              </span>
              <h3 className={styles.itemTitle}>{title}</h3>
              <p className={styles.description}>{description}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
