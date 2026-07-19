import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Categories from '@/components/Categories';
import TrustSection from '@/components/TrustSection';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      <Hero />
      <TrustSection />
      <Categories />
      <Footer />
    </main>
  );
}
