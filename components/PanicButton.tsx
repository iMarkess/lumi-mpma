'use client';

import { usePathname } from 'next/navigation';

export default function PanicButton() {
  const pathname = usePathname();
  
  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <a 
      href="https://www.google.com.br" 
      className="panic-button"
      title="Sair do site imediatamente"
    >
      <span style={{ fontSize: '1.4rem' }}>⚡</span> SAIR AGORA
    </a>
  );
}
