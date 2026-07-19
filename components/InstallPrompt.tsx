'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Download, X, Share } from 'lucide-react';
import styles from './InstallPrompt.module.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'sentinela_install_dismissed';

/**
 * Banner de instalação do PWA:
 *  - Android/Chrome: usa beforeinstallprompt (botão Instalar nativo)
 *  - iOS Safari: mostra instrução (Compartilhar → Adicionar à Tela de Início)
 * Some quando já está instalado (standalone) ou quando o usuário dispensa.
 */
export default function InstallPrompt() {
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (standalone) return;

    if (localStorage.getItem(DISMISS_KEY)) return;

    const ios =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
      !/crios|fxios/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBip);

    // iOS não dispara beforeinstallprompt — mostra instrução após um instante.
    let t: ReturnType<typeof setTimeout> | undefined;
    if (ios) {
      t = setTimeout(() => setVisible(true), 1500);
    }

    const onInstalled = () => {
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, '1');
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.removeEventListener('appinstalled', onInstalled);
      if (t) clearTimeout(t);
    };
  }, []);

  // Não mostra em rotas administrativas.
  if (pathname && pathname.startsWith('/admin')) return null;
  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, '1');
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  return (
    <div className={styles.wrap} role="dialog" aria-label="Instalar aplicativo">
      <img className={styles.icon} src="/icons/icon-192.png" alt="" aria-hidden="true" />

      {isIOS ? (
        <>
          <div className={styles.text}>
            <div className={styles.title}>Instale o LUMI</div>
            <div className={styles.iosHint}>
              Toque em <Share size={13} style={{ verticalAlign: '-2px' }} />{' '}
              <strong>Compartilhar</strong> e depois{' '}
              <strong>Adicionar à Tela de Início</strong>.
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.close} onClick={dismiss} aria-label="Fechar">
              <X size={16} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.text}>
            <div className={styles.title}>Instalar o app LUMI</div>
            <div className={styles.sub}>Acesso rápido, offline e notificações.</div>
          </div>
          <div className={styles.actions}>
            <button className={styles.install} onClick={install}>
              <Download size={15} /> Instalar
            </button>
            <button className={styles.close} onClick={dismiss} aria-label="Fechar">
              <X size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
