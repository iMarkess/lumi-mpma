'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  addComplaint: (complaint: Partial<Complaint>) => void;
  updateComplaintStatus: (id: string, status: Complaint['status']) => void;
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  addUser: (user: Partial<User>) => void;
  removeUser: (id: string) => void;
  login: (cpf: string, pass: string) => { success: boolean, mustChange?: boolean, error?: string };
  logout: () => void;
  updatePassword: (userId: string, newPass: string) => void;
  isAuthLoading: boolean;
  stats: {
    today: number;
    triage: number;
    urgent: number;
    completed: number;
  };
}

const initialUsers: User[] = [
  { id: '1', name: 'Lucas Marques', cpf: '046.675.443-41', password: '123', role: 'promotor', avatar: 'LM', mustChangePassword: false },
  { id: '2', name: 'Ana Silva', cpf: '000.000.000-00', password: '123', role: 'secretaria', avatar: 'AS', mustChangePassword: false },
  { id: '3', name: 'Carlos Ouvidor', cpf: '111.111.111-11', password: '123', role: 'ouvidoria', avatar: 'CO', mustChangePassword: false },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialComplaints: Complaint[] = [
  { id: 'MPMA-X82J91', category: 'child', title: 'Possível negligência em escola', location: 'São Luís', status: 'recebida', priority: 'alta', date: 'Hoje, 14:20', description: 'Relato de negligência sistemática.' },
  { id: 'MPMA-A72K12', category: 'env', title: 'Queimada irregular em terreno', location: 'Imperatriz', status: 'em_triagem', priority: 'media', date: 'Hoje, 09:15', description: 'Fogo em área de proteção.' },
  { id: 'MPMA-B33L90', category: 'elderly', title: 'Maus-tratos por familiar', location: 'Caxias', status: 'em_analise', priority: 'alta', date: 'Ontem, 21:00', description: 'Idoso em situação de abandono.' },
  { id: 'MPMA-P99M21', category: 'child', title: 'Exploração de trabalho infantil', location: 'Timon', status: 'recebida', priority: 'alta', date: 'Ontem, 16:45', description: 'Crianças vendendo doces no sinal.' },
  { id: 'MPMA-E44N10', category: 'env', title: 'Descarte lixo em rio', location: 'Paço do Lumiar', status: 'concluída', priority: 'baixa', date: '20 Mar, 11:30', description: 'Empresa descartando resíduos.' },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Load everything from localStorage on mount
  useEffect(() => {
    const savedComplaints = localStorage.getItem('mpma_complaints');
    if (savedComplaints) setComplaints(JSON.parse(savedComplaints));

    const savedUsers = localStorage.getItem('mpma_users');
    if (savedUsers) {
      const parsed = JSON.parse(savedUsers);
      // Migration: Ensure Lucas Marques and his new CPF are up to date
      const updated = parsed.map((u: any) => 
        u.id === '1' ? { ...u, name: 'Lucas Marques', avatar: 'LM', cpf: '046.675.443-41' } : u
      );
      setUsers(updated);
    }

    const savedAuth = localStorage.getItem('mpma_auth');
    if (savedAuth) {
      const user = JSON.parse(savedAuth);
      // We'll trust the saved auth for now, but we could verify against users
      setCurrentUser(user);
    }
    setIsAuthLoading(false);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isAuthLoading) {
      localStorage.setItem('mpma_complaints', JSON.stringify(complaints));
    }
  }, [complaints, isAuthLoading]);

  useEffect(() => {
    if (!isAuthLoading) {
      localStorage.setItem('mpma_users', JSON.stringify(users));
    }
  }, [users, isAuthLoading]);
  const addComplaint = (newComplaint: Partial<Complaint>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const complaint: Complaint = {
      id: newComplaint.id || `MPMA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      category: newComplaint.category || 'child',
      title: newComplaint.title || 'Nova Denúncia',
      location: newComplaint.location || 'Não informado',
      status: 'recebida',
      priority: newComplaint.priority || 'media',
      date: `Hoje, ${timeStr}`,
      description: newComplaint.description || '',
      ...newComplaint
    };
    setComplaints([complaint, ...complaints]);
  };

  const updateComplaintStatus = (id: string, status: Complaint['status']) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const login = (cpf: string, pass: string) => {
    const cleanInputCpf = cpf.replace(/\D/g, '');
    const user = users.find(u => u.cpf.replace(/\D/g, '') === cleanInputCpf && u.password === pass);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('mpma_auth', JSON.stringify(user));
      return { success: true, mustChange: user.mustChangePassword };
    }
    return { success: false, error: 'CPF ou senha incorretos' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mpma_auth');
  };

  const updatePassword = (userId: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPass, mustChangePassword: false } : u));
    // Update current user if it's the one changing
    if (currentUser?.id === userId) {
      const updated = { ...currentUser, password: newPass, mustChangePassword: false };
      setCurrentUser(updated);
      localStorage.setItem('mpma_auth', JSON.stringify(updated));
    }
  };

  const addUser = (newUser: Partial<User>) => {
    const user: User = {
      id: Math.random().toString(36).substring(7),
      name: newUser.name || 'Novo Usuário',
      cpf: newUser.cpf || '000.000.000-00', 
      password: 'mpma123', 
      role: newUser.role || 'ouvidoria',
      avatar: newUser.name ? newUser.name.substring(0, 2).toUpperCase() : 'NU',
      mustChangePassword: true, 
      ...newUser
    } as User;
    setUsers([...users, user]);
  };

  const removeUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const stats = {
    today: complaints.filter(c => c.date.includes('Hoje') || c.date === 'Agora').length,
    triage: complaints.filter(c => c.status === 'em_triagem').length,
    urgent: complaints.filter(c => c.priority === 'alta').length,
    completed: complaints.filter(c => c.status === 'concluída').length,
  };

  return (
    <AppContext.Provider value={{ 
      complaints, addComplaint, updateComplaintStatus, 
      users, currentUser, setCurrentUser, addUser, removeUser,
      login, logout, updatePassword, isAuthLoading,
      stats 
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
