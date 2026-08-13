'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Lock, Clock } from 'lucide-react';
import styles from './Hero.module.css';

const TRUST = [
  { icon: Lock, label: 'Sigilo absoluto' },
  { icon: ShieldCheck, label: 'Dados criptografados' },
  { icon: Clock, label: 'Atendimento 24h' },
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Uma única aurora suave. A versão anterior empilhava grade + três orbes
          + ruído; muito efeito competindo com o texto. */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.auroraBlue} />
        <div className={styles.auroraRed} />
      </div>

      <div className={`${styles.container} container`}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={styles.content}
        >
          <p className={styles.badge}>
            <span className="status-dot" aria-hidden="true" />
            <ShieldCheck size={15} aria-hidden="true" />
            Canal independente · Atendimento 24h
          </p>

          {/* Mascote em telas estreitas: entra antes do título, sem duplicar
              o palco do desktop. */}
          <div className={styles.mobileMascot}>
            <Image
              src="/images/lumi-mascote.png"
              alt="Lumi, assistente virtual do aplicativo"
              width={682}
              height={1024}
              className={styles.mobileMascotImg}
              priority
            />
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleBrand}>LUMI</span>
            <span className={styles.titleMain}>
              Luz e proteção
              <br />
              para quem mais precisa
            </span>
          </h1>

          <p className={styles.description}>
            Olá, eu sou a Lumi. Registre aqui situações de violência ou
            vulnerabilidade com segurança e sigilo — e acompanhe cada etapa pelo
            número de protocolo.
          </p>

          <div className={styles.actions}>
            <Link href="/#categories" className={styles.btnPrimary}>
              Fazer denúncia
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link href="/acompanhar" className={styles.btnSecondary}>
              Acompanhar protocolo
            </Link>
          </div>

          <ul className={styles.trustRow}>
            {TRUST.map(({ icon: Icon, label }) => (
              <li key={label} className={styles.trustItem}>
                <Icon size={16} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={styles.visual}
          aria-hidden="true"
        >
          <div className={styles.stage}>
            <div className={styles.halo} />
            <div className={styles.pedestal} />
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
              <p className={styles.statusQuote}>
                “Estou aqui para proteger você.”
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
