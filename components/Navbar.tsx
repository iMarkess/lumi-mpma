'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Info, Lock, ArrowRight } from 'lucide-react';
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
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // O documento rola no elemento raiz, então scrollY é a fonte correta.
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`${styles.inner} container`}>
        <Link href="/" className={styles.logo} aria-label="LUMI MPMA — página inicial">
          <Image
            src="/images/logo-mpma.png"
            alt=""
            width={256}
            height={256}
            className={styles.logoMark}
            priority
          />
          <span className={styles.logoText}>
            <span className={styles.logoName}>LUMI</span>
            <span className={styles.logoOrg}>Ministério Público do Maranhão</span>
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
  );
}
