'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Play, Download, ShieldCheck } from 'lucide-react';
import styles from './PlayStoreBanner.module.css';

/*
  applicationId real do pacote publicado. O link antigo apontava para
  `br.mp.lumi`, que nunca chegou a ser buildado — a ficha da loja nesse id
  não existe. O valor correto está fixado em mobile/ci/configure_android.py.
*/
const PLAY_URL = 'https://play.google.com/store/apps/details?id=br.com.lumi.denuncia';
const APK_URL = 'https://lumimpma.site/download/lumi.apk';

export default function PlayStoreBanner() {
  return (
    <section className={styles.section} id="baixar" aria-labelledby="baixar-titulo">
      <div className="container">
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.content}>
            <p className={styles.eyebrow}>
              <ShieldCheck size={14} aria-hidden="true" />
              App oficial do MPMA
            </p>
            <h2 id="baixar-titulo" className={styles.title}>
              Leve a Lumi no bolso
            </h2>
            <p className={styles.subtitle}>
              Denuncie com segurança e sigilo, acompanhe o protocolo e receba
              atualizações do seu caso — de onde estiver.
            </p>

            <div className={styles.actions}>
              <a
                className={styles.badge}
                href={PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Play size={26} fill="currentColor" aria-hidden="true" />
                <span className={styles.badgeText}>
                  <span className={styles.badgeSmall}>Disponível no</span>
                  <span className={styles.badgeBig}>Google Play</span>
                </span>
              </a>
              <a className={styles.ghost} href={APK_URL}>
                <Download size={18} aria-hidden="true" />
                Baixar APK
              </a>
            </div>
          </div>

          <div className={styles.visual}>
            <Image
              src="/images/lumi-app.png"
              alt="Aplicativo LUMI no celular"
              width={600}
              height={600}
              className={styles.visualImg}
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
