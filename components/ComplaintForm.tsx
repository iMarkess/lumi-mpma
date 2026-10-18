'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronLeft,
  Copy,
  Lock,
  Mic,
  MicOff,
  Send,
  Volume2,
} from 'lucide-react';
import { api, apiEnabled } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import styles from './ComplaintForm.module.css';

/* Tipagem mínima da Web Speech API (ditado por voz) — não vem no lib.dom. */
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
}
type RecognitionCtor = new () => Recognition;

declare global {
  interface Window {
    webkitSpeechRecognition?: RecognitionCtor;
    SpeechRecognition?: RecognitionCtor;
  }
}

export interface Step {
  title: string;
  question: string;
  help?: string;
  type: 'text' | 'textarea' | 'radio' | 'emoji';
  options?: string[];
  field: string;
  optional?: boolean;
}

interface Props {
  type: 'child' | 'elderly' | 'env';
  categoryName: string;
  steps: Step[];
}

const EMOJIS = [
  ['😢', 'Triste'],
  ['😨', 'Com medo'],
  ['😡', 'Com raiva'],
  ['😔', 'Preocupado'],
  ['😕', 'Confuso'],
  ['😐', 'Neutro'],
  ['💪', 'Decidido'],
  ['🤫', 'Prefiro não dizer'],
] as const;

/* Rótulos das respostas extras no texto que a equipe recebe. */
const ANSWER_LABELS: Record<string, string> = {
  victim_name: 'Pessoa envolvida',
  victim_age: 'Idade aproximada',
  victim_type: 'Perfil da pessoa',
  is_urgent: 'Em risco agora',
  emotions: 'Como o denunciante se sente',
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MIN_DESCRIPTION = 10; // mesma regra do servidor

/* Protocolos enviados deste navegador (mesma ideia do app). */
const STORAGE_KEY = 'lumi_protocols';
function rememberProtocol(p: string) {
  try {
    const list: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([p, ...list.filter((x) => x !== p)].slice(0, 20)));
  } catch {
    /* modo privado: tudo bem não guardar */
  }
}

export default function ComplaintForm({ type, categoryName, steps }: Props) {
  const { addComplaint } = useAppContext();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [anonymous, setAnonymous] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [protocol, setProtocol] = useState('');
  const [copied, setCopied] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Última etapa de todas as áreas: anônimo ou com contato.
  const total = steps.length + 1;
  const isIdentify = index === steps.length;
  const step = steps[index];
  const value = step ? (answers[step.field] ?? '') : '';

  useEffect(() => () => recognitionRef.current?.stop(), []);

  // Leitor de tela: foca a nova pergunta a cada troca de etapa (não ao abrir).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [index]);

  const set = (field: string, v: string) => {
    setError('');
    setAnswers((a) => ({ ...a, [field]: v }));
  };

  const validate = (): string => {
    if (isIdentify) {
      return anonymous || EMAIL_RE.test(email.trim())
        ? ''
        : 'Informe um e-mail válido ou escolha ficar anônimo.';
    }
    const v = value.trim();
    if (step.type === 'textarea' && v.length < MIN_DESCRIPTION) {
      return `Conte um pouco mais (pelo menos ${MIN_DESCRIPTION} letras).`;
    }
    if (!step.optional && !v) {
      return step.type === 'text' ? 'Preencha para continuar.' : 'Escolha uma opção para continuar.';
    }
    return '';
  };

  const next = () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    if (isIdentify) {
      submit();
    } else {
      setIndex((i) => i + 1);
    }
  };

  const back = () => {
    setError('');
    setIndex((i) => Math.max(0, i - 1));
  };

  const composeDescription = () => {
    const extra = Object.entries(ANSWER_LABELS)
      .filter(([k]) => (answers[k] ?? '').trim())
      .map(([k, label]) => `${label}: ${answers[k].trim()}`);
    const text = [
      (answers.description ?? '').trim(),
      extra.length ? `\nInformações do formulário:\n${extra.join('\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    return text.slice(0, 4000);
  };

  const submit = async () => {
    setSending(true);
    setError('');
    const victim = (answers.victim_name ?? '').trim();
    const title = (victim ? `Denúncia: ${victim}` : `Denúncia: ${categoryName}`).slice(0, 150);
    const priority = answers.is_urgent === 'Sim' ? 'alta' : 'media';
    try {
      let p: string;
      if (apiEnabled) {
        const res = await api.submitComplaint({
          category: type,
          title,
          description: composeDescription(),
          location: (answers.location ?? '').trim(),
          priority,
          anonymous,
          contactEmail: anonymous ? null : email.trim(),
        });
        p = res.protocol;
      } else {
        p = await addComplaint({
          category: type,
          title,
          description: composeDescription(),
          location: answers.location || 'Não informado',
          priority,
        });
      }
      rememberProtocol(p);
      setProtocol(p);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(
        (e as Error).message && !/^Erro \d+$/.test((e as Error).message)
          ? (e as Error).message
          : 'Não foi possível enviar. Verifique sua conexão e tente de novo. Suas respostas continuam aqui.',
      );
    } finally {
      setSending(false);
    }
  };

  const toggleDictation = (field: string) => {
    if (recording) {
      recognitionRef.current?.stop();
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError('Seu navegador não permite ditar por voz. Digite o texto, por favor.');
      return;
    }
    const r = new SR();
    r.lang = 'pt-BR';
    r.continuous = false;
    r.interimResults = false;
    r.onstart = () => setRecording(true);
    r.onresult = (ev) => {
      const t = ev.results[0][0].transcript;
      setAnswers((a) => ({ ...a, [field]: a[field] ? `${a[field]} ${t}` : t }));
    };
    r.onend = () => {
      setRecording(false);
      recognitionRef.current = null;
    };
    r.onerror = () => setRecording(false);
    recognitionRef.current = r;
    r.start();
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-BR';
    window.speechSynthesis.speak(u);
  };

  /* ===================== SUCESSO ===================== */
  if (protocol) {
    return (
      <section className={styles.card} aria-labelledby="sucesso-titulo">
        <div className={styles.successIcon} aria-hidden="true">
          <Check size={34} strokeWidth={2.6} />
        </div>
        <h2 id="sucesso-titulo" className={styles.successTitle}>
          Denúncia registrada
        </h2>
        <p className={styles.successText}>
          Obrigado por agir. Guarde o número abaixo: é com ele que você acompanha o caso.
          {anonymous && ' Como a denúncia é anônima, não há outra forma de recuperá-lo.'}
        </p>

        <div className={styles.protocol}>
          <span className={styles.protocolLabel}>Seu protocolo</span>
          <strong className={styles.protocolValue}>{protocol}</strong>
          <button
            type="button"
            className={styles.copy}
            onClick={() => {
              navigator.clipboard?.writeText(protocol);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>

        <div className={styles.successActions}>
          <Link href={`/acompanhar?p=${encodeURIComponent(protocol)}`} className={styles.primary}>
            Acompanhar agora <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/" className={styles.secondary}>
            Voltar ao início
          </Link>
        </div>
      </section>
    );
  }

  /* ===================== ETAPAS ===================== */
  const progress = Math.round(((index + 1) / total) * 100);
  const title = isIdentify ? 'Identificação' : step.title;
  const question = isIdentify ? 'Quer receber retorno ou prefere ficar anônimo?' : step.question;

  return (
    <section className={styles.card} aria-label={`Etapa ${index + 1} de ${total}`}>
      <div className={styles.progressInfo}>
        <span>
          Etapa {index + 1} de {total}
        </span>
        <span>{progress}%</span>
      </div>
      <div
        className={styles.progress}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label="Progresso da denúncia"
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <div key={index} className={styles.stepBody}>
        <p className={styles.stepTitle}>{title}</p>
        <div className={styles.questionRow}>
          <h2 ref={headingRef} tabIndex={-1} className={styles.question}>
            {question}
          </h2>
          <button type="button" className={styles.listen} onClick={() => speak(question)} aria-label="Ouvir a pergunta">
            <Volume2 size={18} aria-hidden="true" />
            Ouvir
          </button>
        </div>
        {!isIdentify && step.help && <p className={styles.help}>{step.help}</p>}

        <div className={styles.field}>
          {!isIdentify && (step.type === 'text' || step.type === 'textarea') && (
            <div className={styles.inputWrap}>
              {step.type === 'text' ? (
                <input
                  className={styles.input}
                  value={value}
                  onChange={(e) => set(step.field, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && next()}
                  placeholder={step.optional ? 'Opcional' : 'Digite aqui'}
                  aria-label={question}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'form-erro' : undefined}
                />
              ) : (
                <textarea
                  className={styles.textarea}
                  value={value}
                  onChange={(e) => set(step.field, e.target.value)}
                  placeholder="Escreva aqui com suas palavras"
                  maxLength={3500}
                  aria-label={question}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'form-erro' : undefined}
                />
              )}
              <button
                type="button"
                className={`${styles.mic} ${recording ? styles.micOn : ''}`}
                onClick={() => toggleDictation(step.field)}
                aria-label={recording ? 'Parar de ditar' : 'Ditar por voz'}
                aria-pressed={recording}
              >
                {recording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              {step.type === 'textarea' && (
                <span className={styles.counter}>{value.length}/3500</span>
              )}
            </div>
          )}

          {!isIdentify && step.type === 'radio' && (
            <div className={styles.options} role="radiogroup" aria-label={question}>
              {step.options?.map((o) => (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={value === o}
                  className={styles.option}
                  onClick={() => set(step.field, o)}
                >
                  <span className={styles.radio} aria-hidden="true" />
                  {o}
                </button>
              ))}
            </div>
          )}

          {!isIdentify && step.type === 'emoji' && (
            <div className={styles.emojis} role="radiogroup" aria-label={question}>
              {EMOJIS.map(([e, label]) => (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={value === label}
                  className={styles.emoji}
                  onClick={() => set(step.field, label)}
                >
                  <span aria-hidden="true">{e}</span>
                  {label}
                </button>
              ))}
            </div>
          )}

          {isIdentify && (
            <div className={styles.identify}>
              <button
                type="button"
                role="switch"
                aria-checked={anonymous}
                className={styles.toggle}
                onClick={() => {
                  setError('');
                  setAnonymous((a) => !a);
                }}
              >
                <span className={styles.toggleTrack} aria-hidden="true">
                  <span className={styles.toggleThumb} />
                </span>
                <span>
                  <strong>Denúncia anônima</strong>
                  <small>Nenhum dado seu é enviado junto com o relato.</small>
                </span>
              </button>
              {!anonymous && (
                <label className={styles.emailLabel}>
                  E-mail para contato
                  <input
                    type="email"
                    autoComplete="email"
                    className={styles.input}
                    value={email}
                    onChange={(e) => {
                      setError('');
                      setEmail(e.target.value);
                    }}
                    placeholder="voce@exemplo.com"
                    aria-invalid={!!error}
                  />
                  <small>Usado só pela equipe para falar sobre esta denúncia.</small>
                </label>
              )}
            </div>
          )}
        </div>

        {error && (
          <p id="form-erro" className={styles.error} role="alert">
            <AlertCircle size={16} aria-hidden="true" /> {error}
          </p>
        )}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.back} onClick={back} disabled={index === 0 || sending}>
          <ChevronLeft size={18} aria-hidden="true" /> Voltar
        </button>
        <button type="button" className={styles.next} onClick={next} disabled={sending}>
          {sending ? (
            <span className={styles.spinner} aria-label="Enviando" />
          ) : isIdentify ? (
            <>
              Enviar denúncia <Send size={18} aria-hidden="true" />
            </>
          ) : (
            <>
              Próximo <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      <p className={styles.note}>
        <Lock size={14} aria-hidden="true" /> Conexão criptografada. Em perigo agora? Ligue{' '}
        <a href="tel:190">190</a>.
      </p>
    </section>
  );
}
