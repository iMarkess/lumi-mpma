import type { MetadataRoute } from 'next';

// Necessário com `output: 'export'` para gerar o manifest como arquivo estático.
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'LUMI — com você na proteção da vida',
    short_name: 'LUMI',
    description:
      'Canal independente para registrar denúncias de violência e violação de direitos com sigilo, e acompanhar o andamento por protocolo.',
    lang: 'pt-BR',
    dir: 'ltr',
    start_url: '/app?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait',
    background_color: '#F6F8FC',
    theme_color: '#00458E',
    // Sem 'government': o LUMI não é um serviço público. Essa categoria é um
    // dos sinais que fazem a Play exigir conta de organização.
    categories: ['social', 'utilities', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Fazer denúncia',
        short_name: 'Denunciar',
        description: 'Registrar uma nova denúncia',
        url: '/denunciar/child?source=shortcut',
        icons: [{ src: '/icons/shortcut-denunciar.png', sizes: '96x96', type: 'image/png' }],
      },
      {
        name: 'Acompanhar protocolo',
        short_name: 'Protocolo',
        description: 'Consultar o status de uma denúncia',
        url: '/acompanhar?source=shortcut',
        icons: [{ src: '/icons/shortcut-acompanhar.png', sizes: '96x96', type: 'image/png' }],
      },
    ],
  };
}
