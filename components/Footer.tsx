'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import styles from './Footer.module.css';

/*
  Todo destino aqui foi verificado. Nada de href="#": link morto em rodapé
  institucional custa confiança, e a política de privacidade precisa ficar
  alcançável de qualquer página (exigência da Play Store).
*/
const COLUMNS = [
  {
    heading: 'Serviços',
    links: [
      { href: '/#categories', label: 'Fazer denúncia' },
      { href: '/acompanhar', label: 'Acompanhar protocolo' },
      { href: '/#orientacoes', label: 'Orientações' },
      { href: '/#baixar', label: 'Baixar o aplicativo' },
    ],
  },
  {
    heading: 'Privacidade e dados',
    links: [
      { href: '/privacidade', label: 'Política de privacidade' },
      { href: '/excluir-conta', label: 'Excluir minha conta' },
    ],
  },
  {
    heading: 'Institucional',
    links: [
      { href: 'https://www.mpma.mp.br', label: 'Site do MPMA', external: true },
      { href: '/admin', label: 'Painel do servidor' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.bgGlow} aria-hidden="true" />

      <div className="container">
        <div className={styles.cta}>
          <div>
            <h2 className={styles.ctaTitle}>Precisa fazer uma denúncia?</h2>
            <p className={styles.ctaText}>
              Sua coragem pode salvar vidas. A Lumi está disponível a qualquer hora.
            </p>
          </div>
          <Link href="/#categories" className={styles.ctaButton}>
            Começar agora
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logoRow}>
              <Image
                src="/images/logo-mpma.png"
                alt=""
                width={256}
                height={256}
                className={styles.logo}
                loading="lazy"
              />
              <span className={styles.sep} aria-hidden="true" />
              <span className={styles.brandName}>LUMI · MPMA</span>
            </div>
            <p className={styles.brandTagline}>
              Plataforma oficial de auxílio à denúncia e proteção de direitos
              fundamentais no Estado do Maranhão.
            </p>
          </div>

          <nav className={styles.links} aria-label="Rodapé">
            {COLUMNS.map(({ heading, links }) => (
              <div key={heading} className={styles.column}>
                <h3>{heading}</h3>
                {links.map(({ href, label, external }) =>
                  external ? (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {label}
                      <ExternalLink size={13} aria-hidden="true" />
                      <span className="sr-only">(abre em nova aba)</span>
                    </a>
                  ) : (
                    <Link key={href} href={href} className={styles.link}>
                      {label}
                    </Link>
                  ),
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          {/* O ano é calculado no build (output: 'export') e recalculado no
              cliente — suprime o aviso na virada do ano. */}
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} Ministério Público do Estado do Maranhão
            — Todos os direitos reservados.
          </p>
          <p className={styles.emergencyNote}>
            Emergência: <a href="tel:190">190</a> · Direitos Humanos:{' '}
            <a href="tel:100">100</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
