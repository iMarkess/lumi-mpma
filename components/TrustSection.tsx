'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, EyeOff, FileCheck } from 'lucide-react';
import styles from './TrustSection.module.css';

/*
  Bento assimétrico: o título mora dentro da grade, como um cartão, e os três
  atributos ocupam larguras diferentes. Repetir o mesmo ritmo da seção anterior
  faria a página inteira parecer um formulário.
*/
const FEATURES = [
  {
    icon: Shield,
    title: 'Proteção total',
    description:
      'Todo o tráfego é criptografado e a denúncia chega diretamente ao setor responsável, sem intermediários.',
    wide: false,
  },
  {
    icon: Lock,
    title: 'Sigilo absoluto',
    description:
      'Seus dados pessoais são tratados no mais alto nível de confidencialidade previsto na LGPD.',
    wide: false,
  },
  {
    icon: EyeOff,
    title: 'Denúncia anônima',
    description:
      'Você decide se quer se identificar. A denúncia anônima tem o mesmo peso e o mesmo acompanhamento — nenhum dado é exigido para registrar.',
    wide: true,
  },
];

export default function TrustSection() {
  return (
    <section className={styles.section} aria-labelledby="confianca-titulo">
      <div className="container">
        <div className={styles.bento}>
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={styles.headingCell}
          >
            <span className={styles.eyebrow}>Confiança e segurança</span>
            <h2 id="confianca-titulo" className={styles.title}>
              Sua voz protegida em cada etapa
            </h2>
            <p className={styles.lead}>
              Denunciar exige coragem. O mínimo que devemos em troca é a certeza
              de que nada do que você contar será exposto.
            </p>
            <p className={styles.seal}>
              <FileCheck size={16} aria-hidden="true" />
              Em conformidade com a LGPD (Lei nº 13.709/2018)
            </p>
          </motion.div>

          {FEATURES.map(({ icon: Icon, title, description, wide }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={wide ? styles.cellWide : styles.cell}
            >
              <span className={styles.icon}>
                <Icon size={24} aria-hidden="true" />
              </span>
              <h3 className={styles.cellTitle}>{title}</h3>
              <p className={styles.description}>{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
