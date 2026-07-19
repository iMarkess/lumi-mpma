'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCitizenAuth } from '@/context/CitizenAuth';
import {
  Baby,
  HeartPulse,
  Leaf,
  ChevronRight,
  Search,
  LifeBuoy,
  Phone,
  ShieldCheck,
  EyeOff,
  BadgeCheck,
  Siren,
  Bell,
  FolderClosed,
  Clock3,
  CheckCircle2,
} from 'lucide-react';
import styles from './AppHome.module.css';

const categories = [
  {
    id: 'child',
    title: 'Criança e Adolescente',
    desc: 'Violência física, sexual, negligência e exploração.',
    icon: <Baby size={26} />,
    accent: '#00458E',
    soft: 'rgba(0, 69, 142, 0.10)',
  },
  {
    id: 'elderly',
    title: 'Idosos e Vulneráveis',
    desc: 'Maus-tratos, abandono e pessoas com deficiência.',
    icon: <HeartPulse size={26} />,
    accent: '#E62310',
    soft: 'rgba(230, 35, 16, 0.10)',
  },
  {
    id: 'env',
    title: 'Meio Ambiente',
    desc: 'Poluição, desmatamento, queimadas e animais.',
    icon: <Leaf size={26} />,
    accent: '#0E9F6E',
    soft: 'rgba(14, 159, 110, 0.10)',
  },
];

const emergencies = [
  { number: '190', label: 'Polícia Militar' },
  { number: '100', label: 'Direitos Humanos' },
  { number: '181', label: 'Disque-Denúncia' },
];

const stats = [
  { num: '0', label: 'Protocolos', icon: <FolderClosed size={18} />, color: '#00458E', soft: 'rgba(0,69,142,0.12)' },
  { num: '0', label: 'Em análise', icon: <Clock3 size={18} />, color: '#D97706', soft: 'rgba(217,119,6,0.14)' },
  { num: '0', label: 'Resolvidas', icon: <CheckCircle2 size={18} />, color: '#0E9F6E', soft: 'rgba(14,159,110,0.14)' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function AppHome() {
  const router = useRouter();
  const { user } = useCitizenAuth();
  const firstName = user?.name?.trim().split(' ')[0] ?? 'Cidadão';

  return (
    <main className={styles.shell}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.identity}>
          <img className={styles.logo} src="/images/lumi_logo.png" alt="MPMA" />
          <div>
            <div className={styles.eyebrow}>{greeting()},</div>
            <div className={styles.name}>{firstName}</div>
          </div>
        </div>
        <button
          className={styles.bell}
          onClick={() => router.push('/?source=app#orientacoes')}
          aria-label="Notificações"
        >
          <Bell size={20} />
          <span className={styles.bellDot} />
        </button>
      </header>

      {/* Hero */}
      <motion.section
        className={styles.hero}
        variants={fade}
        custom={0}
        initial="hidden"
        animate="show"
      >
        <img
          className={styles.heroMascot}
          src="/images/lumi_mascot_premium.png"
          alt=""
          aria-hidden="true"
        />
        <div className={styles.heroContent}>
          <span className={styles.heroHi}>
            <ShieldCheck size={14} /> SOU A LUMI
          </span>
          <h1 className={styles.heroTitle}>
            Como posso te proteger hoje?
          </h1>
          <p className={styles.heroSub}>
            Denuncie com sigilo total. Pode ser anônima.
          </p>
          <button
            className={styles.heroCta}
            onClick={() => router.push('/denunciar/child?source=app')}
          >
            Fazer denúncia <ChevronRight size={18} />
          </button>
          <div className={styles.heroChips}>
            <span className={styles.heroChip}><ShieldCheck size={12} /> Sigilo</span>
            <span className={styles.heroChip}><EyeOff size={12} /> Anônimo</span>
            <span className={styles.heroChip}><BadgeCheck size={12} /> Oficial</span>
          </div>
        </div>
      </motion.section>

      <div className={styles.body}>
        {/* Stats */}
        <motion.div
          className={styles.stats}
          variants={fade}
          custom={1}
          initial="hidden"
          animate="show"
        >
          {stats.map((s) => (
            <div className={styles.stat} key={s.label}>
              <div className={styles.statIcon} style={{ background: s.soft, color: s.color }}>
                {s.icon}
              </div>
              <div className={styles.statNum}>{s.num}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Categorias */}
        <section>
          <span className={styles.sectionLabel}>Fazer uma denúncia</span>
          <div className={styles.cards}>
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                type="button"
                className={styles.card}
                style={{ '--accent': cat.accent, '--accent-soft': cat.soft } as React.CSSProperties}
                variants={fade}
                custom={i + 2}
                initial="hidden"
                animate="show"
                onClick={() => router.push(`/denunciar/${cat.id}?source=app`)}
                aria-label={`Denunciar: ${cat.title}`}
              >
                <span className={styles.cardIcon}>{cat.icon}</span>
                <span className={styles.cardBody}>
                  <span className={styles.cardTitle}>{cat.title}</span>
                  <span className={styles.cardDesc}>{cat.desc}</span>
                </span>
                <ChevronRight className={styles.cardChevron} size={22} />
              </motion.button>
            ))}
          </div>
        </section>

        {/* Acesso rápido */}
        <motion.section variants={fade} custom={5} initial="hidden" animate="show">
          <span className={styles.sectionLabel}>Acesso rápido</span>
          <div className={styles.quickGrid}>
            <button
              type="button"
              className={styles.quick}
              onClick={() => router.push('/acompanhar?source=app')}
            >
              <span className={styles.quickIcon} style={{ background: 'var(--secondary)' }}>
                <Search size={20} />
              </span>
              <span className={styles.quickTitle}>Acompanhar</span>
              <span className={styles.quickDesc}>Consulte o status pelo protocolo.</span>
            </button>

            <button
              type="button"
              className={styles.quick}
              onClick={() => router.push('/?source=app#orientacoes')}
            >
              <span className={styles.quickIcon} style={{ background: 'var(--accent)' }}>
                <LifeBuoy size={20} />
              </span>
              <span className={styles.quickTitle}>Orientações</span>
              <span className={styles.quickDesc}>Como denunciar e seus direitos.</span>
            </button>
          </div>
        </motion.section>

        {/* Emergência */}
        <motion.section
          className={styles.emergency}
          variants={fade}
          custom={6}
          initial="hidden"
          animate="show"
        >
          <div className={styles.emergencyTop}>
            <span className={styles.emergencyPulse}>
              <Siren size={20} />
            </span>
            <div>
              <h3>Emergência agora?</h3>
              <p>Se há risco imediato à vida, ligue direto.</p>
            </div>
          </div>
          <div className={styles.callRow}>
            {emergencies.map((e) => (
              <a key={e.number} className={styles.call} href={`tel:${e.number}`}>
                <span className={styles.callNumber}>{e.number}</span>
                <span className={styles.callLabel}>{e.label}</span>
                <Phone size={13} style={{ opacity: 0.6, marginTop: 2 }} />
              </a>
            ))}
          </div>
        </motion.section>
      </div>

      <footer className={styles.foot}>
        Ministério Público do Estado do Maranhão · LUMI
      </footer>
    </main>
  );
}
