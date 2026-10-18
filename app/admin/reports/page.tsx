'use client';

import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { useAdminData } from '@/components/admin/ui';
import {
  adminApi,
  CATEGORY_LABEL,
  PRIORITY_LABEL,
  STATUS_LABEL,
  STATUS_ORDER,
  type AdminComplaint,
  type Category,
  type Priority,
} from '@/lib/adminApi';
import s from '../admin.module.css';

const PERIODS = [
  { id: 7, label: 'Últimos 7 dias' },
  { id: 30, label: 'Últimos 30 dias' },
  { id: 90, label: 'Últimos 90 dias' },
  { id: 0, label: 'Todo o período' },
];

function pct(n: number, total: number) {
  return total ? `${Math.round((n / total) * 100)}%` : '0%';
}

function countBy<K extends string>(rows: AdminComplaint[], key: (c: AdminComplaint) => K) {
  const out = {} as Record<K, number>;
  for (const r of rows) out[key(r)] = (out[key(r)] ?? 0) + 1;
  return out;
}

export default function ReportsPage() {
  const { data: list, error, loading } = useAdminData((tk) => adminApi.list(tk));
  const [days, setDays] = useState(30);
  const [now] = useState(() => Date.now()); // referência fixa do período

  const rows = useMemo(() => {
    if (!list) return [];
    if (!days) return list;
    const since = now - days * 86400000;
    return list.filter((c) => new Date(c.createdAt).getTime() >= since);
  }, [list, days, now]);

  const total = rows.length;
  const byCat = countBy(rows, (c) => c.category);
  const byStatus = countBy(rows, (c) => c.status);
  const byPriority = countBy(rows, (c) => c.priority);
  const closed = (byStatus.concluida ?? 0) + (byStatus.rejeitada ?? 0);
  const anonymous = rows.filter((c) => c.anonymous).length;

  const places = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = (r.location || 'Não informado').trim();
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [rows]);

  const exportCsv = () => {
    const lines = [
      ['Indicador', 'Valor'],
      ['Período', PERIODS.find((p) => p.id === days)?.label ?? ''],
      ['Total de denúncias', String(total)],
      ['Resolvidas (concluídas + encerradas)', String(closed)],
      ['Anônimas', String(anonymous)],
      ...(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => [`Área: ${CATEGORY_LABEL[c]}`, String(byCat[c] ?? 0)]),
      ...STATUS_ORDER.map((st) => [`Status: ${STATUS_LABEL[st]}`, String(byStatus[st] ?? 0)]),
      ...(['alta', 'media', 'baixa'] as Priority[]).map((p) => [`Prioridade: ${PRIORITY_LABEL[p]}`, String(byPriority[p] ?? 0)]),
      ...places.map(([place, n]) => [`Local: ${place}`, String(n)]),
    ];
    const csv = '﻿' + lines.map((l) => l.map((v) => `"${v.replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `relatorio-lumi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const table = (title: string, entries: [string, number][]) => (
    <section className={s.card}>
      <h2 className={s.cardTitle} style={{ marginBottom: 14 }}>{title}</h2>
      <div className={s.hbars}>
        {entries.map(([label, n]) => (
          <div key={label} className={s.hbar}>
            <div className={s.hbarTop}>
              <span>{label}</span>
              <b>{n} <span style={{ fontWeight: 500, color: '#5E6A86' }}>· {pct(n, total)}</span></b>
            </div>
            <div className={s.hbarTrack}>
              <div className={s.hbarFill} style={{ width: pct(n, total), background: '#0B1530' }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className={s.page}>
      <div className={s.head}>
        <div>
          <h1 className={s.title}>Relatórios</h1>
          <p className={s.subtitle}>Números calculados a partir das denúncias registradas.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select className={s.select} value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Período" style={{ width: 'auto' }}>
            {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <button type="button" className={s.btn} onClick={exportCsv} disabled={!total}>
            <Download size={16} aria-hidden="true" /> CSV
          </button>
          <button type="button" className={s.btn} onClick={() => window.print()}>
            <Printer size={16} aria-hidden="true" /> Imprimir
          </button>
        </div>
      </div>

      {error && <p className={s.error}>{error}</p>}

      <div className={s.kpis} style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {[
          ['Denúncias no período', total],
          ['Resolvidas', `${closed} (${pct(closed, total)})`],
          ['Em aberto', total - closed],
          ['Anônimas', `${anonymous} (${pct(anonymous, total)})`],
        ].map(([label, value]) => (
          <div key={String(label)} className={s.kpi}>
            <span className={s.kpiLabel}>{label}</span>
            {loading ? <span className={s.skeleton} style={{ height: 32, width: 64 }} /> : <span className={s.kpiValue}>{value}</span>}
          </div>
        ))}
      </div>

      <div className={s.split} style={{ gridTemplateColumns: '1fr 1fr' }}>
        {table('Por área', (Object.keys(CATEGORY_LABEL) as Category[]).map((c) => [CATEGORY_LABEL[c], byCat[c] ?? 0]))}
        {table('Por status', STATUS_ORDER.map((st) => [STATUS_LABEL[st], byStatus[st] ?? 0]))}
        {table('Por prioridade', (['alta', 'media', 'baixa'] as Priority[]).map((p) => [PRIORITY_LABEL[p], byPriority[p] ?? 0]))}
        {table('Locais mais citados', places.length ? places : [['Sem dados', 0]])}
      </div>
    </div>
  );
}
