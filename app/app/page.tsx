import type { Metadata } from 'next';
import AuthGate from '@/components/AuthGate';
import AppHome from '@/components/AppHome';

export const metadata: Metadata = {
  title: 'Início',
  description:
    'Faça sua denúncia com segurança e sigilo com o aplicativo LUMI.',
};

export default function AppHomePage() {
  return (
    <AuthGate>
      <AppHome />
    </AuthGate>
  );
}
