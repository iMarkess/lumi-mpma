'use client';

import { useCallback, useEffect, useState } from 'react';
import { Baby, HeartHandshake, Leaf } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import {
  AdminError,
  PRIORITY_LABEL,
  STATUS_LABEL,
  type Category,
  type Priority,
  type Status,
} from '@/lib/adminApi';
import s from '@/app/admin/admin.module.css';

const CAT_ICON = { child: Baby, elderly: HeartHandshake, env: Leaf };

export function CatIcon({ cat, size = 20 }: { cat: Category; size?: number }) {
  const Icon = CAT_ICON[cat] ?? Baby;
  return (
    <span className={s.catIcon} data-cat={cat} aria-hidden="true">
      <Icon size={size} strokeWidth={1.8} />
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return <span className={s.badge} data-status={status}>{STATUS_LABEL[status] ?? status}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={s.badge} data-priority={priority}>Prioridade {PRIORITY_LABEL[priority].toLowerCase()}</span>;
}

/**
 * Carrega dados do painel com o token da equipe. Sessão expirada (401)
 * desloga e manda para o login em vez de mostrar tela quebrada.
 */
export function useAdminData<T>(load: (token: string) => Promise<T>, deps: unknown[] = []) {
  const { token, logout } = useAppContext();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      setData(await load(token));
    } catch (e) {
      if (e instanceof AdminError && e.status === 401) {
        logout();
        return;
      }
      setError((e as Error).message || 'Não foi possível carregar.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, ...deps]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}
