import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Baby,
  Check,
  EyeOff,
  FileText,
  Hash,
  HeartHandshake,
  Leaf,
  Lock,
  Phone,
  Search,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProtocolLookup from '@/components/ProtocolLookup';
import styles from './page.module.css';

const CATEGORIES = [
  {
    id: 'child',
    title: 'Criança e adolescente',
    text: 'Violência física, sexual ou psicológica, negligência, trabalho infantil e exploração.',
    examples: ['Agressão', 'Abuso', 'Negligência', 'Trabalho infantil'],
    icon: Baby,
    tone: 'blue',
  },
  {
    id: 'elderly',
    title: 'Idosos e pessoas com deficiência',
    text: 'Maus-tratos, abandono, cárcere e violência financeira contra pessoas vulneráveis.',
    examples: ['Abandono', 'Maus-tratos', 'Golpe financeiro'],
    icon: HeartHandshake,
    tone: 'coral',
  },
  {
    id: 'env',
    title: 'Meio ambiente',
    text: 'Queimadas, desmatamento, poluição de rios e maus-tratos a animais.',
    examples: ['Queimada', 'Lixo em rio', 'Animais'],
    icon: Leaf,
    tone: 'green',
  },
] as const;

const STEPS = [
  {
    icon: FileText,
    title: 'Conte o que aconteceu',
    text: 'Responda poucas perguntas, no seu tempo. Não precisa saber nomes nem ter provas.',
  },
  {
    icon: Hash,
    title: 'Receba o protocolo',
    text: 'Um número como LUMI-8F2K1Q é gerado na hora. Ele é a sua chave de acesso ao caso.',
  },
  {
    icon: Search,
    title: 'Acompanhe o andamento',
    text: 'Consulte quando quiser pelo site ou pelo app e veja cada mudança de status.',
  },
];

const COLLECT = [
  'O relato e as respostas do formulário',
  'Local do fato, se você informar',
  'E-mail de contato, só se você escolher não ficar anônimo',
];

const NOT_COLLECT = [
  'Nome, CPF ou telefone em denúncia anônima',
  'Sua localização pelo GPS',
  'Contatos, fotos ou arquivos do aparelho',
  'Dados para anúncio — não vendemos nem compartilhamos dados',
];

const FAQ = [
  {
    q: 'Preciso me identificar?',
    a: 'Não. A denúncia pode ser totalmente anônima, sem cadastro. Se quiser receber retorno, você pode informar um e-mail na última etapa — é opcional.',
  },
  {
    q: 'A pessoa denunciada vai saber que fui eu?',
    a: 'Na denúncia anônima, não guardamos nenhum dado seu. Na identificada, seu contato fica visível só para a equipe que analisa o caso.',
  },
  {
    q: 'Não tenho certeza do que vi. Posso denunciar mesmo assim?',
    a: 'Pode. Conte o que você sabe com suas palavras. A equipe analisa cada relato; você não precisa ter provas nem saber todos os detalhes.',
  },
  {
    q: 'Perdi meu protocolo. E agora?',
    a: 'Se você enviou pelo app, ele fica salvo em "Consultar". Por segurança, não é possível recuperar o protocolo por outro meio — sem ele, ninguém acessa o caso.',
  },
  {
    q: 'A LUMI é um órgão público?',
    a: 'Não. A LUMI é um canal independente que recebe e organiza denúncias. Em situação de risco imediato, ligue 190.',
  },
];

const EMERGENCIES = [
  { number: '190', label: 'Polícia Militar' },
  { number: '100', label: 'Direitos Humanos' },
  { number: '181', label: 'Disque-Denúncia' },
];

const PLAY_URL = 'https://play.google.com/store/apps/details?id=br.com.lumi.denuncia';

export default function Home() {
  return (
    <div className={styles.page}>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>

      <Navbar />

      <main id="conteudo">
        {/* ===================== HERO ===================== */}
        <section className={styles.hero} aria-labelledby="hero-titulo">
          <div className={`${styles.heroGrid} container`}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>
                <span className={styles.kickerDot} aria-hidden="true" />
                Sigiloso · anônimo se você quiser · gratuito
              </p>
              <h1 id="hero-titulo" className={styles.heroTitle}>
                Viu uma violência?
                <span className={styles.heroTitleAccent}> Você pode agir sem se expor.</span>
              </h1>
              <p className={styles.heroLead}>
                Registre em poucos minutos situações contra crianças, idosos, pessoas
                com deficiência ou o meio ambiente. Você recebe um protocolo e acompanha
                cada etapa.
              </p>

              <div className={styles.heroActions}>
                <Link href="#denunciar" className={styles.btnPrimary}>
                  Fazer uma denúncia
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/acompanhar" className={styles.btnGhost}>
                  Consultar protocolo
                </Link>
              </div>

              <ul className={styles.heroProof}>
                <li>
                  <EyeOff size={18} aria-hidden="true" />
                  Sem cadastro
                </li>
                <li>
                  <Lock size={18} aria-hidden="true" />
                  Conexão criptografada
                </li>
                <li>
                  <Hash size={18} aria-hidden="true" />
                  Protocolo na hora
                </li>
              </ul>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.heroFrame}>
                <Image
                  src="/images/lumi-mascote.png"
                  alt="Lumi, a mascote do canal, segurando um celular com a tela de denúncia"
                  width={682}
                  height={1024}
                  priority
                  sizes="(max-width: 900px) 70vw, 420px"
                  className={styles.heroMascot}
                />
              </div>

              {/* Ilustra o produto — é um exemplo, não um caso real. */}
              <figure className={styles.ticket} aria-label="Exemplo de acompanhamento de protocolo">
                <div className={styles.ticketHead}>
                  <span className={styles.ticketLabel}>Exemplo</span>
                  <span className={styles.ticketId}>LUMI-8F2K1Q</span>
                </div>
                <ol className={styles.ticketSteps}>
                  <li className={styles.done}>
                    <Check size={14} aria-hidden="true" /> Recebida
                  </li>
                  <li className={styles.done}>
                    <Check size={14} aria-hidden="true" /> Em triagem
                  </li>
                  <li className={styles.current}>
                    <span className={styles.pulse} aria-hidden="true" /> Em análise
                  </li>
                </ol>
              </figure>
            </div>
          </div>
        </section>

        {/* ===================== EMERGÊNCIA ===================== */}
        <aside className={styles.emergency} aria-labelledby="emergencia-titulo">
          <div className={`${styles.emergencyInner} container`}>
            <p id="emergencia-titulo" className={styles.emergencyText}>
              <strong>Alguém corre perigo agora?</strong> Ligue antes de denunciar.
            </p>
            <ul className={styles.emergencyList}>
              {EMERGENCIES.map(({ number, label }) => (
                <li key={number}>
                  <a href={`tel:${number}`} className={styles.emergencyCall}>
                    <Phone size={16} aria-hidden="true" />
                    <span className={styles.emergencyNumber}>{number}</span>
                    <span className={styles.emergencyLabel}>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ===================== CATEGORIAS ===================== */}
        <section id="denunciar" className={styles.section} aria-labelledby="denunciar-titulo">
          <div className="container">
            <header className={styles.sectionHead}>
              <p className={styles.eyebrow}>Fazer denúncia</p>
              <h2 id="denunciar-titulo" className={styles.sectionTitle}>
                Sobre o que você quer denunciar?
              </h2>
              <p className={styles.sectionLead}>
                Escolha a área para começar. Na dúvida, escolha a mais próxima — a
                equipe redireciona se for preciso.
              </p>
            </header>

            <ul className={styles.categories}>
              {CATEGORIES.map(({ id, title, text, examples, icon: Icon, tone }) => (
                <li key={id}>
                  <Link href={`/denunciar/${id}`} className={styles.category} data-tone={tone}>
                    <span className={styles.categoryIcon} aria-hidden="true">
                      <Icon size={26} strokeWidth={1.9} />
                    </span>
                    <h3 className={styles.categoryTitle}>{title}</h3>
                    <p className={styles.categoryText}>{text}</p>
                    <ul className={styles.tags} aria-label="Exemplos">
                      {examples.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                    <span className={styles.categoryAction}>
                      Começar
                      <ArrowRight size={18} aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===================== COMO FUNCIONA ===================== */}
        <section id="como-funciona" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="como-titulo">
          <div className="container">
            <header className={styles.sectionHead}>
              <p className={styles.eyebrow}>Como funciona</p>
              <h2 id="como-titulo" className={styles.sectionTitle}>
                Três passos. Nenhum exige que você se identifique.
              </h2>
            </header>

            <ol className={styles.steps}>
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className={styles.step}>
                  <span className={styles.stepNumber} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.stepIcon} aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <h3 className={styles.stepTitle}>{title}</h3>
                  <p className={styles.stepText}>{text}</p>
                </li>
              ))}
            </ol>

            <div className={styles.lookup}>
              <div>
                <h3 className={styles.lookupTitle}>Já tem um protocolo?</h3>
                <p className={styles.lookupText}>Digite o número para ver o andamento.</p>
              </div>
              <ProtocolLookup />
            </div>
          </div>
        </section>

        {/* ===================== SIGILO ===================== */}
        <section id="sigilo" className={styles.privacy} aria-labelledby="sigilo-titulo">
          <div className={`${styles.privacyGrid} container`}>
            <div className={styles.privacyIntro}>
              <p className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Sigilo e dados</p>
              <h2 id="sigilo-titulo" className={styles.privacyTitle}>
                Você decide o que contar. A gente guarda só o necessário.
              </h2>
              <p className={styles.privacyLead}>
                Tratamos os dados conforme a LGPD (Lei 13.709/2018). Toda comunicação é
                criptografada e só a equipe responsável acessa as denúncias.
              </p>
              <a href="/privacidade" className={styles.privacyLink}>
                Ler a política de privacidade
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>

            <div className={styles.privacyCards}>
              <div className={styles.privacyCard}>
                <h3 className={styles.privacyCardTitle}>
                  <ShieldCheck size={18} aria-hidden="true" /> O que registramos
                </h3>
                <ul className={styles.checkList}>
                  {COLLECT.map((t) => (
                    <li key={t}>
                      <Check size={16} aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.privacyCard}>
                <h3 className={styles.privacyCardTitle}>
                  <EyeOff size={18} aria-hidden="true" /> O que não coletamos
                </h3>
                <ul className={`${styles.checkList} ${styles.crossList}`}>
                  {NOT_COLLECT.map((t) => (
                    <li key={t}>
                      <X size={16} aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== APP ===================== */}
        <section id="baixar" className={styles.section} aria-labelledby="baixar-titulo">
          <div className="container">
            <div className={styles.app}>
              <div className={styles.appCopy}>
                <p className={styles.eyebrow}>Aplicativo Android</p>
                <h2 id="baixar-titulo" className={styles.sectionTitle}>
                  A LUMI também no seu celular
                </h2>
                <p className={styles.sectionLead}>
                  Guarde seus protocolos, receba aviso quando o caso mudar de status e
                  proteja o app com sua digital.
                </p>
                <a href={PLAY_URL} target="_blank" rel="noopener noreferrer" className={styles.playBadge}>
                  <Smartphone size={22} aria-hidden="true" />
                  <span>
                    <small>Baixar no</small>
                    Google Play
                  </span>
                </a>
              </div>
              <div className={styles.phone}>
                <Image
                  src="/images/app-home.png"
                  alt="Tela inicial do aplicativo LUMI com as três áreas de denúncia"
                  width={1080}
                  height={1920}
                  sizes="(max-width: 900px) 60vw, 300px"
                  className={styles.phoneScreen}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================== DÚVIDAS ===================== */}
        <section id="duvidas" className={`${styles.section} ${styles.sectionAlt}`} aria-labelledby="duvidas-titulo">
          <div className={`${styles.faqGrid} container`}>
            <header className={styles.sectionHead}>
              <p className={styles.eyebrow}>Dúvidas</p>
              <h2 id="duvidas-titulo" className={styles.sectionTitle}>
                Perguntas frequentes
              </h2>
              <p className={styles.sectionLead}>
                Não achou sua resposta? Escreva para{' '}
                <a href="mailto:lucasmarques1977@gmail.com" className={styles.inlineLink}>
                  o suporte
                </a>
                .
              </p>
            </header>
            <div className={styles.faq}>
              {FAQ.map(({ q, a }) => (
                <details key={q} className={styles.faqItem}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
