'use client';

import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

const EXIT_URL = 'https://www.google.com.br';

/**
 * Saída rápida: tira a pessoa do site num toque, caso alguém se aproxime.
 * Usa location.replace para a LUMI não ficar no "voltar" do navegador.
 * Ardósia escura, não vermelho: senão competiria com o CTA de denúncia.
 */
export default function PanicButton() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <a
      href={EXIT_URL}
      className="panic-button"
      title="Sair do site imediatamente"
      onClick={(e) => {
        e.preventDefault();
        window.location.replace(EXIT_URL);
      }}
    >
      <LogOut size={18} aria-hidden="true" />
      <span className="panic-label-long">Sair agora</span>
      <span className="panic-label-short">Sair</span>
    </a>
  );
}
