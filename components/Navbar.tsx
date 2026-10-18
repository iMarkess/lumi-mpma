'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import styles from './Navbar.module.css';

// `route` marca o item como página atual. Âncoras da home não têm rota
// própria, então nunca recebem aria-current.
const LINKS = [
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/#sigilo', label: 'Sigilo e dados' },
  { href: '/acompanhar', label: 'Consultar protocolo', route: '/acompanhar' },
  { href: '/#duvidas', label: 'Dúvidas' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  /*
    Sentinela no topo em vez de ouvir `scroll`: com âncora ou refresh no meio
    da página o navegador já entrega a página rolada, e o observer resolve na
    primeira medição — a barra nunca fica transparente por cima do conteúdo.
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
          {/* Marca do LUMI, sem brasão: canal independente, não órgão público. */}
          <Link href="/" className={styles.logo} aria-label="LUMI — página inicial">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={40}
              height={40}
              className={styles.logoMark}
              priority
            />
            <span className={styles.logoText}>
              <span className={styles.logoName}>LUMI</span>
              <span className={styles.logoTag}>Canal independente de denúncias</span>
            </span>
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
          </nav>

          <div className={styles.actions}>
            <Link href="/admin" className={styles.staff}>
              Área da equipe
            </Link>
            <Link href="/#denunciar" className={styles.cta}>
              Fazer denúncia
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
