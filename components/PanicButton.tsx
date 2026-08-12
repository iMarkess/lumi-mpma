'use client';

import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

/**
 * Saída rápida: tira a pessoa do site num toque, caso alguém se aproxime.
 * Fica sempre visível, mas em ardósia escura — se fosse mais um bloco
 * vermelho, competiria com o CTA de denúncia e ninguém acharia nenhum dos dois.
 */
export default function PanicButton() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <a
      href="https://www.google.com.br"
      className="panic-button"
      title="Sair do site imediatamente"
    >
      {/* Ícone vetorial, não emoji: emoji muda de forma a cada plataforma e
          não aceita as cores do tema. */}
      <LogOut size={18} aria-hidden="true" />
      Sair agora
    </a>
  );
}
