import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Baby,
  Check,
  EyeOff,
  FileText,
  Fingerprint,
  Hash,
  HeartHandshake,
  Leaf,
  Lock,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtocolLookup from '@/components/ProtocolLookup';
import Reveal from '@/components/Reveal';
import styles from './page.module.css';

const CATEGORIES = [
  {
    id: 'child',
    title: 'Criança e adolescente',
    text: 'Violência física, sexual ou psicológica, negligência, trabalho infantil e exploração.',
    examples: ['Agressão', 'Abuso', 'Negligência', 'Trabalho infantil'],
    icon: Baby,
    tone: 'blue',
    featured: true,
  },
  {
    id: 'elderly',
    title: 'Idosos e pessoas com deficiência',
    text: 'Maus-tratos, abandono, cárcere e golpes contra quem é mais vulnerável.',
    examples: ['Abandono', 'Maus-tratos', 'Golpe'],
    icon: HeartHandshake,
    tone: 'red',
    featured: false,
  },
  {
    id: 'env',
    title: 'Meio ambiente',
    text: 'Queimadas, desmatamento, poluição de rios e maus-tratos a animais.',
    examples: ['Queimada', 'Lixo em rio', 'Animais'],
    icon: Leaf,
    tone: 'green',
    featured: false,
  },
] as const;

const STEPS = [
  { icon: FileText, title: 'Conte o que aconteceu', text: 'Poucas perguntas, no seu tempo. Não precisa saber nomes nem ter provas.' },
  { icon: Hash, title: 'Receba seu protocolo', text: 'Um número como LUMI-8F2K1Q é gerado na hora. Ele é a sua chave do caso.' },
  { icon: Search, title: 'Acompanhe cada etapa', text: 'Veja pelo site ou pelo app quando o caso muda de status.' },
];

const COLLECT = [
  'O relato e as respostas do formulário',
  'O local do fato, se você informar',
  'Um e-mail de contato, só se você escolher não ficar anônimo',
];

const NOT_COLLECT = [
  'Nome, CPF ou telefone em denúncia anônima',
  'Sua localização pelo GPS',
  'Contatos, fotos ou arquivos do celular',
  'Nada para anúncio — não vendemos dados',
];

const FAQ = [
  { q: 'Preciso me identificar?', a: 'Não. A denúncia pode ser totalmente anônima, sem cadastro. Se quiser retorno, informe um e-mail na última etapa — é opcional.' },
  { q: 'A pessoa denunciada vai saber que fui eu?', a: 'Na denúncia anônima não guardamos nenhum dado seu. Na identificada, seu contato fica visível só para a equipe que analisa o caso.' },
  { q: 'Não tenho certeza do que vi. Posso denunciar?', a: 'Pode. Conte o que você sabe com suas palavras. A equipe analisa cada relato; você não precisa ter provas.' },
  { q: 'Perdi meu protocolo. E agora?', a: 'Se enviou pelo app, ele fica salvo em "Consultar". Por segurança não há outra forma de recuperar — sem o protocolo, ninguém acessa o caso.' },
  { q: 'A LUMI é um órgão público?', a: 'Não. A LUMI é um canal independente que recebe e organiza denúncias. Em risco imediato, ligue 190.' },
];

const EMERGENCIES = [
  { number: '190', label: 'Polícia' },
  { number: '100', label: 'Direitos Humanos' },
  { number: '181', label: 'Disque-Denúncia' },
];

const PLAY_URL = 'https://play.google.com/store/apps/details?id=br.com.lumi.denuncia';

export default function Home() {
  return (
    <div className={`${styles.page} night`}>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Navbar />

      <main id="conteudo">
        {/* =============================== HERO =============================== */}
        <section className={styles.hero} aria-labelledby="hero-titulo">
          <div className={styles.orbs} aria-hidden="true">
            <span className={styles.orbRed} />
            <span className={styles.orbBlue} />
          </div>

          <div className={`${styles.heroGrid} container`}>
            <div className={styles.heroCopy}>
              <Reveal>
                <p className={styles.tag}>
                  <span className={styles.tagDot} aria-hidden="true" />
                  Independente · sigiloso · gratuito
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h1 id="hero-titulo" className={styles.heroTitle}>
                  Toda violência merece <span className={styles.lightWord}>luz</span>.
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className={styles.heroLead}>
                  Olá, eu sou a Lumi. Aqui você denuncia violência contra crianças, idosos,
                  pessoas com deficiência e o meio ambiente — <strong>sem se expor</strong> — e
                  acompanha cada passo pelo protocolo.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className={styles.heroActions}>
                  <Link href="#denunciar" className={styles.btnPrimary}>
                    Fazer uma denúncia
                    <span className={styles.btnIcon} aria-hidden="true">
                      <ArrowUpRight size={18} strokeWidth={2} />
                    </span>
                  </Link>
                  <Link href="/acompanhar" className={styles.btnGhost}>
                    Consultar protocolo
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={320}>
                <ul className={styles.heroProof}>
                  <li><EyeOff size={17} strokeWidth={1.6} aria-hidden="true" /> Sem cadastro</li>
                  <li><Lock size={17} strokeWidth={1.6} aria-hidden="true" /> Criptografado</li>
                  <li><Hash size={17} strokeWidth={1.6} aria-hidden="true" /> Protocolo na hora</li>
                </ul>
              </Reveal>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.halo} aria-hidden="true" />
              <div className={styles.rings} aria-hidden="true">
                <span /><span /><span />
              </div>
              <Image
                src="/images/lumi-mascote.png"
                alt="Lumi, a mascote, com a mão no peito, segurando um celular com a tela de denúncia"
                width={682}
                height={1024}
                priority
                sizes="(max-width: 960px) 78vw, 480px"
                className={styles.mascot}
              />

              {/* Exemplo ilustrativo do acompanhamento — não é um caso real. */}
              <figure className={`${styles.float} ${styles.floatTicket}`} aria-label="Exemplo de protocolo">
                <div className={styles.ticketInner}>
                  <span className={styles.ticketLabel}>Exemplo de protocolo</span>
                  <strong className={styles.ticketId}>LUMI-8F2K1Q</strong>
                  <ol className={styles.ticketSteps}>
                    <li data-done="true"><Check size={12} strokeWidth={3} aria-hidden="true" /> Recebida</li>
                    <li data-done="true"><Check size={12} strokeWidth={3} aria-hidden="true" /> Em triagem</li>
                    <li data-current="true"><span className={styles.live} aria-hidden="true" /> Em análise</li>
                  </ol>
                </div>
              </figure>

              <div className={`${styles.float} ${styles.floatChip}`} aria-hidden="true">
                <span className={styles.chipIcon}><ShieldCheck size={16} strokeWidth={1.8} /></span>
                100% anônimo se você quiser
              </div>
            </div>
          </div>

          {/* Emergência: logo abaixo da dobra, impossível não ver. */}
          <div className="container">
            <Reveal>
              <aside className={styles.sos} aria-labelledby="sos-titulo">
                <p id="sos-titulo" className={styles.sosText}>
                  <span className={styles.sosPulse} aria-hidden="true" />
                  <strong>Alguém corre perigo agora?</strong> Ligue antes de denunciar.
                </p>
                <ul className={styles.sosList}>
                  {EMERGENCIES.map(({ number, label }) => (
                    <li key={number}>
                      <a href={`tel:${number}`} className={styles.sosCall}>
                        <Phone size={15} strokeWidth={1.8} aria-hidden="true" />
                        <b>{number}</b> {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            </Reveal>
          </div>
        </section>

        {/* ============================ CATEGORIAS ============================ */}
        <section id="denunciar" className={styles.section} aria-labelledby="denunciar-titulo">
          <div className="container">
            <Reveal className={styles.head}>
              <p className={styles.eyebrow}>Fazer denúncia</p>
              <h2 id="denunciar-titulo" className={styles.title}>
                Sobre o que você quer <span className={styles.lightWord}>falar</span>?
              </h2>
              <p className={styles.lead}>
                Escolha a área para começar. Na dúvida, escolha a mais próxima — a equipe
                redireciona se for preciso.
              </p>
            </Reveal>

            <ul className={styles.bento}>
              {CATEGORIES.map(({ id, title, text, examples, icon: Icon, tone, featured }, i) => (
                <Reveal as="li" key={id} delay={i * 90} className={featured ? styles.cellBig : styles.cell}>
                  <Link href={`/denunciar/${id}`} className={styles.shell} data-tone={tone}>
                    <div className={styles.card}>
                      <span className={styles.cardGlow} aria-hidden="true" />
                      <span className={styles.cardIcon} aria-hidden="true">
                        <Icon size={featured ? 34 : 28} strokeWidth={1.6} />
                      </span>
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>{title}</h3>
                        <p className={styles.cardText}>{text}</p>
                        <span className={styles.tags}>
                          {examples.map((e) => (
                            <span key={e}>{e}</span>
                          ))}
                        </span>
                      </div>
                      <span className={styles.cardCta}>
                        Começar denúncia
                        <span className={styles.cardCtaIcon} aria-hidden="true">
                          <ArrowUpRight size={18} strokeWidth={2} />
                        </span>
                      </span>
                      {featured && (
                        <Image
                          src="/images/lumi-mascote.png"
                          alt=""
                          width={682}
                          height={1024}
                          sizes="260px"
                          className={styles.cardArt}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* =========================== COMO FUNCIONA ========================== */}
        <section id="como-funciona" className={styles.section} aria-labelledby="como-titulo">
          <div className="container">
            <Reveal className={styles.head}>
              <p className={styles.eyebrow}>Como funciona</p>
              <h2 id="como-titulo" className={styles.title}>
                Três passos. Nenhum exige que você se identifique.
              </h2>
            </Reveal>

            <ol className={styles.steps}>
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <Reveal as="li" key={title} delay={i * 110} className={styles.step}>
                  <span className={styles.stepNum} aria-hidden="true">0{i + 1}</span>
                  <span className={styles.stepIcon} aria-hidden="true">
                    <Icon size={24} strokeWidth={1.6} />
                  </span>
                  <h3 className={styles.stepTitle}>{title}</h3>
                  <p className={styles.stepText}>{text}</p>
                </Reveal>
              ))}
            </ol>

            <Reveal className={styles.lookupShell}>
              <div className={styles.lookup}>
                <div>
                  <h3 className={styles.lookupTitle}>Já tem um protocolo?</h3>
                  <p className={styles.lookupText}>Digite o número e veja o andamento agora.</p>
                </div>
                <ProtocolLookup />
              </div>
            </Reveal>
          </div>
        </section>

        {/* =============================== SIGILO ============================= */}
        <section id="sigilo" className={styles.section} aria-labelledby="sigilo-titulo">
          <div className={`${styles.privacy} container`}>
            <Reveal className={styles.privacyIntro}>
              <p className={styles.eyebrow}>Sigilo e dados</p>
              <h2 id="sigilo-titulo" className={styles.title}>
                Você decide o que contar. A gente guarda só o necessário.
              </h2>
              <p className={styles.lead}>
                Seguimos a LGPD (Lei 13.709/2018). Toda comunicação é criptografada e só a
                equipe responsável vê as denúncias.
              </p>
              <a href="/privacidade" className={styles.textLink}>
                Ler a política de privacidade <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            </Reveal>

            <div className={styles.privacyCards}>
              <Reveal delay={80} className={styles.listShell}>
                <div className={styles.listCore}>
                  <h3 className={styles.listTitle}>
                    <ShieldCheck size={20} strokeWidth={1.6} aria-hidden="true" /> O que registramos
                  </h3>
                  <ul className={styles.list}>
                    {COLLECT.map((t) => (
                      <li key={t} data-kind="yes">
                        <Check size={14} strokeWidth={3} aria-hidden="true" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={160} className={styles.listShell}>
                <div className={styles.listCore}>
                  <h3 className={styles.listTitle}>
                    <EyeOff size={20} strokeWidth={1.6} aria-hidden="true" /> O que nunca coletamos
                  </h3>
                  <ul className={styles.list}>
                    {NOT_COLLECT.map((t) => (
                      <li key={t} data-kind="no">
                        <X size={14} strokeWidth={3} aria-hidden="true" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================================ APP =============================== */}
        <section id="baixar" className={styles.section} aria-labelledby="baixar-titulo">
          <div className="container">
            <Reveal className={styles.appShell}>
              <div className={styles.app}>
                <div className={styles.appCopy}>
                  <p className={styles.eyebrow}>Aplicativo Android</p>
                  <h2 id="baixar-titulo" className={styles.title}>
                    A Lumi também no seu bolso.
                  </h2>
                  <ul className={styles.appFeatures}>
                    <li><Hash size={18} strokeWidth={1.6} aria-hidden="true" /> Seus protocolos salvos</li>
                    <li><Sparkles size={18} strokeWidth={1.6} aria-hidden="true" /> Aviso quando o caso mudar</li>
                    <li><Fingerprint size={18} strokeWidth={1.6} aria-hidden="true" /> Bloqueio com sua digital</li>
                  </ul>
                  <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" className={styles.play}>
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                      <path fill="currentColor" d="M4.2 2.4 13.6 12l-9.4 9.6c-.3-.2-.5-.6-.5-1V3.4c0-.4.2-.8.5-1Zm10.6 10.8 2.6 2.6-11 6.3 8.4-8.9Zm3.8-3.8 2.8 1.6c.8.5.8 1.5 0 2l-2.8 1.6-2.9-2.6 2.9-2.6ZM6.4 1.9l11 6.3-2.6 2.6-8.4-8.9Z" />
                    </svg>
                    <span>
                      <small>Baixar no</small>
                      Google Play
                    </span>
                  </a>
                </div>
                <div className={styles.phoneStage} aria-hidden="true">
                  <div className={styles.phoneGlow} />
                  <div className={styles.phone}>
                    <Image
                      src="/images/app-home.png"
                      alt=""
                      width={1080}
                      height={1920}
                      sizes="280px"
                      className={styles.phoneScreen}
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================== DÚVIDAS ============================= */}
        <section id="duvidas" className={styles.section} aria-labelledby="duvidas-titulo">
          <div className={`${styles.faqGrid} container`}>
            <Reveal className={styles.head}>
              <p className={styles.eyebrow}>Dúvidas</p>
              <h2 id="duvidas-titulo" className={styles.title}>Perguntas frequentes</h2>
              <p className={styles.lead}>
                Não achou?{' '}
                <a href="mailto:lucasmarques1977@gmail.com" className={styles.inline}>Fale com o suporte</a>.
              </p>
            </Reveal>
            <div className={styles.faq}>
              {FAQ.map(({ q, a }, i) => (
                <Reveal key={q} delay={i * 60}>
                  <details className={styles.faqItem}>
                    <summary>{q}</summary>
                    <p>{a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ CTA FINAL ============================= */}
        <section className={styles.final} aria-labelledby="final-titulo">
          <div className={styles.finalGlow} aria-hidden="true" />
          <Reveal className="container">
            <h2 id="final-titulo" className={styles.finalTitle}>
              Sua coragem pode <span className={styles.lightWord}>mudar uma vida</span>.
            </h2>
            <p className={styles.finalLead}>Leva poucos minutos. Ninguém precisa saber que foi você.</p>
            <Link href="#denunciar" className={styles.btnPrimary}>
              Fazer uma denúncia
              <span className={styles.btnIcon} aria-hidden="true">
                <ArrowUpRight size={18} strokeWidth={2} />
              </span>
            </Link>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
