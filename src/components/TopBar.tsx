import { Search, Bell, User } from 'lucide-react';
import Logo from './Logo';

export default function TopBar({ user }: { user?: any }) {
  return (
    <header className="fixed top-0 right-0 left-64 h-16 px-8 flex items-center justify-between z-30 bg-[#081425]/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] font-['Plus_Jakarta_Sans'] text-sm tracking-tight text-[#b7c8e1]">
      <div className="flex items-center gap-8">
        <Logo size={32} showText={true} />
        <nav className="hidden md:flex items-center gap-6">
          <button className="text-slate-400 hover:text-slate-200 transition-all">Análises</button>
          <button className="text-slate-400 hover:text-slate-200 transition-all">Feed Ao Vivo</button>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <input
            type="text"
            placeholder="Pesquisar ativos..."
            className="bg-[#2a3548] border-none text-xs rounded-md pl-10 pr-4 py-2 w-64 focus:ring-1 focus:ring-[#b7c8e1] transition-all outline-none text-[#d8e3fb]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
        </div>

        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-[#ffb95f] transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#ffb95f] rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#d8e3fb]">{user?.name || 'Usuário Admin'}</p>
              <p className="text-[10px] text-slate-500">Status Global: Online</p>
            </div>
            <div className="w-8 h-8 rounded-full border border-[#b7c8e1]/20 overflow-hidden bg-[#2a3548] flex items-center justify-center">
              <User className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
