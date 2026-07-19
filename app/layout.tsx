import type { Metadata, Viewport } from "next";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { CitizenAuthProvider } from "@/context/CitizenAuth";
import PanicButton from "@/components/PanicButton";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-lexend",
  display: "swap",
});

const APP_NAME = "LUMI MPMA";
const APP_DESCRIPTION =
  "Plataforma digital oficial do Ministério Público do Estado do Maranhão para denúncias e proteção de direitos.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: "LUMI MPMA - Conectando o Maranhão à Justiça e Proteção",
    template: "%s · LUMI MPMA",
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
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
    { media: "(prefers-color-scheme: light)", color: "#00458E" },
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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${lexend.variable} ${inter.className}`} suppressHydrationWarning>
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
