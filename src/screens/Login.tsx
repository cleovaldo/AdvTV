import React, { useState } from 'react';
import { Monitor, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { USERS } from '../constants';
import { toast } from 'sonner';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const user = USERS.find(u => u.email === email && u.password === password);
      
      if (user) {
        onLogin(user);
        toast.success(`Bem-vindo, ${user.name}!`);
      } else {
        toast.error('Credenciais inválidas', {
          description: 'Verifique seu e-mail e senha e tente novamente.'
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#040e1f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Logo size={120} showText={false} />
          </div>
          <h1 className="text-4xl font-black text-[#d8e3fb] tracking-tight mb-2">Batista & Saraiva TV</h1>
          <p className="text-slate-500 font-medium">Gerenciamento de Transmissão Digital</p>
        </div>

        <div className="bg-[#111c2d] rounded-3xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffb95f]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@batistasaraiva.tv"
                  className="w-full bg-[#081425] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-[#d8e3fb] outline-none focus:ring-2 focus:ring-[#ffb95f]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#081425] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-[#d8e3fb] outline-none focus:ring-2 focus:ring-[#ffb95f]/50 transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#ffb95f] to-[#ff9d23] text-[#472a00] font-bold py-4 rounded-xl shadow-lg shadow-[#ffb95f]/10 hover:opacity-90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-[#472a00]/30 border-t-[#472a00] rounded-full animate-spin"></div>
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 p-4 bg-[#111c2d]/50 rounded-2xl border border-white/5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#b7c8e1] shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Acesso restrito a administradores e terminais autorizados. Para registrar um novo endpoint, entre em contato com o suporte de TI.
          </p>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">© 2026 Batista & Saraiva TV</p>
        </div>
      </div>
    </div>
  );
}
