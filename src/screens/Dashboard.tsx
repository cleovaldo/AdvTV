import { Monitor, Heart, HardDrive, PlusCircle, Upload, Megaphone, TrendingUp, CheckCircle, User, Bell, Calendar, CloudSun, Wind, Droplets } from 'lucide-react';
import { MEDIA_ASSETS, TV_SCREENS } from '../constants';
import { useState, useEffect } from 'react';
import { TVScreen } from '../types';

interface DashboardProps {
  onNavigate: (screen: any) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [screens, setScreens] = useState<TVScreen[]>(() => {
    const saved = localStorage.getItem('tv_screens');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error parsing tv_screens in dashboard:', e);
      }
    }
    
    // If we've never initialized before, use defaults
    const initialized = localStorage.getItem('tv_screens_initialized');
    if (!initialized) {
      return TV_SCREENS;
    }
    
    return [];
  });

  // Polling for metrics to keep dashboard updated
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/screens/metrics');
        if (response.ok) {
          const metrics = await response.json();
          setScreens(prev => {
            const updated = prev.map(s => {
              if (metrics[s.id]) {
                return { ...s, ...metrics[s.id] };
              }
              return s;
            });
            return updated;
          });
        }
      } catch (e) {
        // Silent fail
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen for storage changes to keep screens in sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tv_screens' && e.newValue !== null) {
        try {
          const newScreens = JSON.parse(e.newValue);
          if (JSON.stringify(newScreens) !== JSON.stringify(screens)) {
            setScreens(newScreens);
          }
        } catch (err) {
          console.error('Error syncing screens in dashboard:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [screens]);

  const activeScreensCount = screens.filter(s => s.status === 'online').length;

  const [weather, setWeather] = useState({
    temp: 24,
    condition: 'Ensolarado',
    city: 'São Paulo, SP',
    humidity: 65,
    wind: 12
  });

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-10">
        <section>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-[#d8e3fb]">Visão Geral do Sistema</h1>
          <p className="text-slate-400 max-w-2xl">Gerencie a comunicação visual do santuário digital. Monitorando {screens.length} {screens.length === 1 ? 'endpoint ativo' : 'endpoints ativos'}.</p>
        </section>

        <div className="hidden lg:flex items-center gap-6 bg-[#111c2d] p-4 rounded-2xl border border-white/5 shadow-xl">
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-[#ffb95f] transition-all relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ffb95f] rounded-full border-2 border-[#111c2d]"></span>
            </button>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 flex items-center justify-end gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${activeScreensCount > 0 ? 'bg-green-400 animate-pulse' : 'bg-yellow-500'}`}></span>
                Status Global: {activeScreensCount > 0 ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
        <div className="p-6 rounded-xl bg-[#111c2d] flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <Monitor className="text-[#ffb95f] w-8 h-8" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Telas Ativas</span>
          </div>
          <div>
            <div className="text-4xl font-black text-[#d8e3fb]">{activeScreensCount}<span className="text-lg text-slate-400 font-medium">/{screens.length}</span></div>
            <div className="flex items-center gap-1 text-xs text-[#ffb95f] mt-1">
              <TrendingUp className="w-4 h-4" />
              <span>{screens.length === 0 ? 'Nenhuma tela cadastrada' : `Status: ${activeScreensCount > 0 ? 'Operacional' : 'Aguardando conexão'}`}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[#111c2d] flex flex-col justify-between min-h-[160px] border border-[#ffb95f]/20 shadow-[0_0_20px_rgba(255,185,95,0.05)]">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <CloudSun className="text-[#ffb95f] w-8 h-8" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ffb95f]">Climatempo</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Laboratório Oficial</span>
              </div>
            </div>
            <a href="https://www.climatempo.com.br" target="_blank" rel="noopener noreferrer" className="text-[8px] text-slate-600 hover:text-slate-400 underline uppercase font-bold">Ver no site</a>
          </div>
          <div>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-black text-[#d8e3fb]">{weather.temp}°C</div>
              <div className="text-xs text-slate-400 mb-1 font-bold uppercase">{weather.condition}</div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Droplets className="w-3 h-3 text-[#b7c8e1]" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                <Wind className="w-3 h-3 text-[#b7c8e1]" />
                <span>{weather.wind}km/h</span>
              </div>
              <div className="text-[10px] text-[#ffb95f] font-bold ml-auto">{weather.city}</div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[#111c2d] flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <Heart className="text-[#b7c8e1] w-8 h-8 fill-[#b7c8e1]" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Saúde da Lista</span>
          </div>
          <div>
            <div className="text-4xl font-black text-[#d8e3fb]">94%</div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <CheckCircle className="w-4 h-4" />
              <span>Todos os arquivos verificados</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[#111c2d] flex flex-col justify-between min-h-[160px]">
          <div className="flex justify-between items-start">
            <HardDrive className="text-[#b9c8de] w-8 h-8" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Armazenamento</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#d8e3fb] font-semibold">1.2 TB de 2 TB</span>
              <span className="text-slate-400">60%</span>
            </div>
            <div className="h-1.5 w-full bg-[#2a3548] rounded-full overflow-hidden">
              <div className="h-full bg-[#b7c8e1] rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[#2a3548] border border-white/10 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-[#ffb95f] uppercase tracking-widest mb-1">Ações Rápidas</h3>
          <button 
            onClick={() => onNavigate('screens')}
            className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-[#152031] hover:bg-[#2f3a4c] transition-colors text-sm font-medium text-[#d8e3fb] group"
          >
            <PlusCircle className="text-[#b7c8e1] w-4 h-4 group-hover:scale-110 transition-transform" />
            Registrar Nova Tela
          </button>
          <button className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-[#152031] hover:bg-[#2f3a4c] transition-colors text-sm font-medium text-[#d8e3fb] group">
            <Upload className="text-[#b7c8e1] w-4 h-4 group-hover:scale-110 transition-transform" />
            Upload em Massa
          </button>
          <button 
            onClick={() => onNavigate('studio')}
            className="flex items-center gap-3 w-full p-2.5 rounded-lg bg-[#152031] hover:bg-[#2f3a4c] transition-colors text-sm font-medium text-[#d8e3fb] group"
          >
            <Megaphone className="text-[#b7c8e1] w-4 h-4 group-hover:scale-110 transition-transform" />
            Novo Anúncio / Agendamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ffb95f] rounded-full"></span>
              Registro de Telas Ativas
            </h2>
            <div className="bg-[#111c2d] rounded-xl border border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                      <th className="px-6 py-4">Informações da Tela</th>
                      <th className="px-6 py-4">Status & Energia</th>
                      <th className="px-6 py-4">Métricas (CPU/Temp)</th>
                      <th className="px-6 py-4">Conteúdo em Exibição</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {screens.length > 0 ? (
                      screens.map((screen) => (
                        <tr key={screen.id} className="group hover:bg-[#2a3548]/30 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-8 rounded bg-[#040e1f] flex items-center justify-center border border-white/5">
                                <Monitor className={`w-5 h-5 ${screen.status === 'online' ? 'text-[#b7c8e1]' : 'text-slate-700'}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    screen.status === 'online' ? 'bg-green-500' : 
                                    screen.status === 'offline' ? 'bg-red-500' : 
                                    'bg-yellow-500'
                                  }`}></span>
                                  <div className="font-bold text-[#d8e3fb]">{screen.name}</div>
                                </div>
                                <div className="text-[10px] text-slate-500">IP: {screen.ip} • {screen.model}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center w-fit gap-1 ${
                                screen.status === 'online' ? 'bg-green-500/10 text-green-500' : 
                                screen.status === 'offline' ? 'bg-red-500/10 text-red-500' : 
                                'bg-yellow-500/10 text-yellow-500'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  screen.status === 'online' ? 'bg-green-500' : 
                                  screen.status === 'offline' ? 'bg-red-500' : 
                                  'bg-yellow-500'
                                }`}></span>
                                {screen.status === 'online' ? 'Online' : screen.status === 'offline' ? 'Offline' : 'Aguardando'}
                              </span>
                              <span className={`text-[9px] font-bold ${screen.isPowerOn ? 'text-green-500' : 'text-red-500'}`}>
                                POWER: {screen.isPowerOn ? 'ON' : 'OFF'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">CPU</span>
                                <span className="text-xs font-bold text-slate-300">{screen.cpuUsage}%</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">TEMP</span>
                                <span className={`text-xs font-bold ${screen.temperature > 65 ? 'text-orange-400' : 'text-slate-300'}`}>
                                  {screen.temperature}°C
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-medium text-[#d8e3fb] truncate max-w-[150px]">{screen.currentContent}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase">{screen.lastSeen}</div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button 
                              onClick={() => onNavigate('screens')}
                              className="px-3 py-1.5 rounded bg-[#2a3548] text-[#b7c8e1] text-xs font-bold hover:bg-[#ffb95f] hover:text-[#472a00] transition-all"
                            >
                              Gerenciar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                          <Monitor className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p className="font-bold uppercase tracking-widest text-sm">Nenhum endpoint registrado</p>
                          <p className="text-xs mt-2 max-w-xs mx-auto">Vá para o gerenciamento de telas para adicionar sua primeira TV e começar a transmitir.</p>
                          <button 
                            onClick={() => onNavigate('screens')}
                            className="mt-6 px-6 py-2 bg-[#ffb95f] text-[#472a00] rounded-md text-xs font-bold hover:opacity-90 transition-all"
                          >
                            Registrar Primeira Tela
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ffb95f] rounded-full"></span>
              Conteúdo Agendado
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Culto de Domingo', time: 'Dom, 18:00 - 20:00', type: 'Anúncio', status: 'Agendado' },
                { title: 'Reunião de Oração', time: 'Ter, 19:30 - 21:00', type: 'Feed de Notícias', status: 'Agendado' }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#111c2d] p-4 rounded-xl border border-white/5 flex items-center justify-between group hover:border-[#ffb95f]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#2a3548] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#ffb95f]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#d8e3fb]">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{item.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#ffb95f] bg-[#ffb95f]/10 px-2 py-1 rounded-full">{item.status}</span>
                    <p className="text-[9px] text-slate-600 mt-1 uppercase font-bold">{item.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#b7c8e1] rounded-full"></span>
            Mídias Recentes
          </h2>
          <div className="space-y-3">
            {MEDIA_ASSETS.slice(0, 3).map((asset) => (
              <div key={asset.id} className="group relative aspect-video rounded-xl overflow-hidden bg-[#111c2d] cursor-pointer">
                <img src={asset.thumbnail} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040e1f]/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4 w-full flex justify-between items-end">
                  <div>
                    <h4 className="text-sm font-bold text-[#d8e3fb] truncate max-w-[180px]">{asset.title}</h4>
                    <span className="text-[10px] text-slate-400">{asset.quality || 'HD'} • {asset.duration} • {asset.updatedAt}</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-[#b7c8e1]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
