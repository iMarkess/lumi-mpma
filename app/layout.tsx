import type { Metadata, Viewport } from "next";
import { Lexend, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { CitizenAuthProvider } from "@/context/CitizenAuth";
import PanicButton from "@/components/PanicButton";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";

// Source Sans 3: desenhada para leitura longa em tela, com acentos do
// português bem resolvidos. Lexend fica só nos títulos.
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-lexend",
  display: "swap",
});

// O LUMI é um serviço independente. Nenhum texto aqui pode sugerir que é um
// canal de governo: foi essa leitura que tirou o app da Play em 19/07/2026.
const APP_NAME = "LUMI";
const APP_DESCRIPTION =
  "Canal independente para registrar denúncias de violência e violação de direitos com sigilo, e acompanhar o andamento por protocolo.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: "LUMI — com você na proteção da vida",
    template: "%s · LUMI",
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
  metadataBase: new URL("https://lumimpma.site"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: APP_NAME,
    title: "LUMI — Luz e proteção para quem mais precisa",
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/store/feature-graphic.png",
        width: 1024,
        height: 500,
        alt: "LUMI — canal independente de denúncias",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LUMI — Luz e proteção para quem mais precisa",
    description: APP_DESCRIPTION,
    images: ["/store/feature-graphic.png"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#002D5C" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // As variáveis de fonte ficam no <html>: os tokens --font-display/--font-body
    // são resolvidos no :root, e lá uma variável definida só no <body> não existe.
    <html lang="pt-BR" className={`${sourceSans.variable} ${lexend.variable}`} suppressHydrationWarning>
      <body className={sourceSans.className} suppressHydrationWarning>
        <AppProvider>
          <CitizenAuthProvider>
          {children}

          <PanicButton />
          <BottomNav />
          <InstallPrompt />
          <ServiceWorkerRegister />
          </CitizenAuthProvider>
        </AppProvider>
      </body>
    </html>
  );
}
