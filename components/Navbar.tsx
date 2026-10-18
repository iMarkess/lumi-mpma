'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import styles from './Navbar.module.css';

// `route` marca o item como página atual; âncoras da home não recebem aria-current.
const LINKS = [
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/#sigilo', label: 'Sigilo' },
  { href: '/acompanhar', label: 'Consultar protocolo', route: '/acompanhar' },
  { href: '/#duvidas', label: 'Dúvidas' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Sentinela em vez de ouvir `scroll`: resolve na 1ª medição, mesmo com a
  // página já entregue rolada (âncora ou refresh).
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <header className={`${styles.wrap} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.pill}>
          {/* Sem brasão: a LUMI é independente, não órgão público. */}
          <Link href="/" className={styles.logo} aria-label="LUMI, página inicial">
            <Image src="/icons/icon-192.png" alt="" width={34} height={34} className={styles.logoMark} priority />
            <span className={styles.logoName}>LUMI</span>
          </Link>

          <nav className={styles.links} aria-label="Navegação principal">
            {LINKS.map(({ href, label, route }) => (
              <Link
                key={href}
                href={href}
                className={styles.link}
                aria-current={route && pathname.startsWith(route) ? 'page' : undefined}
              >
                {label}
              </Link>
            ))}
            <Link href="/admin" className={styles.link}>
              Equipe
            </Link>
          </nav>

          <Link href="/#denunciar" className={styles.cta}>
            Denunciar
            <span className={styles.ctaIcon} aria-hidden="true">
              <ArrowUpRight size={16} strokeWidth={2} />
            </span>
          </Link>
        </div>
      </header>
    </>
  );
}
