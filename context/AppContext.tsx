'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, apiEnabled, type ApiComplaint, type Status as ApiStatus } from '@/lib/api';

export type Role = 'promotor' | 'secretaria' | 'ouvidoria' | 'master';

export interface User {
  id: string;
  name: string;
  cpf: string;
  password?: string;
  role: Role;
  avatar: string;
  mustChangePassword?: boolean;
}

export interface Complaint {
  id: string;
  category: 'child' | 'elderly' | 'env';
  title: string;
  location: string;
  status: 'recebida' | 'em_triagem' | 'em_analise' | 'concluída' | 'rejeitada';
  priority: 'alta' | 'media' | 'baixa';
  date: string;
  description: string;
  victim_name?: string;
}

interface AppContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Partial<Complaint>) => Promise<string>;
  updateComplaintStatus: (id: string, status: Complaint['status']) => Promise<void>;
  trackComplaint: (protocol: string) => Promise<Complaint | null>;
  refreshComplaints: () => Promise<void>;
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  addUser: (user: Partial<User>) => void;
  removeUser: (id: string) => void;
  login: (cpf: string, pass: string) => Promise<{ success: boolean; mustChange?: boolean; error?: string }>;
  logout: () => void;
  updatePassword: (userId: string, newPass: string) => void;
  isAuthLoading: boolean;
  stats: { today: number; triage: number; urgent: number; completed: number };
}

const initialUsers: User[] = [
  { id: '1', name: 'Lucas Marques', cpf: '046.675.443-41', password: '123', role: 'promotor', avatar: 'LM', mustChangePassword: false },
  { id: '2', name: 'Ana Silva', cpf: '000.000.000-00', password: '123', role: 'secretaria', avatar: 'AS', mustChangePassword: false },
  { id: '3', name: 'Carlos Ouvidor', cpf: '111.111.111-11', password: '123', role: 'ouvidoria', avatar: 'CO', mustChangePassword: false },
];

const initialComplaints: Complaint[] = [
  { id: 'MPMA-X82J91', category: 'child', title: 'Possível negligência em escola', location: 'São Luís', status: 'recebida', priority: 'alta', date: 'Hoje, 14:20', description: 'Relato de negligência sistemática.' },
  { id: 'MPMA-A72K12', category: 'env', title: 'Queimada irregular em terreno', location: 'Imperatriz', status: 'em_triagem', priority: 'media', date: 'Hoje, 09:15', description: 'Fogo em área de proteção.' },
  { id: 'MPMA-B33L90', category: 'elderly', title: 'Maus-tratos por familiar', location: 'Caxias', status: 'em_analise', priority: 'alta', date: 'Ontem, 21:00', description: 'Idoso em situação de abandono.' },
];

const ROLE_MAP: Record<string, Role> = {
  PROMOTOR: 'promotor', SECRETARIA: 'secretaria', OUVIDORIA: 'ouvidoria', MASTER: 'master',
};

function statusFromApi(s: ApiStatus): Complaint['status'] {
  return s === 'concluida' ? 'concluída' : s;
}
function statusToApi(s: Complaint['status']): ApiStatus {
  return s === 'concluída' ? 'concluida' : s;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const sameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (sameDay) return `Hoje, ${time}`;
  if (d.toDateString() === yest.toDateString()) return `Ontem, ${time}`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function mapComplaint(c: ApiComplaint): Complaint {
  return {
    id: c.id,
    category: c.category,
    title: c.title,
    location: c.location,
    status: statusFromApi(c.status),
    priority: c.priority,
    date: fmtDate(c.createdAt),
    description: c.description,
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const TOKEN_KEY = 'lumi_admin_token';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(apiEnabled ? [] : initialComplaints);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const fetchComplaints = useCallback(async (tk: string) => {
    try {
      const list = await api.adminList(tk);
      setComplaints(list.map(mapComplaint));
    } catch {
      /* mantém o que tem */
    }
  }, []);

  // Carregamento inicial
  useEffect(() => {
    (async () => {
      if (apiEnabled) {
        try {
          const savedAuth = localStorage.getItem('mpma_auth');
          const savedToken = localStorage.getItem(TOKEN_KEY);
          if (savedAuth && savedToken) {
            setCurrentUser(JSON.parse(savedAuth));
            setToken(savedToken);
            await fetchComplaints(savedToken);
          }
        } catch { /* ignore */ }
        setIsAuthLoading(false);
        return;
      }
      // Fallback local (sem backend configurado)
      const savedComplaints = localStorage.getItem('mpma_complaints');
      if (savedComplaints) setComplaints(JSON.parse(savedComplaints));
      const savedUsers = localStorage.getItem('mpma_users');
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      const savedAuth = localStorage.getItem('mpma_auth');
      if (savedAuth) setCurrentUser(JSON.parse(savedAuth));
      setIsAuthLoading(false);
    })();
  }, [fetchComplaints]);

  // Persistência local (só no modo fallback)
  useEffect(() => {
    if (!apiEnabled && !isAuthLoading) {
      localStorage.setItem('mpma_complaints', JSON.stringify(complaints));
    }
  }, [complaints, isAuthLoading]);
  useEffect(() => {
    if (!apiEnabled && !isAuthLoading) {
      localStorage.setItem('mpma_users', JSON.stringify(users));
    }
  }, [users, isAuthLoading]);

  const refreshComplaints = useCallback(async () => {
    if (apiEnabled && token) await fetchComplaints(token);
  }, [token, fetchComplaints]);

  const addComplaint = useCallback(async (nc: Partial<Complaint>): Promise<string> => {
    if (apiEnabled) {
      const res = await api.submitComplaint({
        category: (nc.category || 'child') as 'child' | 'elderly' | 'env',
        title: nc.title || 'Nova denúncia',
        description: nc.description || '',
        location: nc.location || '',
        priority: (nc.priority || 'media') as 'alta' | 'media' | 'baixa',
        anonymous: true,
      });
      if (token) await fetchComplaints(token);
      return res.protocol;
    }
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const id = nc.id || `MPMA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const complaint: Complaint = {
      id, category: nc.category || 'child', title: nc.title || 'Nova Denúncia',
      location: nc.location || 'Não informado', status: 'recebida',
      priority: nc.priority || 'media', date: `Hoje, ${timeStr}`, description: nc.description || '', ...nc,
    };
    setComplaints((prev) => [complaint, ...prev]);
    return id;
  }, [token, fetchComplaints]);

  const updateComplaintStatus = useCallback(async (id: string, status: Complaint['status']) => {
    if (apiEnabled && token) {
      try {
        await api.adminUpdateStatus(token, id, statusToApi(status));
      } catch { /* ignore */ }
    }
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }, [token]);

  const trackComplaint = useCallback(async (protocol: string): Promise<Complaint | null> => {
    if (apiEnabled) {
      try {
        const c = await api.trackComplaint(protocol);
        return mapComplaint(c);
      } catch {
        return null;
      }
    }
    return complaints.find((c) => c.id.toUpperCase() === protocol.trim().toUpperCase()) || null;
  }, [complaints]);

  const login = useCallback(async (cpf: string, pass: string) => {
    if (apiEnabled) {
      try {
        const res = await api.login(cpf, pass);
        const user: User = {
          id: res.user.id, name: res.user.name, cpf,
          role: ROLE_MAP[res.user.role] || 'ouvidoria',
          avatar: res.user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
        };
        setToken(res.token);
        setCurrentUser(user);
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem('mpma_auth', JSON.stringify(user));
        await fetchComplaints(res.token);
        return { success: true, mustChange: false };
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erro ao entrar' };
      }
    }
    const cleanCpf = cpf.replace(/\D/g, '');
    const user = users.find((u) => u.cpf.replace(/\D/g, '') === cleanCpf && u.password === pass);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('mpma_auth', JSON.stringify(user));
      return { success: true, mustChange: user.mustChangePassword };
    }
    return { success: false, error: 'CPF ou senha incorretos' };
  }, [users, fetchComplaints]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('mpma_auth');
    localStorage.removeItem(TOKEN_KEY);
    if (apiEnabled) setComplaints([]);
  }, []);

  const updatePassword = useCallback((userId: string, newPass: string) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, password: newPass, mustChangePassword: false } : u)));
    if (currentUser?.id === userId) {
      const updated = { ...currentUser, password: newPass, mustChangePassword: false };
      setCurrentUser(updated);
      localStorage.setItem('mpma_auth', JSON.stringify(updated));
    }
  }, [currentUser]);

  const addUser = useCallback((nu: Partial<User>) => {
    const user: User = {
      id: Math.random().toString(36).substring(7),
      name: nu.name || 'Novo Usuário', cpf: nu.cpf || '000.000.000-00',
      password: 'mpma123', role: nu.role || 'ouvidoria',
      avatar: nu.name ? nu.name.substring(0, 2).toUpperCase() : 'NU',
      mustChangePassword: true, ...nu,
    } as User;
    setUsers((prev) => [...prev, user]);
  }, []);

  const removeUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const stats = {
    today: complaints.filter((c) => c.date.includes('Hoje') || c.date === 'Agora').length,
    triage: complaints.filter((c) => c.status === 'em_triagem').length,
    urgent: complaints.filter((c) => c.priority === 'alta').length,
    completed: complaints.filter((c) => c.status === 'concluída').length,
  };

  return (
    <AppContext.Provider value={{
      complaints, addComplaint, updateComplaintStatus, trackComplaint, refreshComplaints,
      users, currentUser, setCurrentUser, addUser, removeUser,
      login, logout, updatePassword, isAuthLoading, stats,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
