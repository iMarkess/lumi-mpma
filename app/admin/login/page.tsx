'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

export default function LoginPage() {
  const { login, updatePassword, currentUser } = useAppContext();
  const router = useRouter();
  
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'login' | 'reset'>('login');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCPF = (val: string) => {
    const v = val.replace(/\D/g, '');
    if (v.length <= 11) {
      return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
    }
    return val;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    
    const res = login(cpf, password);
    if (res.success) {
      if (res.mustChange) {
        setStep('reset');
      } else {
        router.push('/admin');
      }
    } else {
      setError(res.error || 'Erro ao entrar');
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    if (currentUser) {
      updatePassword(currentUser.id, newPassword);
      router.push('/admin');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #00458e 0%, #0a192f 100%)',
      padding: 20,
      fontFamily: 'inherit'
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 24,
        padding: '48px 40px',
        boxShadow: '0 40px 80px rgba(0, 0, 0, 0.4)',
        animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .input-focus:focus-within {
            border-color: #00458e !important;
            box-shadow: 0 0 0 4px rgba(0, 69, 142, 0.2) !important;
            background: rgba(255, 255, 255, 0.08) !important;
          }
        `}} />

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Image 
            src="/images/Gemini_Generated_Image_gjyowhgjyowhgjyo-Photoroom.png" 
            alt="MPMA" 
            width={100} 
            height={100} 
            style={{ marginBottom: 24, filter: 'drop-shadow(0 6px 16px rgba(0,69,142,0.3))' }}
          />
          {step === 'login' ? (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Portal Administrativo</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Acesse o painel administrativo do MPMA</p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8, color: '#ffd54f' }}>Primeiro Acesso</h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Por segurança, altere sua senha inicial</p>
            </>
          )}
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 83, 80, 0.1)', 
            border: '1px solid rgba(239, 83, 80, 0.2)', 
            color: '#ef5350', 
            padding: '12px 16px', 
            borderRadius: 12, 
            fontSize: '0.85rem', 
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <Shield size={16} /> {error}
          </div>
        )}

        {step === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-focus" style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              transition: 'all 0.3s ease'
            }}>
              <User size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input 
                type="text"
                placeholder="CPF"
                required
                value={cpf}
                onChange={e => setCpf(formatCPF(e.target.value))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  padding: '16px 12px',
                  width: '100%',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div className="input-focus" style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              transition: 'all 0.3s ease'
            }}>
              <Lock size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input 
                type={showPass ? 'text' : 'password'}
                placeholder="Senha"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  padding: '16px 12px',
                  width: '100%',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 4 }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00458e 0%, #002d62 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 16,
                padding: '16px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 10px 20px rgba(0, 69, 142, 0.3)'
              }}
            >
              {loading ? 'Entrando...' : (
                <>Entrar <ArrowRight size={18} /></>
              )}
            </button>
            
            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'center', textDecoration: 'none' }}>Esqueceu sua senha?</a>
          </form>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-focus" style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid #ffd54f33', 
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px'
            }}>
              <Lock size={20} style={{ color: '#ffd54f' }} />
              <input 
                type="password"
                placeholder="Nova Senha"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'white', padding: '16px 12px', width: '100%', outline: 'none' }}
              />
            </div>
            <div className="input-focus" style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid #ffd54f33', 
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px'
            }}>
              <CheckCircle2 size={20} style={{ color: '#ffd54f' }} />
              <input 
                type="password"
                placeholder="Confirmar Nova Senha"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'white', padding: '16px 12px', width: '100%', outline: 'none' }}
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              style={{
                background: '#ffd54f',
                color: '#4b3e00',
                border: 'none',
                borderRadius: 16,
                padding: '16px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 8
              }}
            >
              {loading ? 'Salvando...' : 'Redefinir e Entrar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
