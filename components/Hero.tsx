'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShieldCheck, ArrowRight, Lock, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './Hero.module.css';

export default function Hero() {
  const router = useRouter();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 18 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 18 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg']);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleScrollToCategories = () => {
    const el = document.getElementById('categories');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/#categories');
    }
  };

  return (
    <section className={styles.hero}>
      {/* Futuristic background */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.grid}></div>
        <div className={`${styles.orb} ${styles.orbBlue}`}></div>
        <div className={`${styles.orb} ${styles.orbRed}`}></div>
        <div className={`${styles.orb} ${styles.orbGold}`}></div>
        <div className={styles.noise}></div>
      </div>

      <div className={`${styles.container} container`}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={styles.content}
        >
          <div className={styles.badge}>
            <span className="status-dot"></span>
            <ShieldCheck size={15} />
            <span>Plataforma Oficial · MPMA</span>
          </div>

          {/* Lumi Avatar for Mobile Viewports */}
          <div className={styles.mobileAvatar}>
            <div className={styles.avatarGlow}></div>
            <img
              src="/images/lumi_v2.png"
              alt="Mascote Lumi"
              className={styles.mobileMascot}
            />
            <div className={styles.mobileStatus}>
              <span className="status-dot"></span>
              <span>Lumi Online</span>
            </div>
          </div>

          <h1 className={styles.title}>
            <span className={styles.titleBrand}>LUMI</span>
            <span className={styles.titleMain}>
              <span className="text-gradient">Luz e proteção</span><br />
              para quem mais precisa
            </span>
          </h1>

          <p className={styles.description}>
            Olá, eu sou a Lumi! Estou aqui para te ajudar a denunciar com
            segurança situações de vulnerabilidade e garantir a defesa dos
            seus direitos fundamentais.
          </p>

          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              onClick={handleScrollToCategories}
            >
              Fazer denúncia agora
              <ArrowRight size={20} />
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => router.push('/acompanhar')}
            >
              Acompanhar protocolo
            </button>
          </div>

          <div className={styles.trustRow}>
            <div className={styles.trustItem}>
              <Lock size={16} />
              <span>Sigilo absoluto</span>
            </div>
            <div className={styles.trustItem}>
              <ShieldCheck size={16} />
              <span>100% seguro</span>
            </div>
            <div className={styles.trustItem}>
              <Clock size={16} />
              <span>Atendimento 24h</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className={styles.visual}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div className={styles.stage} style={{ rotateX, rotateY }}>
            <div className={styles.halo}></div>
            <div className={styles.pedestal}></div>
            <img
              src="/images/lumi_v2.png"
              alt="Lumi, assistente virtual oficial do MPMA"
              className={styles.mascot}
            />

            <div className={`${styles.floatCard} ${styles.cardStatus}`}>
              <div className={styles.cardHeader}>
                <div className={styles.statusBadge}>
                  <span className="status-dot"></span>
                  ONLINE
                </div>
                <span className={styles.cardTitle}>LUMI · IA</span>
              </div>
              <p className={styles.quoteText}>“Estou aqui para proteger você.”</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className={styles.scrollHint} aria-hidden="true">
        <span></span>
      </div>
    </section>
  );
}
