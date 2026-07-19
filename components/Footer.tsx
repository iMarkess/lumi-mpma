'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './Footer.module.css';

export default function Footer() {
  const router = useRouter();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.bgGlow} aria-hidden="true"></div>

      <div className="container">
        {/* CTA strip */}
        <div className={styles.cta}>
          <div>
            <h3 className={styles.ctaTitle}>Precisa fazer uma denúncia?</h3>
            <p className={styles.ctaText}>
              Sua coragem pode salvar vidas. Conte com a Lumi a qualquer momento.
            </p>
          </div>
          <button
            className={styles.ctaButton}
            onClick={() => router.push('/#categories')}
          >
            Começar agora <ArrowRight size={18} />
          </button>
        </div>

        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logoRow}>
              <img
                src="/images/Gemini_Generated_Image_gjyowhgjyowhgjyo-Photoroom.png"
                alt="MPMA"
                className={styles.logo}
              />
              <div className={styles.sep}></div>
              <span className={styles.brandName}>PORTAL MPMA</span>
            </div>
            <p className={styles.brandTagline}>
              Plataforma oficial de auxílio à denúncia e proteção de direitos
              fundamentais no Estado do Maranhão.
            </p>
          </div>

          <div className={styles.links}>
            <div className={styles.column}>
              <h4>Institucional</h4>
              <a href="#">Quem Somos</a>
              <a href="#">Transparência</a>
              <a href="#">Contatos</a>
            </div>
            <div className={styles.column}>
              <h4>Serviços</h4>
              <a href="/denunciar/child">Infância</a>
              <a href="/denunciar/elderly">Idosos</a>
              <a href="/acompanhar">Protocolos</a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© 2026 Ministério Público do Estado do Maranhão — Todos os direitos reservados.</p>
          <div className={styles.legal}>
            <a href="#">Privacidade</a>
            <a href="#">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
