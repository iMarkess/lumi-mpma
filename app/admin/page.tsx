'use client';

import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Clock, Inbox, Sparkles } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { CatIcon, PriorityBadge, StatusBadge, useAdminData } from '@/components/admin/ui';
import {
  adminApi,
  CATEGORY_LABEL,
  displayTitle,
  STATUS_LABEL,
  STATUS_ORDER,
  timeAgo,
  type AdminComplaint,
  type AdminStats,
  type Category,
} from '@/lib/adminApi';
import s from './admin.module.css';

const CAT_COLOR: Record<Category, string> = { child: '#2563EB', elderly: '#E3321B', env: '#059669' };
const STATUS_COLOR: Record<string, string> = {
  recebida: '#3B82F6',
  em_triagem: '#F59E0B',
  em_analise: '#8B5CF6',
  concluida: '#10B981',
  rejeitada: '#94A3B8',
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

/** Últimos 14 dias, do mais antigo ao de hoje (chave AAAA-MM-DD em UTC, igual ao servidor). */
function last14(daily: Record<string, number>) {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000);
    const key = d.toISOString().slice(0, 10);
    return { key, label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), value: daily[key] ?? 0 };
  });
}

export default function AdminOverview() {
  const { currentUser } = useAppContext();
  const { data, error, loading } = useAdminData(async (t) => {
    const [stats, list] = await Promise.all([adminApi.stats(t), adminApi.list(t)]);
    return { stats, list };
  });

  if (!currentUser) return null;

  const stats: AdminStats | undefined = data?.stats;
  const list: AdminComplaint[] = data?.list ?? [];
  const open = list.filter((c) => c.status !== 'concluida' && c.status !== 'rejeitada');
  // Precisa de atenção: alta prioridade em aberto, a mais antiga primeiro.
  const attention = open
    .filter((c) => c.priority === 'alta')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(0, 5);
  const fresh = list.filter((c) => c.status === 'recebida').slice(0, 6);
  const series = stats ? last14(stats.daily) : [];
  const peak = Math.max(1, ...series.map((d) => d.value));
  const total = stats?.total ?? 0;

  const kpis = [
    { label: 'Novas hoje', value: stats?.hoje, icon: Sparkles, color: '#2563EB', bg: '#EAF1FF', href: '/admin/triage?status=recebida', hint: 'recebidas desde 0h' },
    { label: 'Aguardando triagem', value: stats?.byStatus.recebida ?? 0, icon: Inbox, color: '#1D4ED8', bg: '#EAF1FF', href: '/admin/triage?status=recebida', hint: 'status "recebida"' },
    { label: 'Em andamento', value: stats ? stats.triagem + stats.analise : undefined, icon: Clock, color: '#B45309', bg: '#FFF6E0', href: '/admin/triage?status=em_analise', hint: 'triagem + análise' },
    { label: 'Urgentes abertas', value: stats?.urgentes, icon: AlertTriangle, color: '#C2290F', bg: '#FFEFEC', href: '/admin/triage?prioridade=alta', hint: 'prioridade alta' },
    { label: 'Concluídas', value: stats?.concluidas, icon: CheckCircle2, color: '#047857', bg: '#E6F7F0', href: '/admin/triage?status=concluida', hint: `de ${total} no total` },
  ];

  return (
    <div className={s.page}>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>
            {greeting()}, {currentUser.name.split(' ')[0]}
          </h1>
          <p className={s.subtitle}>
            {open.length === 0
              ? 'Nenhuma denúncia em aberto no momento.'
              : `${open.length} ${open.length === 1 ? 'denúncia em aberto' : 'denúncias em aberto'}${attention.length ? `, ${attention.length} com prioridade alta.` : '.'}`}
          </p>
        </div>
        <Link href="/admin/triage" className={s.btnPrimary}>
          Abrir caixa de denúncias
        </Link>
      </div>

      {error && <p className={s.error}>{error}</p>}

      <div className={s.kpis}>
        {kpis.map(({ label, value, icon: Icon, color, bg, href, hint }) => (
          <Link key={label} href={href} className={s.kpi}>
            <span className={s.kpiTop}>
              <span className={s.kpiLabel}>{label}</span>
              <span className={s.kpiIcon} style={{ background: bg, color }}>
                <Icon size={18} strokeWidth={2} aria-hidden="true" />
              </span>
            </span>
            {loading ? (
              <span className={s.skeleton} style={{ height: 32, width: 56 }} />
            ) : (
              <span className={s.kpiValue}>{value ?? 0}</span>
            )}
            <span className={s.kpiHint}>{hint}</span>
          </Link>
        ))}
      </div>

      <div className={s.split}>
        <section className={s.card} aria-labelledby="atencao">
          <div className={s.cardHead}>
            <h2 id="atencao" className={s.cardTitle}>Precisam de atenção</h2>
            <Link href="/admin/triage?prioridade=alta" className={s.cardLink}>Ver todas</Link>
          </div>
          {loading ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {[0, 1, 2].map((i) => <span key={i} className={s.skeleton} style={{ height: 56 }} />)}
            </div>
          ) : attention.length === 0 ? (
            <div className={s.empty}>
              <strong>Tudo em dia</strong>
              Nenhuma denúncia de prioridade alta em aberto.
            </div>
          ) : (
            <div className={s.rows}>
              {attention.map((c) => (
                <Link key={c.id} href={`/admin/triage?id=${c.id}`} className={s.row}>
                  <CatIcon cat={c.category} />
                  <span style={{ minWidth: 0 }}>
                    <span className={s.rowTitle} style={{ display: 'block' }}>{displayTitle(c)}</span>
                    <span className={s.rowMeta}>
                      {c.id} · {c.location} · {timeAgo(c.createdAt)}
                    </span>
                  </span>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className={s.card} aria-labelledby="areas">
          <div className={s.cardHead}>
            <h2 id="areas" className={s.cardTitle}>Por área</h2>
          </div>
          <div className={s.hbars}>
            {(Object.keys(CATEGORY_LABEL) as Category[]).map((cat) => {
              const n = stats?.byCategory[cat] ?? 0;
              return (
                <div key={cat} className={s.hbar}>
                  <div className={s.hbarTop}>
                    <span>{CATEGORY_LABEL[cat]}</span>
                    <b>{n}</b>
                  </div>
                  <div className={s.hbarTrack}>
                    <div className={s.hbarFill} style={{ width: `${total ? (n / total) * 100 : 0}%`, background: CAT_COLOR[cat] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className={s.split}>
        <section className={s.card} aria-labelledby="serie">
          <div className={s.cardHead}>
            <h2 id="serie" className={s.cardTitle}>Denúncias recebidas nos últimos 14 dias</h2>
            <span className={s.kpiHint}>{series.reduce((a, d) => a + d.value, 0)} no período</span>
          </div>
          <div className={s.chart} role="img" aria-label={series.map((d) => `${d.label}: ${d.value}`).join(', ')}>
            {series.map((d) => (
              <span
                key={d.key}
                className={`${s.bar} ${d.value === 0 ? s.barEmpty : ''}`}
                style={{ height: `${Math.max(4, (d.value / peak) * 100)}%` }}
                title={`${d.label}: ${d.value}`}
              />
            ))}
          </div>
          <div className={s.chartAxis}>
            <span>{series[0]?.label}</span>
            <span>hoje</span>
          </div>
        </section>

        <section className={s.card} aria-labelledby="status">
          <div className={s.cardHead}>
            <h2 id="status" className={s.cardTitle}>Por status</h2>
          </div>
          <div className={s.hbars}>
            {STATUS_ORDER.map((st) => {
              const n = stats?.byStatus[st] ?? 0;
              return (
                <div key={st} className={s.hbar}>
                  <div className={s.hbarTop}>
                    <span>{STATUS_LABEL[st]}</span>
                    <b>{n}</b>
                  </div>
                  <div className={s.hbarTrack}>
                    <div className={s.hbarFill} style={{ width: `${total ? (n / total) * 100 : 0}%`, background: STATUS_COLOR[st] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className={s.card} aria-labelledby="novas">
        <div className={s.cardHead}>
          <h2 id="novas" className={s.cardTitle}>Chegaram e ainda não foram triadas</h2>
          <Link href="/admin/triage?status=recebida" className={s.cardLink}>Ver todas</Link>
        </div>
        {!loading && fresh.length === 0 ? (
          <div className={s.empty}>Nenhuma denúncia esperando triagem.</div>
        ) : (
          <div className={s.rows}>
            {fresh.map((c) => (
              <Link key={c.id} href={`/admin/triage?id=${c.id}`} className={s.row}>
                <CatIcon cat={c.category} />
                <span style={{ minWidth: 0 }}>
                  <span className={s.rowTitle} style={{ display: 'block' }}>{displayTitle(c)}</span>
                  <span className={s.rowMeta}>
                    {c.id} · {CATEGORY_LABEL[c.category]} · {timeAgo(c.createdAt)}
                  </span>
                </span>
                {c.priority === 'alta' ? <PriorityBadge priority={c.priority} /> : <StatusBadge status={c.status} />}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
