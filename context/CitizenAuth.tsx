'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { api, apiEnabled, type CitizenUser } from '@/lib/api';

interface RegisterInput {
  name: string;
  cpf: string;
  email?: string;
  password: string;
}

interface CitizenAuthType {
  user: CitizenUser | null;
  token: string | null;
  loading: boolean;
  ready: boolean; // terminou de ler a sessão salva
  register: (input: RegisterInput) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const SESSION_KEY = 'sentinela_citizen';
const LOCAL_ACCOUNTS = 'sentinela_accounts'; // fallback demo (sem backend)

const Ctx = createContext<CitizenAuthType | undefined>(undefined);

/* ---------- fallback local (demo, sem VPS) ---------- */
interface LocalAccount {
  name: string;
  cpf: string;
  email?: string;
  password: string;
}

function readAccounts(): LocalAccount[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS) || '[]');
  } catch {
    return [];
  }
}
function writeAccounts(list: LocalAccount[]) {
  localStorage.setItem(LOCAL_ACCOUNTS, JSON.stringify(list));
}
const onlyDigits = (s: string) => s.replace(/\D/g, '');

/** Decodifica o payload de um JWT do Google (sem verificar assinatura — só demo). */
function decodeJwt(token: string): {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
} {
  try {
    const part = token.split('.')[1];
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function CitizenAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CitizenUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setUser(s.user);
        setToken(s.token);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const persist = useCallback((t: string, u: CitizenUser) => {
    setToken(t);
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: t, user: u }));
  }, []);

  const register = useCallback(
    async (input: RegisterInput) => {
      setLoading(true);
      try {
        if (apiEnabled) {
          const res = await api.registerCitizen({
            name: input.name,
            cpf: onlyDigits(input.cpf),
            password: input.password,
            email: input.email || null,
          });
          persist(res.token, res.user);
        } else {
          // Demo local
          const cpf = onlyDigits(input.cpf);
          const accounts = readAccounts();
          if (accounts.some((a) => a.cpf === cpf || (input.email && a.email === input.email))) {
            throw new Error('Já existe conta com este CPF ou e-mail.');
          }
          accounts.push({ name: input.name, cpf, email: input.email, password: input.password });
          writeAccounts(accounts);
          persist('local-demo', {
            id: cpf,
            name: input.name,
            cpf,
            email: input.email || null,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const login = useCallback(
    async (identifier: string, password: string) => {
      setLoading(true);
      try {
        if (apiEnabled) {
          const res = await api.loginCitizen(identifier, password);
          persist(res.token, res.user);
        } else {
          const cpf = onlyDigits(identifier);
          const acc = readAccounts().find(
            (a) =>
              (a.cpf === cpf || a.email === identifier.toLowerCase()) &&
              a.password === password,
          );
          if (!acc) throw new Error('Conta ou senha incorretos.');
          persist('local-demo', {
            id: acc.cpf,
            name: acc.name,
            cpf: acc.cpf,
            email: acc.email || null,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      setLoading(true);
      try {
        if (apiEnabled) {
          // Backend verifica o token no Google e cria/recupera a conta.
          const res = await api.googleCitizen(credential);
          persist(res.token, res.user);
          return;
        }
        // Modo demo (sem VPS): lê os dados do Google e cria a conta localmente.
        const p = decodeJwt(credential);
        if (!p.sub) throw new Error('Não foi possível ler a conta Google.');
        const accounts = readAccounts();
        if (p.email && !accounts.some((a) => a.email === p.email)) {
          accounts.push({
            name: p.name ?? 'Cidadão',
            cpf: '',
            email: p.email,
            password: `google:${p.sub}`,
          });
          writeAccounts(accounts);
        }
        persist('local-demo', {
          id: p.sub,
          name: p.name ?? 'Cidadão',
          cpf: null,
          email: p.email ?? null,
          avatarUrl: p.picture ?? null,
        });
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <Ctx.Provider
      value={{ user, token, loading, ready, register, login, loginWithGoogle, logout }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCitizenAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCitizenAuth deve estar dentro de CitizenAuthProvider');
  return ctx;
}
