'use client';

import { motion } from 'framer-motion';
import { Play, Download, ShieldCheck } from 'lucide-react';
import styles from './PlayStoreBanner.module.css';

const PLAY_URL = 'https://play.google.com/store/apps/details?id=br.mp.lumi';
const APK_URL = 'https://lumimpma.site/download/lumi.apk';

export default function PlayStoreBanner() {
  return (
    <section className={`${styles.section} container`} id="baixar">
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.content}>
          <span className={styles.eyebrow}>
            <ShieldCheck size={14} /> App oficial do MPMA
          </span>
          <h2 className={styles.title}>Baixe o LUMI e denuncie pelo celular</h2>
          <p className={styles.subtitle}>
            Já disponível para Android na Google Play. Denuncie com segurança e
            sigilo, acompanhe seu protocolo e receba atualizações — de onde estiver.
          </p>
          <div className={styles.actions}>
            <a className={styles.badge} href={PLAY_URL} target="_blank" rel="noopener noreferrer">
              <Play size={26} fill="#fff" />
              <span>
                <span className={styles.badgeSmall}>DISPONÍVEL NA</span>
                <br />
                <span className={styles.badgeBig}>Google Play</span>
              </span>
            </a>
            <a className={styles.ghost} href={APK_URL}>
              <Download size={18} /> Baixar APK
            </a>
          </div>
        </div>
        <div className={styles.visual}>
          <img src="/images/LUMIOFICIAL.png" alt="Aplicativo LUMI" />
        </div>
      </motion.div>
    </section>
  );
}
