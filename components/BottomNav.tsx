'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShieldAlert, Search, Info, X, Baby, HeartPulse, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Esc fecha a folha e o fundo para de rolar enquanto ela está aberta.
  useEffect(() => {
    if (!isSheetOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSheetOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isSheetOpen]);

  // Hide on admin routes
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const handleNavItemClick = (path: string) => {
    if (path.startsWith('/#')) {
      // Handle page anchors
      if (pathname === '/') {
        const el = document.getElementById(path.substring(2));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push(path);
      }
    } else {
      router.push(path);
    }
  };

  return (
    <>
      <nav className="bottom-nav">
        {/* Home */}
        <button
          className={`nav-item ${(pathname === '/app' || pathname === '/') && !isSheetOpen ? 'active' : ''}`}
          onClick={() => router.push('/app')}
        >
          <div className="nav-icon"><Home size={22} /></div>
          <span className="nav-label">Início</span>
        </button>

        {/* Protocol */}
        <button 
          className={`nav-item ${pathname === '/acompanhar' && !isSheetOpen ? 'active' : ''}`}
          onClick={() => router.push('/acompanhar')}
        >
          <div className="nav-icon"><Search size={22} /></div>
          <span className="nav-label">Protocolo</span>
        </button>

        {/* Ação central (Denunciar) — <button> e não <div>: precisa receber
            foco pelo Tab e abrir com Enter/Espaço. */}
        <button
          type="button"
          className="nav-item-center"
          onClick={() => setIsSheetOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isSheetOpen}
          aria-label="Iniciar nova denúncia"
        >
          <div className="center-btn-inner">
            <ShieldAlert size={26} aria-hidden="true" />
          </div>
        </button>

        {/* Help */}
        <button 
          className={`nav-item ${pathname === '/#orientacoes' && !isSheetOpen ? 'active' : ''}`}
          onClick={() => handleNavItemClick('/#orientacoes')}
        >
          <div className="nav-icon"><Info size={22} /></div>
          <span className="nav-label">Ajuda</span>
        </button>
      </nav>

      {/* Bottom Sheet Menu */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="sheet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
            />

            {/* Sheet Card */}
            <motion.div
              className="sheet-container"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sheet-denuncia-titulo"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            >
              <div className="sheet-drag-handle" />

              <div className="sheet-header">
                <h3 id="sheet-denuncia-titulo" className="sheet-title">Iniciar nova denúncia</h3>
                <button
                  className="sheet-close"
                  onClick={() => setIsSheetOpen(false)}
                  aria-label="Fechar"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="sheet-options">
                <Link 
                  href="/denunciar/child" 
                  className="sheet-item"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <div className="sheet-icon-wrapper" style={{ background: '#00458E' }}>
                    <Baby size={22} />
                  </div>
                  <div className="sheet-item-text">
                    <span className="sheet-item-title">Criança e Adolescente</span>
                    <span className="sheet-item-desc">Violência física, negligência, exploração infantil.</span>
                  </div>
                </Link>

                <Link 
                  href="/denunciar/elderly" 
                  className="sheet-item"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <div className="sheet-icon-wrapper" style={{ background: '#E62310' }}>
                    <HeartPulse size={22} />
                  </div>
                  <div className="sheet-item-text">
                    <span className="sheet-item-title">Idosos e Vulneráveis</span>
                    <span className="sheet-item-desc">Maus-tratos, abandono de idosos e deficientes.</span>
                  </div>
                </Link>

                <Link 
                  href="/denunciar/env" 
                  className="sheet-item"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <div className="sheet-icon-wrapper" style={{ background: '#0E9F6E' }}>
                    <Leaf size={22} />
                  </div>
                  <div className="sheet-item-text">
                    <span className="sheet-item-title">Violência Ambiental</span>
                    <span className="sheet-item-desc">Maus-tratos a animais, desmatamento, queimadas.</span>
                  </div>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
