'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Home, Search, Info, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`${styles.inner} container`}>
        <Link
          href="/"
          className={styles.logo}
          aria-label="Página inicial — MPMA"
        >
          <Image
            src="/images/Gemini_Generated_Image_gjyowhgjyowhgjyo-Photoroom.png"
            alt="Logo MPMA"
            width={80}
            height={80}
            className={styles.mpmaLogo}
            priority
          />
        </Link>

        <div className={styles.links}>
          <Link href="/" className={styles.link}><Home size={18} /> Início</Link>
          <Link href="/acompanhar" className={styles.link}><Search size={18} /> Protocolo</Link>
          <a href="#" className={styles.link}><Info size={18} /> Orientações</a>
          <Link href="/admin" className={styles.adminLink}><Lock size={15} /> Painel</Link>
        </div>

        <button
          className={styles.cta}
          onClick={() => router.push('/#categories')}
        >
          Denunciar Agora
          <ArrowRight size={17} />
        </button>
      </div>
    </nav>
  );
}
