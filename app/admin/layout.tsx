'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import styles from './AdminLayout.module.css';

type NavItem = { label: string; href: string; icon: typeof Inbox; roles: string[] };

const NAV: NavItem[] = [
  { label: 'Visão geral', href: '/admin', icon: LayoutDashboard, roles: ['promotor', 'secretaria', 'master'] },
  { label: 'Denúncias', href: '/admin/triage', icon: Inbox, roles: ['promotor', 'secretaria', 'ouvidoria', 'master'] },
  { label: 'Relatórios', href: '/admin/reports', icon: BarChart3, roles: ['promotor', 'secretaria', 'ouvidoria', 'master'] },
  { label: 'Equipe', href: '/admin/users', icon: Users, roles: ['promotor', 'master'] },
  { label: 'Minha conta', href: '/admin/settings', icon: Settings, roles: ['promotor', 'secretaria', 'ouvidoria', 'master'] },
];

const ROLE_NAME: Record<string, string> = {
  promotor: 'Promotor(a)',
  secretaria: 'Secretaria',
  ouvidoria: 'Ouvidoria',
  master: 'Administrador',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, isAuthLoading } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUser && pathname !== '/admin/login') router.replace('/admin/login');
    else if (currentUser?.role === 'ouvidoria' && pathname === '/admin') router.replace('/admin/triage');
  }, [currentUser, isAuthLoading, pathname, router]);

  if (pathname === '/admin/login') return <>{children}</>;

  if (isAuthLoading || !currentUser) {
    return (
      <div className={styles.loading}>
        <span className={styles.spinner} aria-label="Carregando" />
      </div>
    );
  }

  const items = NAV.filter((i) => i.roles.includes(currentUser.role));
  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/admin/triage?q=${encodeURIComponent(q)}` : '/admin/triage');
  };

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.open : ''}`} aria-label="Menu do painel">
        <div className={styles.brand}>
          <Image src="/icons/icon-192.png" alt="" width={36} height={36} className={styles.brandMark} />
          <div>
            <strong>LUMI</strong>
            <span>Painel da equipe</span>
          </div>
          <button type="button" className={styles.closeMenu} onClick={() => setMenuOpen(false)} aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={styles.navItem}
              aria-current={isActive(href) ? 'page' : undefined}
              onClick={() => setMenuOpen(false)} // fecha a gaveta do celular
            >
              <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className={styles.me}>
          <span className={styles.avatar} aria-hidden="true">{currentUser.avatar}</span>
          <div className={styles.meText}>
            <strong>{currentUser.name}</strong>
            <span>{ROLE_NAME[currentUser.role] ?? currentUser.role}</span>
          </div>
          <button
            type="button"
            className={styles.logout}
            onClick={() => {
              logout();
              router.replace('/admin/login');
            }}
            aria-label="Sair do painel"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {menuOpen && <button type="button" className={styles.scrim} onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button type="button" className={styles.menuBtn} onClick={() => setMenuOpen(true)} aria-label="Abrir menu">
            <Menu size={22} />
          </button>
          <form className={styles.search} onSubmit={search} role="search">
            <Search size={18} aria-hidden="true" />
            <label htmlFor="admin-busca" className="sr-only">Buscar denúncia</label>
            <input
              id="admin-busca"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por protocolo, título ou local"
            />
            <kbd>Enter</kbd>
          </form>
          <a href="/" className={styles.siteLink} target="_blank" rel="noopener noreferrer">
            Ver site
          </a>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
