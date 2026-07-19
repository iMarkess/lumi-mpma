'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { LayoutDashboard, ListFilter, Map, BarChart3, Settings, LogOut, Users } from 'lucide-react';
import styles from './AdminLayout.module.css';
import { useAppContext } from '@/context/AppContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, isAuthLoading } = useAppContext();

  useEffect(() => {
    // Basic auth guard - only redirect if hydration is done
    if (!isAuthLoading) {
      if (!currentUser && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else if (currentUser && currentUser.role === 'ouvidoria' && pathname === '/admin') {
        router.push('/admin/triage');
      }
    }
  }, [currentUser, isAuthLoading, pathname, router]);

  // If on login page, don't show the full admin layout yet
  if (pathname === '/admin/login') {
    return <div style={{ minHeight: '100vh', background: '#0a192f' }}>{children}</div>;
  }

  // Show a loading state or nothing while hydrating to prevent flickering/redirect loops
  if (isAuthLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a192f' }}>
        <div className={styles.loadingPulse}></div>
      </div>
    );
  }

  if (!currentUser) return null;

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['promotor', 'secretaria', 'master'] },
    { label: 'Triagem', href: '/admin/triage', icon: ListFilter, roles: ['promotor', 'secretaria', 'ouvidoria', 'master'] },
    { label: 'Mapa de Calor', href: '/admin/heatmap', icon: Map, roles: ['promotor', 'secretaria', 'master'] },
    { label: 'Relatórios', href: '/admin/reports', icon: BarChart3, roles: ['promotor', 'secretaria', 'ouvidoria', 'master'] },
    { label: 'Usuários', href: '/admin/users', icon: Users, roles: ['promotor', 'master'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Image 
            src="/images/Gemini_Generated_Image_gjyowhgjyowhgjyo-Photoroom.png" 
            alt="MPMA" 
            width={48} 
            height={48} 
            className={styles.sidebarMpma}
            priority
          />

        </div>
        
        <nav className={styles.nav}>
          {filteredNav.map(item => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
            >
              <item.icon size={20} /> {item.label}
            </Link>
          ))}
        </nav>
        
        <div className={styles.footer}>
          <Link href="/admin/settings" className={`${styles.navItem} ${pathname === '/admin/settings' ? styles.active : ''}`}>
            <Settings size={20} /> Configurações
          </Link>
          <div className={styles.logoutWrapper}>
            <button className={styles.logoutButton} onClick={() => logout()}>
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </aside>
      
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.search}>
            <input type="text" placeholder="Buscar por protocolo, nome ou local..." />
          </div>
          <div className={styles.user}>
            <div className={styles.avatar}>{currentUser.avatar}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, color: '#18181b' }}>{currentUser.name}</span>
              <span style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'capitalize', fontWeight: 600 }}>{currentUser.role}</span>
            </div>
          </div>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
