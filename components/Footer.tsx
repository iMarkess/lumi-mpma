import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';

/*
  Todo destino aqui foi verificado. /privacidade e /excluir-conta são servidas
  pelo backend (nginx faz o proxy), por isso usam <a> e não <Link>.
*/
type FooterLink = { href: string; label: string; backend?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Denunciar',
    links: [
      { href: '/denunciar/child', label: 'Criança e adolescente' },
      { href: '/denunciar/elderly', label: 'Idosos e pessoas com deficiência' },
      { href: '/denunciar/env', label: 'Meio ambiente' },
      { href: '/acompanhar', label: 'Consultar protocolo' },
    ],
  },
  {
    title: 'Privacidade',
    links: [
      { href: '/privacidade', label: 'Política de privacidade', backend: true },
      { href: '/excluir-conta', label: 'Excluir conta e dados', backend: true },
      { href: '/#sigilo', label: 'O que coletamos' },
    ],
  },
  {
    title: 'LUMI',
    links: [
      { href: '/#como-funciona', label: 'Como funciona' },
      { href: '/#duvidas', label: 'Perguntas frequentes' },
      { href: '/#baixar', label: 'Aplicativo Android' },
      { href: '/admin', label: 'Área da equipe' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.top} container`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo} aria-label="LUMI, página inicial">
            <Image src="/icons/icon-192.png" alt="" width={44} height={44} className={styles.logoMark} />
            <span className={styles.logoName}>LUMI</span>
          </Link>
          <p className={styles.about}>
            Canal independente para registrar denúncias de violência e violação de
            direitos com sigilo, e acompanhar cada etapa pelo protocolo.
          </p>
          <p className={styles.emergency}>
            Risco imediato: <a href="tel:190">190</a> · Direitos Humanos:{' '}
            <a href="tel:100">100</a> · Disque-Denúncia: <a href="tel:181">181</a>
          </p>
        </div>

        {COLUMNS.map(({ title, links }) => (
          <nav key={title} className={styles.column} aria-label={title}>
            <h2 className={styles.columnTitle}>{title}</h2>
            <ul>
              {links.map(({ href, label, backend }) => (
                <li key={href}>
                  {backend ? (
                    <a href={href} className={styles.link}>{label}</a>
                  ) : (
                    <Link href={href} className={styles.link}>{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className={styles.bottomRule}>
      <div className={`${styles.bottom} container`}>
        <p>© {new Date().getFullYear()} LUMI · com você na proteção da vida</p>
        <p>
          A LUMI é um serviço independente e não é canal oficial de nenhum órgão público.
        </p>
      </div>
      </div>
    </footer>
  );
}
