'use client';

import Link from 'next/link';
import { ArrowRight, ExternalLink, Sparkle } from 'lucide-react';
import styles from './Footer.module.css';

/*
  Todo destino aqui foi verificado. Nada de href="#": link morto em rodapé
  institucional custa confiança, e a política de privacidade precisa ficar
  alcançável de qualquer página (exigência da Play Store).
*/
type FooterLink = { href: string; label: string; external?: boolean };

const COLUMNS: Array<{ heading: string; links: FooterLink[] }> = [
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
    heading: 'Sobre',
    links: [
      { href: '/#orientacoes', label: 'Como funciona' },
      { href: '/admin', label: 'Painel da equipe' },
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
              <span className={styles.logo} aria-hidden="true">
                <Sparkle size={20} strokeWidth={2.5} />
              </span>
              <span className={styles.sep} aria-hidden="true" />
              <span className={styles.brandName}>LUMI</span>
            </div>
            <p className={styles.brandTagline}>
              Canal de acolhimento e encaminhamento de denúncias de violência e
              violação de direitos. Com você na proteção da vida.
            </p>
            {/* Declaração explícita de independência: o app já foi retirado da
                Play por ter sido lido como serviço de governo. */}
            <p className={styles.disclaimer}>
              O LUMI é um serviço independente. Não é um site do governo e não
              representa o Ministério Público nem qualquer órgão oficial. As
              denúncias recebidas são encaminhadas aos canais competentes.
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
            © {new Date().getFullYear()} LUMI — Todos os direitos reservados.
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
