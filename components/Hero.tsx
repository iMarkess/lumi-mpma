'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Lock, Clock, EyeOff } from 'lucide-react';
import styles from './Hero.module.css';

const TRUST = [
  { icon: Lock, label: 'Sigilo absoluto' },
  { icon: EyeOff, label: 'Denúncia anônima' },
  { icon: Clock, label: 'Atendimento 24h' },
];

/* Uma frase por cartão. Números inventados aqui viram problema na Play e
   quebram confiança — então os cartões afirmam o serviço, não métricas. */
const PROOF = [
  { value: '3', label: 'canais de denúncia', hint: 'Criança, idoso e meio ambiente' },
  { value: '24h', label: 'aberto todo dia', hint: 'Sem horário comercial' },
  { value: '0', label: 'dados exigidos', hint: 'Denuncie sem se identificar' },
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* A luz nasce do escuro: é a ideia da marca, não decoração solta. */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.grid} />
        <div className={`${styles.blob} ${styles.blobBlue}`} />
        <div className={`${styles.blob} ${styles.blobRed}`} />
        <div className={styles.beam} />
      </div>

      <div className={`${styles.container} container`}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className={styles.content}
        >
          <p className={styles.badge}>
            <span className="status-dot" aria-hidden="true" />
            Canal independente de denúncias
          </p>

          <div className={styles.mobileMascot}>
            <Image
              src="/images/lumi-mascote.png"
              alt="Lumi, assistente do aplicativo"
              width={682}
              height={1024}
              className={styles.mobileMascotImg}
              priority
            />
          </div>

          <h1 className={styles.title}>
            Luz e proteção
            <br />
            <span className={styles.titleAccent}>para quem mais precisa</span>
          </h1>

          <p className={styles.description}>
            Olá, eu sou a Lumi. Registre situações de violência ou vulnerabilidade
            com segurança e sigilo — e acompanhe cada etapa pelo número de
            protocolo.
          </p>

          <div className={styles.actions}>
            <Link href="/#categories" className={styles.btnPrimary}>
              Fazer denúncia
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link href="/acompanhar" className={styles.btnGhost}>
              Acompanhar protocolo
            </Link>
          </div>

          <ul className={styles.trustRow}>
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className={styles.trustItem}>
                <Icon size={15} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className={styles.visual}
          aria-hidden="true"
        >
          <div className={styles.stage}>
            <div className={styles.halo} />
            <div className={styles.ring} />
            <Image
              src="/images/lumi-mascote.png"
              alt=""
              width={682}
              height={1024}
              className={styles.mascot}
              priority
            />
            <div className={styles.statusCard}>
              <p className={styles.statusHead}>
                <span className="status-dot" />
                Lumi online
              </p>
              <p className={styles.statusQuote}>“Estou aqui para proteger você.”</p>
            </div>
            <div className={styles.secureCard}>
              <ShieldCheck size={17} aria-hidden="true" />
              Conexão criptografada
            </div>
          </div>
        </motion.div>
      </div>

      {/* Faixa de reforço: encosta na dobra e emenda com a seção clara. */}
      <div className={`${styles.proofWrap} container`}>
        <ul className={styles.proof}>
          {PROOF.map(({ value, label, hint }, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className={styles.proofItem}
            >
              <span className={styles.proofValue}>{value}</span>
              <span className={styles.proofLabel}>{label}</span>
              <span className={styles.proofHint}>{hint}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
