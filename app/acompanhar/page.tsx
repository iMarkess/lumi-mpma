'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Clock, Copy, MapPin, Search, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api, apiEnabled, type ApiComplaint, type Status } from '@/lib/api';
import { useAppContext } from '@/context/AppContext';
import styles from './Acompanhar.module.css';

const CATEGORY_LABEL: Record<string, string> = {
  child: 'Criança e adolescente',
  elderly: 'Idosos e pessoas com deficiência',
  env: 'Meio ambiente',
};

const STATUS_LABEL: Record<Status, string> = {
  recebida: 'Recebida',
  em_triagem: 'Em triagem',
  em_analise: 'Em análise',
  concluida: 'Concluída',
  rejeitada: 'Encerrada sem andamento',
};

const STATUS_HINT: Record<Status, string> = {
  recebida: 'A denúncia chegou e está na fila para a primeira leitura.',
  em_triagem: 'A equipe está conferindo as informações e a área responsável.',
  em_analise: 'O caso está sendo analisado e encaminhado.',
  concluida: 'A análise foi concluída.',
  rejeitada: 'A equipe encerrou o caso. Veja a observação abaixo, se houver.',
};

const FLOW: Status[] = ['recebida', 'em_triagem', 'em_analise', 'concluida'];

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'notFound'; protocol: string }
  | { kind: 'error' }
  | { kind: 'found'; c: ApiComplaint };

export default function AcompanharPage() {
  const { trackComplaint } = useAppContext();
  const [protocol, setProtocol] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [copied, setCopied] = useState(false);

  const search = useCallback(
    async (raw: string) => {
      const q = raw.trim().toUpperCase();
      if (!q) return;
      setProtocol(q);
      setState({ kind: 'loading' });
      try {
        if (apiEnabled) {
          setState({ kind: 'found', c: await api.trackComplaint(q) });
          return;
        }
        // Modo local (build sem API): só o essencial do contexto.
        const local = await trackComplaint(q);
        if (!local) throw Object.assign(new Error('404'), { status: 404 });
        setState({
          kind: 'found',
          c: {
            id: local.id,
            category: local.category,
            title: local.title,
            location: local.location,
            description: local.description,
            status: (local.status === 'concluída' ? 'concluida' : local.status) as Status,
            priority: local.priority,
            anonymous: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      } catch (e) {
        const status = (e as { status?: number }).status;
        const notFound = status === 404 || /404|não encontrado/i.test(String((e as Error).message));
        setState(notFound ? { kind: 'notFound', protocol: q } : { kind: 'error' });
      }
    },
    [trackComplaint],
  );

  // /acompanhar?p=LUMI-XXXXXX (vindo da home ou do app) já abre consultado.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('p');
    if (p) search(p);
  }, [search]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = protocol.trim().toUpperCase();
    if (!q) return;
    window.history.replaceState(null, '', `/acompanhar?p=${encodeURIComponent(q)}`);
    search(q);
  };

  return (
    <div className={`${styles.page} day`}>
      <Navbar />
      <main id="conteudo" className={styles.main}>
        <div className={`${styles.content} container`}>
          <header className={styles.head}>
            <p className={styles.eyebrow}>Consultar protocolo</p>
            <h1 className={styles.title}>Acompanhe sua denúncia</h1>
            <p className={styles.lead}>
              Digite o número recebido no envio. Só quem tem o protocolo consegue ver o caso.
            </p>
          </header>

          <form className={styles.search} onSubmit={onSubmit}>
            <Search size={20} aria-hidden="true" className={styles.searchIcon} />
            <label htmlFor="protocolo" className="sr-only">
              Número do protocolo
            </label>
            <input
              id="protocolo"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              placeholder="LUMI-XXXXXX"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className={styles.input}
            />
            <button type="submit" className={styles.button} disabled={state.kind === 'loading'}>
              {state.kind === 'loading' ? <span className={styles.spinner} aria-hidden="true" /> : 'Consultar'}
            </button>
          </form>

          <div aria-live="polite">
            {state.kind === 'notFound' && (
              <div className={styles.notice}>
                <h2>Protocolo não encontrado</h2>
                <p>
                  Confira se digitou <strong>{state.protocol}</strong> exatamente como recebeu,
                  incluindo o “LUMI-”.
                </p>
              </div>
            )}

            {state.kind === 'error' && (
              <div className={styles.notice}>
                <h2>Não foi possível consultar agora</h2>
                <p>Verifique sua conexão e tente de novo em alguns instantes.</p>
              </div>
            )}

            {state.kind === 'found' && (
              <Result
                c={state.c}
                copied={copied}
                onCopy={() => {
                  navigator.clipboard?.writeText(state.c.id);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              />
            )}

            {state.kind === 'idle' && (
              <p className={styles.hint}>
                Ainda não denunciou?{' '}
                <Link href="/#denunciar" className={styles.hintLink}>
                  Fazer uma denúncia <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Result({ c, copied, onCopy }: { c: ApiComplaint; copied: boolean; onCopy: () => void }) {
  const rejected = c.status === 'rejeitada';
  const steps: Status[] = rejected ? ['recebida', 'em_triagem', 'em_analise', 'rejeitada'] : FLOW;
  const current = steps.indexOf(c.status);
  // Último registro de cada status: data e observação da equipe.
  const byStatus = new Map((c.events ?? []).map((e) => [e.toStatus, e]));

  return (
    <article className={styles.result}>
      <header className={styles.resultHead}>
        <div>
          <p className={styles.resultLabel}>Protocolo</p>
          <div className={styles.resultIdRow}>
            <h2 className={styles.resultId}>{c.id}</h2>
            <button type="button" onClick={onCopy} className={styles.copy} aria-label="Copiar protocolo">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
        <span className={styles.status} data-status={c.status}>
          {STATUS_LABEL[c.status]}
        </span>
      </header>

      <p className={styles.statusHint}>{STATUS_HINT[c.status]}</p>

      <dl className={styles.meta}>
        <div>
          <dt>Área</dt>
          <dd>{CATEGORY_LABEL[c.category] ?? c.category}</dd>
        </div>
        <div>
          <dt>
            <Clock size={14} aria-hidden="true" /> Enviada em
          </dt>
          <dd>{fmt(c.createdAt)}</dd>
        </div>
        <div>
          <dt>
            <MapPin size={14} aria-hidden="true" /> Local
          </dt>
          <dd>{c.location || 'Não informado'}</dd>
        </div>
      </dl>

      <h3 className={styles.timelineTitle}>Andamento</h3>
      <ol className={styles.timeline}>
        {steps.map((s, i) => {
          const done = i <= current;
          const ev = byStatus.get(s);
          return (
            <li key={s} className={styles.step} data-done={done} data-current={i === current} data-line={i < current}>
              <span className={styles.dot} aria-hidden="true">
                {done && (s === 'rejeitada' ? <X size={14} /> : <Check size={14} />)}
              </span>
              <div>
                <p className={styles.stepName}>{STATUS_LABEL[s]}</p>
                {ev && <p className={styles.stepDate}>{fmt(ev.createdAt)}</p>}
                {ev?.note && <p className={styles.stepNote}>{ev.note}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}
