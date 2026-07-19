'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff } from 'lucide-react';
import styles from './TrustSection.module.css';

export default function TrustSection() {
  const features = [
    {
      icon: <Shield size={28} />,
      title: 'Proteção Total',
      description:
        'Sistemas blindados com criptografia de ponta para garantir que sua denúncia chegue ao destino com total segurança.',
    },
    {
      icon: <Lock size={28} />,
      title: 'Sigilo Absoluto',
      description:
        'Suas informações pessoais são tratadas com o mais alto nível de confidencialidade previsto em lei.',
    },
    {
      icon: <EyeOff size={28} />,
      title: 'Denúncia Anônima',
      description:
        'Você decide se quer se identificar ou não. O importante é que a justiça seja feita.',
    },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className="eyebrow">Confiança e segurança</span>
          <h2 className={styles.title}>Sua voz protegida em cada etapa</h2>
        </div>

        <div className={styles.grid}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className={styles.item}
            >
              <div className={styles.icon}>{f.icon}</div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.description}>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
