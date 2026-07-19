import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import TrustSection from '@/components/TrustSection';
import PlayStoreBanner from '@/components/PlayStoreBanner';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      <Hero />
      <TrustSection />
      <Categories />
      <PlayStoreBanner />
      <Footer />
    </main>
  );
}
