'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Info, Lock, ArrowRight, Sparkle } from 'lucide-react';
import styles from './Navbar.module.css';

// `route` é a rota que marca o item como página atual. Links de âncora não
// têm rota própria, então ficam sem `route` e nunca recebem aria-current.
const LINKS = [
  { href: '/', label: 'Início', icon: Home, route: '/' },
  { href: '/acompanhar', label: 'Protocolo', icon: Search, route: '/acompanhar' },
  { href: '/#orientacoes', label: 'Orientações', icon: Info },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  /*
    Sentinela no topo do documento em vez de ouvir `scroll`.
    Com um link de âncora (/#categories) ou um refresh no meio da página, o
    navegador já entrega a página rolada e um listener de scroll só dispara no
    primeiro movimento — a barra ficava em modo claro-sobre-escuro por cima do
    conteúdo claro e o texto sumia. O observer resolve na primeira medição,
    qualquer que seja a posição inicial.
  */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`${styles.inner} container`}>
        <Link href="/" className={styles.logo} aria-label="LUMI — página inicial">
          {/* Marca tipográfica. O brasão institucional saiu daqui: o LUMI é um
              canal independente e não pode se apresentar como órgão público. */}
          <span className={styles.logoMark} aria-hidden="true">
            <Sparkle size={20} strokeWidth={2.5} />
          </span>
          <span className={styles.logoText}>
            <span className={styles.logoName}>LUMI</span>
            <span className={styles.logoOrg}>com você na proteção da vida</span>
          </span>
        </Link>

        <nav className={styles.links} aria-label="Navegação principal">
          {LINKS.map(({ href, label, icon: Icon, route }) => {
            const active = route
              ? route === '/'
                ? pathname === '/'
                : pathname.startsWith(route)
              : false;
            return (
              <Link
                key={href}
                href={href}
                className={styles.link}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
          <Link href="/admin" className={styles.adminLink}>
            <Lock size={15} aria-hidden="true" />
            Painel
          </Link>
        </nav>

        <button
          className={styles.cta}
          onClick={() => router.push('/#categories')}
        >
          <span className={styles.ctaFull}>Denunciar agora</span>
          <span className={styles.ctaShort}>Denunciar</span>
          <ArrowRight size={17} aria-hidden="true" />
        </button>
        </div>
      </header>
    </>
  );
}
