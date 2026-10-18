/**
 * Cliente do painel da equipe (/api/admin/*). Tudo exige o JWT de servidor.
 * Separado de lib/api.ts para o painel não depender do contexto público.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

export type Status = 'recebida' | 'em_triagem' | 'em_analise' | 'concluida' | 'rejeitada';
export type Category = 'child' | 'elderly' | 'env';
export type Priority = 'alta' | 'media' | 'baixa';
export type Role = 'PROMOTOR' | 'SECRETARIA' | 'OUVIDORIA' | 'MASTER';

export interface AdminComplaint {
  id: string;
  category: Category;
  title: string;
  location: string;
  description: string;
  status: Status;
  priority: Priority;
  anonymous: boolean;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  events?: {
    id: string;
    fromStatus: Status | null;
    toStatus: Status;
    note: string | null;
    createdAt: string;
    actor?: { name: string } | null;
  }[];
}

export interface AdminStats {
  total: number;
  hoje: number;
  triagem: number;
  analise: number;
  urgentes: number;
  concluidas: number;
  byStatus: Partial<Record<Status, number>>;
  byCategory: Partial<Record<Category, number>>;
  daily: Record<string, number>;
}

export interface StaffUser {
  id: string;
  name: string;
  cpf: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export class AdminError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function call<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new AdminError('Sem conexão com o servidor.', 0);
  }
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      message = (await res.json()).error ?? message;
    } catch {
      /* corpo vazio */
    }
    throw new AdminError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export const adminApi = {
  list: (token: string, q: { status?: string; category?: string; q?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(q).filter(([, v]) => v) as [string, string][]).toString();
    return call<AdminComplaint[]>(token, `/api/admin/complaints${qs ? `?${qs}` : ''}`);
  },
  detail: (token: string, id: string) =>
    call<AdminComplaint>(token, `/api/admin/complaints/${encodeURIComponent(id)}`),
  setStatus: (token: string, id: string, status: Status, note?: string) =>
    call<AdminComplaint>(token, `/api/admin/complaints/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note: note?.trim() || undefined }),
    }),
  stats: (token: string) => call<AdminStats>(token, '/api/admin/stats'),
  me: (token: string) => call<StaffUser>(token, '/api/admin/me'),
  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    call<{ ok: true }>(token, '/api/admin/me/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  users: (token: string) => call<StaffUser[]>(token, '/api/admin/users'),
  createUser: (token: string, u: { name: string; cpf: string; role: Role; password: string }) =>
    call<StaffUser>(token, '/api/admin/users', { method: 'POST', body: JSON.stringify(u) }),
  updateUser: (token: string, id: string, patch: { active?: boolean; role?: Role; password?: string }) =>
    call<StaffUser>(token, `/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
};

/* ---------- Rótulos compartilhados pelas telas do painel ---------- */

export const STATUS_LABEL: Record<Status, string> = {
  recebida: 'Recebida',
  em_triagem: 'Em triagem',
  em_analise: 'Em análise',
  concluida: 'Concluída',
  rejeitada: 'Encerrada',
};

export const STATUS_ORDER: Status[] = ['recebida', 'em_triagem', 'em_analise', 'concluida', 'rejeitada'];

export const CATEGORY_LABEL: Record<Category, string> = {
  child: 'Criança e adolescente',
  elderly: 'Idosos e PcD',
  env: 'Meio ambiente',
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export const ROLE_LABEL: Record<Role, string> = {
  PROMOTOR: 'Promotor(a)',
  SECRETARIA: 'Secretaria',
  OUVIDORIA: 'Ouvidoria',
  MASTER: 'Administrador',
};

/** Senha temporária legível (sem 0/O, 1/l) para repassar à pessoa. */
export function tempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export function fmtDate(iso: string, withTime = true) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : { year: 'numeric' }),
  });
}

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'agora';
  if (s < 3600) return `há ${Math.floor(s / 60)} min`;
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`;
  const d = Math.floor(s / 86400);
  return d === 1 ? 'ontem' : `há ${d} dias`;
}

/** Denúncias antigas foram gravadas com o id cru da área ("Denúncia elderly"). */
export function displayTitle(c: { title: string }) {
  const m = c.title.match(/^Denúncia (child|elderly|env)$/);
  return m ? `Denúncia: ${CATEGORY_LABEL[m[1] as Category]}` : c.title;
}
