/**
 * Cliente da API do LUMI (backend no VPS).
 *
 * Env-gated: só ativa se NEXT_PUBLIC_API_URL estiver definida no build.
 * Sem ela, `apiEnabled` é false e as telas continuam usando o modo local
 * (localStorage) — assim o deploy estático da PWA nunca quebra.
 *
 * Quando a API do VPS estiver no ar, defina no ambiente do build:
 *   NEXT_PUBLIC_API_URL=https://api.SEU-DOMINIO
 * e as telas passam a ler/gravar no banco real.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

export const apiEnabled = BASE.length > 0;

export type Category = 'child' | 'elderly' | 'env';
export type Status =
  | 'recebida'
  | 'em_triagem'
  | 'em_analise'
  | 'concluida'
  | 'rejeitada';
export type Priority = 'alta' | 'media' | 'baixa';

export interface ComplaintEvent {
  id: string;
  fromStatus: Status | null;
  toStatus: Status;
  note: string | null;
  createdAt: string;
}

export interface ApiComplaint {
  id: string;
  category: Category;
  title: string;
  location: string;
  description: string;
  status: Status;
  priority: Priority;
  anonymous: boolean;
  createdAt: string;
  updatedAt: string;
  events?: ComplaintEvent[];
}

export interface SubmitInput {
  category: Category;
  title: string;
  description: string;
  location?: string;
  priority?: Priority;
  anonymous?: boolean;
  contactEmail?: string | null;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const data = await res.json();
      message = data.error ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/* ===== Cidadão ===== */

export interface CitizenUser {
  id: string;
  name: string;
  cpf: string | null;
  email: string | null;
  avatarUrl?: string | null;
}

export interface AuthResult {
  token: string;
  user: CitizenUser;
}

export const api = {
  /* ===== Conta do cidadão ===== */

  registerCitizen(input: {
    name: string;
    cpf: string;
    password: string;
    email?: string | null;
  }) {
    return req<AuthResult>('/api/citizen/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  loginCitizen(identifier: string, password: string) {
    return req<AuthResult>('/api/citizen/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  googleCitizen(credential: string) {
    return req<AuthResult>('/api/citizen/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  submitComplaint(input: SubmitInput) {
    return req<{ protocol: string; id: string }>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  trackComplaint(protocol: string) {
    return req<ApiComplaint>(`/api/complaints/${encodeURIComponent(protocol)}`);
  },

  notifications(protocol: string) {
    return req<
      Array<{
        id: string;
        kind: string;
        title: string;
        body: string;
        read: boolean;
        createdAt: string;
      }>
    >(`/api/notifications?protocol=${encodeURIComponent(protocol)}`);
  },

  markNotificationRead(id: string) {
    return req(`/api/notifications/${id}/read`, { method: 'PATCH' });
  },

  /* ===== Servidores (JWT) ===== */

  login(cpf: string, password: string) {
    return req<{
      token: string;
      user: { id: string; name: string; role: string };
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ cpf, password }),
    });
  },

  adminList(
    token: string,
    filters?: { status?: Status; category?: Category; q?: string },
  ) {
    const qs = new URLSearchParams();
    if (filters?.status) qs.set('status', filters.status);
    if (filters?.category) qs.set('category', filters.category);
    if (filters?.q) qs.set('q', filters.q);
    const suffix = qs.toString() ? `?${qs}` : '';
    return req<ApiComplaint[]>(`/api/admin/complaints${suffix}`, {
      headers: authHeaders(token),
    });
  },

  adminStats(token: string) {
    return req<{
      total: number;
      triagem: number;
      analise: number;
      urgentes: number;
      concluidas: number;
    }>('/api/admin/stats', { headers: authHeaders(token) });
  },

  adminUpdateStatus(
    token: string,
    id: string,
    status: Status,
    note?: string,
  ) {
    return req<ApiComplaint>(`/api/admin/complaints/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ status, note }),
    });
  },
};
