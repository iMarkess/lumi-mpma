'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Copy, Download, Mail, MapPin, RefreshCw, Search, User } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { CatIcon, PriorityBadge, StatusBadge, useAdminData } from '@/components/admin/ui';
import {
  adminApi,
  CATEGORY_LABEL,
  displayTitle,
  fmtDate,
  PRIORITY_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
  timeAgo,
  type AdminComplaint,
  type Category,
  type Priority,
  type Status,
} from '@/lib/adminApi';
import s from '../admin.module.css';
import t from './Triage.module.css';

type Tab = 'abertas' | Status | 'todas';
const TABS: { id: Tab; label: string }[] = [
  { id: 'abertas', label: 'Em aberto' },
  { id: 'recebida', label: 'Recebidas' },
  { id: 'em_triagem', label: 'Em triagem' },
  { id: 'em_analise', label: 'Em análise' },
  { id: 'concluida', label: 'Concluídas' },
  { id: 'rejeitada', label: 'Encerradas' },
  { id: 'todas', label: 'Todas' },
];

const PRIORITY_RANK: Record<Priority, number> = { alta: 0, media: 1, baixa: 2 };

function csvCell(v: string) {
  return `"${v.replace(/"/g, '""')}"`;
}

function exportCsv(rows: AdminComplaint[]) {
  const head = ['Protocolo', 'Área', 'Título', 'Local', 'Status', 'Prioridade', 'Anônima', 'Contato', 'Recebida em'];
  const body = rows.map((c) =>
    [c.id, CATEGORY_LABEL[c.category], c.title, c.location, STATUS_LABEL[c.status], PRIORITY_LABEL[c.priority],
      c.anonymous ? 'Sim' : 'Não', c.contactEmail ?? '', new Date(c.createdAt).toLocaleString('pt-BR')]
      .map((v) => csvCell(String(v))).join(';'),
  );
  // BOM: o Excel em português só reconhece os acentos com ele.
  const blob = new Blob(['﻿' + [head.join(';'), ...body].join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `denuncias-lumi-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function TriageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: list, error, loading, reload } = useAdminData((tk) => adminApi.list(tk));

  const [tab, setTab] = useState<Tab>((params.get('status') as Tab) || 'abertas');
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [category, setCategory] = useState<Category | ''>('');
  const [priority, setPriority] = useState<Priority | ''>((params.get('prioridade') as Priority) || '');
  const [sort, setSort] = useState<'recentes' | 'antigas' | 'prioridade'>('recentes');
  const selectedId = params.get('id');

  // A busca do topo e os atalhos do painel chegam pela URL: ajusta os
  // filtros quando a URL muda (padrão do React para "estado derivado").
  const [seenParams, setSeenParams] = useState(params.toString());
  if (params.toString() !== seenParams) {
    const before = new URLSearchParams(seenParams);
    setSeenParams(params.toString());
    if (params.get('q') !== before.get('q')) setQuery(params.get('q') ?? '');
    if (params.get('status') && params.get('status') !== before.get('status')) setTab(params.get('status') as Tab);
    if (params.get('prioridade') && params.get('prioridade') !== before.get('prioridade')) setPriority(params.get('prioridade') as Priority);
  }

  const select = (id: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set('id', id);
    else next.delete('id');
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { abertas: 0, todas: list?.length ?? 0 };
    for (const x of list ?? []) {
      c[x.status] = (c[x.status] ?? 0) + 1;
      if (x.status !== 'concluida' && x.status !== 'rejeitada') c.abertas++;
    }
    return c;
  }, [list]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const r = (list ?? []).filter((c) => {
      if (tab === 'abertas' && (c.status === 'concluida' || c.status === 'rejeitada')) return false;
      if (tab !== 'abertas' && tab !== 'todas' && c.status !== tab) return false;
      if (category && c.category !== category) return false;
      if (priority && c.priority !== priority) return false;
      if (q && ![c.id, c.title, c.location, c.description].some((v) => v.toLowerCase().includes(q))) return false;
      return true;
    });
    r.sort((a, b) =>
      sort === 'antigas' ? a.createdAt.localeCompare(b.createdAt)
        : sort === 'prioridade' ? PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.createdAt.localeCompare(a.createdAt)
          : b.createdAt.localeCompare(a.createdAt));
    return r;
  }, [list, tab, query, category, priority, sort]);

  return (
    <div className={`${s.page} ${t.page}`}>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>Denúncias</h1>
          <p className={s.subtitle}>{counts.abertas} em aberto · {counts.todas} no total</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className={s.btn} onClick={reload} disabled={loading}>
            <RefreshCw size={16} aria-hidden="true" /> Atualizar
          </button>
          <button type="button" className={s.btn} onClick={() => exportCsv(rows)} disabled={!rows.length}>
            <Download size={16} aria-hidden="true" /> Exportar CSV
          </button>
        </div>
      </div>

      {error && <p className={s.error}>{error}</p>}

      <div className={t.tabs} role="tablist" aria-label="Status">
        {TABS.map(({ id, label }) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={t.tab} onClick={() => setTab(id)}>
            {label}
            <span className={t.tabCount}>{counts[id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className={t.filters}>
        <label className={t.searchBox}>
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Buscar</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Protocolo, título, local ou texto do relato" />
        </label>
        <select className={s.select} value={category} onChange={(e) => setCategory(e.target.value as Category | '')} aria-label="Área">
          <option value="">Todas as áreas</option>
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </select>
        <select className={s.select} value={priority} onChange={(e) => setPriority(e.target.value as Priority | '')} aria-label="Prioridade">
          <option value="">Qualquer prioridade</option>
          <option value="alta">Prioridade alta</option>
          <option value="media">Prioridade média</option>
          <option value="baixa">Prioridade baixa</option>
        </select>
        <select className={s.select} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Ordenar">
          <option value="recentes">Mais recentes</option>
          <option value="antigas">Mais antigas</option>
          <option value="prioridade">Prioridade</option>
        </select>
      </div>

      <div className={`${t.layout} ${selectedId ? t.hasDetail : ''}`}>
        <section className={`${s.card} ${t.listCard}`} aria-label="Lista de denúncias">
          {loading && !list ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {[0, 1, 2, 3, 4].map((i) => <span key={i} className={s.skeleton} style={{ height: 64 }} />)}
            </div>
          ) : rows.length === 0 ? (
            <div className={s.empty}>
              <strong>Nada por aqui</strong>
              Nenhuma denúncia com esses filtros.
            </div>
          ) : (
            <ul className={t.list}>
              {rows.map((c) => (
                <li key={c.id}>
                  <button type="button" className={t.item} aria-current={c.id === selectedId} onClick={() => select(c.id)}>
                    <CatIcon cat={c.category} size={18} />
                    <span className={t.itemBody}>
                      <span className={t.itemTop}>
                        <span className={t.itemId}>{c.id}</span>
                        <span className={t.itemTime}>{timeAgo(c.createdAt)}</span>
                      </span>
                      <span className={t.itemTitle}>{displayTitle(c)}</span>
                      <span className={t.itemBadges}>
                        <StatusBadge status={c.status} />
                        {c.priority === 'alta' && <PriorityBadge priority={c.priority} />}
                        <span className={t.itemPlace}><MapPin size={12} aria-hidden="true" /> {c.location}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {selectedId && <Detail id={selectedId} onClose={() => select(null)} onChanged={reload} />}
      </div>
    </div>
  );
}

function Detail({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const { token } = useAppContext();
  const { data: c, error, loading, setData } = useAdminData((tk) => adminApi.detail(tk, id), [id]);
  const [next, setNext] = useState<Status | ''>('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNext('');
    setNote('');
    setMsg(null);
  }, [id]);

  const save = async () => {
    if (!token || !c || !next) return;
    setSaving(true);
    setMsg(null);
    try {
      await adminApi.setStatus(token, c.id, next, note);
      setData(await adminApi.detail(token, c.id));
      setMsg({ ok: true, text: `Status alterado para "${STATUS_LABEL[next]}". O denunciante vê a mudança no acompanhamento.` });
      setNext('');
      setNote('');
      onChanged();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className={`${s.card} ${t.detail}`} aria-label={`Denúncia ${id}`}>
      <button type="button" className={t.back} onClick={onClose}>
        <ArrowLeft size={18} aria-hidden="true" /> Voltar à lista
      </button>

      {loading && !c ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <span className={s.skeleton} style={{ height: 32, width: '60%' }} />
          <span className={s.skeleton} style={{ height: 120 }} />
          <span className={s.skeleton} style={{ height: 200 }} />
        </div>
      ) : error ? (
        <p className={s.error}>{error}</p>
      ) : c ? (
        <>
          <header className={t.detailHead}>
            <CatIcon cat={c.category} />
            <div style={{ minWidth: 0 }}>
              <div className={t.detailIdRow}>
                <h2 className={t.detailId}>{c.id}</h2>
                <button
                  type="button"
                  className={t.iconBtn}
                  onClick={() => {
                    navigator.clipboard?.writeText(c.id);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  aria-label="Copiar protocolo"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className={t.detailMeta}>{CATEGORY_LABEL[c.category]} · recebida {fmtDate(c.createdAt)}</p>
            </div>
          </header>

          <div className={t.badgeRow}>
            <StatusBadge status={c.status} />
            <PriorityBadge priority={c.priority} />
          </div>

          <h3 className={t.detailTitle}>{displayTitle(c)}</h3>

          <dl className={t.facts}>
            <div>
              <dt><MapPin size={14} aria-hidden="true" /> Local</dt>
              <dd>{c.location || 'Não informado'}</dd>
            </div>
            <div>
              <dt><User size={14} aria-hidden="true" /> Denunciante</dt>
              <dd>
                {c.anonymous || !c.contactEmail ? 'Anônimo' : (
                  <a href={`mailto:${c.contactEmail}?subject=${encodeURIComponent(`Sua denúncia ${c.id}`)}`} className={t.mail}>
                    <Mail size={14} aria-hidden="true" /> {c.contactEmail}
                  </a>
                )}
              </dd>
            </div>
          </dl>

          <div className={t.story}>
            <p className={t.storyLabel}>Relato</p>
            <p className={t.storyText}>{c.description}</p>
          </div>

          <section className={t.action} aria-labelledby="mudar-status">
            <h4 id="mudar-status" className={t.sectionLabel}>Atualizar andamento</h4>
            <div className={t.statusPick} role="radiogroup" aria-label="Novo status">
              {STATUS_ORDER.filter((st) => st !== c.status).map((st) => (
                <button key={st} type="button" role="radio" aria-checked={next === st} className={t.pick} data-status={st} onClick={() => setNext(st)}>
                  {STATUS_LABEL[st]}
                </button>
              ))}
            </div>
            <label className={s.field}>
              Observação (opcional)
              <textarea
                className={s.textarea}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                placeholder="Ex.: encaminhada ao Conselho Tutelar de São Luís."
              />
              <span className={s.hint}>Aparece para o denunciante na linha do tempo. Não inclua dados pessoais.</span>
            </label>
            {msg && <p className={msg.ok ? s.success : s.error} role="status">{msg.text}</p>}
            <button type="button" className={s.btnPrimary} onClick={save} disabled={!next || saving}>
              {saving ? 'Salvando…' : next ? `Mudar para "${STATUS_LABEL[next]}"` : 'Escolha o novo status'}
            </button>
          </section>

          <section aria-labelledby="historico">
            <h4 id="historico" className={t.sectionLabel}>Histórico</h4>
            <ol className={t.timeline}>
              {[...(c.events ?? [])].reverse().map((e, i) => (
                <li key={e.id ?? i}>
                  <span className={t.dot} data-status={e.toStatus} aria-hidden="true" />
                  <div>
                    <p className={t.tlTitle}>
                      {STATUS_LABEL[e.toStatus]}
                      <span> · {fmtDate(e.createdAt)}</span>
                    </p>
                    <p className={t.tlActor}>{e.actor?.name ?? 'Sistema'}</p>
                    {e.note && <p className={t.tlNote}>{e.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </>
      ) : null}
    </aside>
  );
}

export default function TriagePage() {
  return (
    <Suspense fallback={null}>
      <TriageInner />
    </Suspense>
  );
}
