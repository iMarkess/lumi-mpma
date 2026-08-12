import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TrustSection from '@/components/TrustSection';
import Categories from '@/components/Categories';
import Guidelines from '@/components/Guidelines';
import PlayStoreBanner from '@/components/PlayStoreBanner';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>

      <Navbar />

      <main id="conteudo" className={styles.main}>
        <Hero />
        <TrustSection />
        <Categories />
        {/* Alvo dos links "Orientações" da navbar e da barra inferior — antes
            os dois apontavam para uma âncora que não existia. */}
        <Guidelines />
        <PlayStoreBanner />
      </main>

      <Footer />
    </div>
  );
}
