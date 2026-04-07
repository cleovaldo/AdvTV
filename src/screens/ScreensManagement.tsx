import { Monitor, RefreshCw, Power, Settings, Shield, Activity, Wifi, MapPin, Search, X, Plus, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { TVScreen } from '../types';
import { TV_SCREENS } from '../constants';
import { toast } from 'sonner';

export default function ScreensManagement() {
  const [screens, setScreens] = useState<TVScreen[]>(() => {
    const saved = localStorage.getItem('tv_screens');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error parsing tv_screens:', e);
      }
    }
    
    // If we've never initialized before, use defaults
    const initialized = localStorage.getItem('tv_screens_initialized');
    if (!initialized) {
      localStorage.setItem('tv_screens_initialized', 'true');
      localStorage.setItem('tv_screens', JSON.stringify(TV_SCREENS));
      return TV_SCREENS;
    }
    
    return [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New TV Form State
  const [newTV, setNewTV] = useState({
    name: '',
    ip: '',
    model: ''
  });

  // Save screens to localStorage whenever they change
  useEffect(() => {
    const saved = localStorage.getItem('tv_screens');
    const currentString = JSON.stringify(screens);
    if (saved !== currentString) {
      localStorage.setItem('tv_screens', currentString);
      // Ensure initialized flag is set if we have data
      if (screens.length > 0) {
        localStorage.setItem('tv_screens_initialized', 'true');
      }
    }
  }, [screens]);

  // Listen for storage changes to keep screens in sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tv_screens' && e.newValue !== null) {
        try {
          const newScreens = JSON.parse(e.newValue);
          // Only update if different to avoid unnecessary re-renders
          if (JSON.stringify(newScreens) !== JSON.stringify(screens)) {
            setScreens(newScreens);
          }
        } catch (err) {
          console.error('Error syncing screens from storage:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [screens]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.info('Atualizando status dos dispositivos...', {
      description: 'Verificando conectividade com todos os endpoints.'
    });
    
    // In a real app, this would fetch from the server
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Status atualizado!', {
        description: 'Todos os dispositivos foram verificados com sucesso.'
      });
    }, 2000);
  };

  const handlePowerToggle = async (screen: TVScreen) => {
    const newPowerState = !screen.isPowerOn;
    try {
      const response = await fetch(`/api/screens/${screen.id}/power`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ power: newPowerState })
      });

      if (!response.ok) throw new Error('Falha ao alterar energia');

      setScreens(prev => prev.map(s => s.id === screen.id ? { ...s, isPowerOn: newPowerState, status: newPowerState ? 'online' : 'offline' } : s));
      
      toast.success(newPowerState ? 'TV Ligada' : 'TV Desligada', {
        description: `${screen.name} foi ${newPowerState ? 'ligada' : 'desligada'} remotamente.`,
        icon: newPowerState ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Power className="w-4 h-4 text-red-500" />
      });
    } catch (error) {
      toast.error('Erro de Comando', { description: 'Não foi possível enviar o comando de energia.' });
    }
  };

  const handleRestart = async (screen: TVScreen) => {
    toast.promise(
      async () => {
        const response = await fetch(`/api/screens/${screen.id}/restart`, { method: 'POST' });
        if (!response.ok) throw new Error();
        
        // Simulate offline then online
        setScreens(prev => prev.map(s => s.id === screen.id ? { ...s, status: 'offline' } : s));
        setTimeout(() => {
          setScreens(prev => prev.map(s => s.id === screen.id ? { ...s, status: 'online' } : s));
        }, 5000);
      },
      {
        loading: `Reiniciando ${screen.name}...`,
        success: `${screen.name} está reiniciando.`,
        error: `Falha ao reiniciar ${screen.name}.`,
      }
    );
  };

  // Polling for metrics
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/screens/metrics');
        if (response.ok) {
          const metrics = await response.json();
          setScreens(prev => prev.map(s => {
            if (metrics[s.id]) {
              return { ...s, ...metrics[s.id] };
            }
            return s;
          }));
        }
      } catch (e) {
        // Silent fail for polling
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterTV = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTV.name || !newTV.ip || !newTV.model) {
      toast.error('Campos obrigatórios', {
        description: 'Por favor, preencha todos os campos para registrar a TV.'
      });
      return;
    }

    // Robust IPv4 validation (0-255 for each octet)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ipRegex.test(newTV.ip)) {
      toast.error('IP Inválido', {
        description: 'O endereço IP deve estar no formato XXX.XXX.XXX.XXX (0-255).'
      });
      return;
    }

    // Check for network (.0) or broadcast (.255) addresses
    const lastOctet = parseInt(newTV.ip.split('.').pop() || '0', 10);
    if (lastOctet === 0 || lastOctet === 255) {
      toast.error('Endereço Reservado', {
        description: 'Endereços terminados em .0 ou .255 são geralmente reservados para rede ou broadcast.'
      });
      return;
    }

    const newScreen: TVScreen = {
      id: `s-${Date.now()}`,
      name: newTV.name,
      ip: newTV.ip,
      model: newTV.model,
      status: 'waiting',
      currentContent: 'Sem transmissão ativa',
      lastSeen: 'Agora mesmo',
      latency: 0,
      cpuUsage: 0,
      gpuUsage: 0,
      temperature: 20,
      isPowerOn: true
    };

    setScreens(prev => [...prev, newScreen]);
    setIsModalOpen(false);
    setNewTV({ name: '', ip: '', model: '' });
    
    toast.success('TV Registrada!', {
      description: `${newScreen.name} foi adicionada com sucesso e está aguardando conexão.`
    });

    // Simulate connection after 3 seconds
    setTimeout(() => {
      setScreens(prev => prev.map(s => s.id === newScreen.id ? { ...s, status: 'online' } : s));
      toast.success(`${newScreen.name} está Online`, {
        icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
      });
    }, 3000);
  };

  const handleDeleteScreen = (id: string, name: string) => {
    setScreens(prev => prev.filter(s => s.id !== id));
    toast.success('Dispositivo removido', {
      description: `${name} foi removido do gerenciamento.`
    });
  };

  const filteredScreens = screens.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.ip.includes(searchTerm) ||
    s.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar relative">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-extrabold text-[#d8e3fb] tracking-tight mb-2">Gerenciamento de Telas</h2>
          <p className="text-slate-400 max-w-lg">Monitore o status, IP e conteúdo de todos os endpoints de hardware conectados à rede do santuário.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2a3548] text-[#d8e3fb] rounded-md text-sm font-bold hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar Status'}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ffb95f] text-[#472a00] rounded-md text-sm font-bold shadow-lg shadow-[#ffb95f]/10 hover:opacity-90 transition-all"
          >
            <Monitor className="w-4 h-4" />
            Registrar Nova TV
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#111c2d] p-6 rounded-xl border border-white/5 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#ffb95f]/10 flex items-center justify-center">
            <Activity className="text-[#ffb95f] w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uptime da Rede</p>
            <p className="text-2xl font-black text-[#d8e3fb]">99.8%</p>
          </div>
        </div>
        <div className="bg-[#111c2d] p-6 rounded-xl border border-white/5 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#b7c8e1]/10 flex items-center justify-center">
            <Wifi className="text-[#b7c8e1] w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latência Média</p>
            <p className="text-2xl font-black text-[#d8e3fb]">12ms</p>
          </div>
        </div>
        <div className="bg-[#111c2d] p-6 rounded-xl border border-white/5 flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-[#b9c8de]/10 flex items-center justify-center">
            <Shield className="text-[#b9c8de] w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Segurança de Endpoint</p>
            <p className="text-2xl font-black text-[#d8e3fb]">Ativa</p>
          </div>
        </div>
      </div>

      {/* Screens Table */}
      <div className="bg-[#111c2d] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-lg">Endpoints Conectados</h3>
            <span className="px-2 py-0.5 rounded bg-[#2a3548] text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {screens.filter(s => s.status === 'online').length} Ativos
            </span>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Filtrar por nome ou IP..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#081425] border-none text-xs rounded-md pl-10 pr-4 py-2 w-64 outline-none focus:ring-1 focus:ring-[#b7c8e1]" 
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                <th className="px-8 py-4">Informações da Tela</th>
                <th className="px-8 py-4">Status & Energia</th>
                <th className="px-8 py-4">Métricas (CPU/GPU/Temp)</th>
                <th className="px-8 py-4">Conteúdo em Exibição</th>
                <th className="px-8 py-4 text-right">Controles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredScreens.map((screen) => (
                <tr key={screen.id} className="group hover:bg-[#2a3548]/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-10 rounded bg-[#081425] border border-white/5 flex items-center justify-center relative overflow-hidden">
                        <Monitor className={`w-6 h-6 ${screen.status === 'online' ? 'text-[#b7c8e1]' : 'text-slate-700'}`} />
                        {screen.status === 'online' && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#ffb95f]/10 to-transparent"></div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            screen.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                            screen.status === 'offline' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                            'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                          }`}></span>
                          <p className="font-bold text-[#d8e3fb]">{screen.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-slate-500 font-medium">{screen.model} • {screen.ip}</p>
                          {screen.status === 'online' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                              {screen.latency}ms
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          screen.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                          screen.status === 'offline' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                          'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'
                        }`}></span>
                        <span className={`text-xs font-bold uppercase tracking-widest ${
                          screen.status === 'online' ? 'text-green-500' : 
                          screen.status === 'offline' ? 'text-red-500' : 'text-yellow-500'
                        }`}>{screen.status === 'online' ? 'Online' : screen.status === 'offline' ? 'Offline' : 'Aguardando'}</span>
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded inline-block ${screen.isPowerOn ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        POWER: {screen.isPowerOn ? 'ON' : 'OFF'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-3 w-48">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                          <span>CPU</span>
                          <span className={screen.cpuUsage > 80 ? 'text-red-400' : 'text-slate-300'}>{screen.cpuUsage}%</span>
                        </div>
                        <div className="h-1 w-full bg-[#081425] rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${screen.cpuUsage > 80 ? 'bg-red-500' : 'bg-[#b7c8e1]'}`} 
                            style={{ width: `${screen.cpuUsage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">GPU</span>
                            <span className="text-xs font-bold text-slate-300">{screen.gpuUsage}%</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-500 uppercase">TEMP</span>
                            <span className={`text-xs font-bold ${screen.temperature > 65 ? 'text-orange-400' : 'text-slate-300'}`}>
                              {screen.temperature}°C
                            </span>
                          </div>
                        </div>
                        {screen.temperature > 65 && (
                          <AlertCircle className="w-3 h-3 text-orange-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-[#d8e3fb] mb-1 truncate max-w-[150px]">{screen.currentContent}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Visto: {screen.lastSeen}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          localStorage.setItem('display_screen_id', screen.id);
                          window.open('/display?mode=display', '_blank');
                        }}
                        className="p-2 rounded-md bg-[#2a3548] text-slate-400 hover:text-blue-400 transition-colors" 
                        title="Visualizar Tela"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleRestart(screen)}
                        className="p-2 rounded-md bg-[#2a3548] text-slate-400 hover:text-[#ffb95f] transition-colors" 
                        title="Reiniciar Sistema"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handlePowerToggle(screen)}
                        className={`p-2 rounded-md bg-[#2a3548] transition-colors ${screen.isPowerOn ? 'text-green-500 hover:text-red-500' : 'text-red-500 hover:text-green-500'}`} 
                        title={screen.isPowerOn ? 'Desligar' : 'Ligar'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteScreen(screen.id, screen.name)}
                        className="p-2 rounded-md bg-[#2a3548] text-slate-400 hover:text-red-400 transition-colors" 
                        title="Remover Dispositivo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredScreens.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-500">
                    <Monitor className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest">Nenhum endpoint encontrado</p>
                    <p className="text-xs mt-2">Tente ajustar seus filtros ou registre uma nova TV.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111c2d] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#152031] to-[#111c2d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ffb95f]/10 flex items-center justify-center">
                  <Monitor className="text-[#ffb95f] w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#d8e3fb]">Registrar Nova TV</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Adicionar endpoint à rede</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <form onSubmit={handleRegisterTV} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Identificador</label>
                <input 
                  type="text" 
                  placeholder="Ex: Lobby Welcome Wall" 
                  value={newTV.name}
                  onChange={(e) => setNewTV({...newTV, name: e.target.value})}
                  className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Endereço IP</label>
                  <input 
                    type="text" 
                    placeholder="192.168.1.XX" 
                    value={newTV.ip}
                    onChange={(e) => setNewTV({...newTV, ip: e.target.value})}
                    className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Modelo/Hardware</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Samsung Q70" 
                    value={newTV.model}
                    onChange={(e) => setNewTV({...newTV, model: e.target.value})}
                    className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-[#2a3548] text-[#d8e3fb] font-bold rounded-lg hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-[#ffb95f] text-[#472a00] font-bold rounded-lg shadow-lg shadow-[#ffb95f]/10 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Confirmar Registro
                </button>
              </div>
            </form>
            
            <div className="p-4 bg-[#081425]/50 border-t border-white/5 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#b7c8e1] shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Certifique-se de que o hardware está ligado e conectado à mesma sub-rede (VLAN 10) para que o diagnóstico automático funcione corretamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Diagnostic */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#152031] to-[#111c2d] rounded-xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-[#081425] flex items-center justify-center border border-white/5">
            <Activity className="text-[#b7c8e1] w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#d8e3fb]">Diagnóstico de Rede em Tempo Real</h4>
            <p className="text-sm text-slate-400">Todos os sistemas estão operando normalmente. Nenhuma anomalia detectada nos últimos 7 dias.</p>
          </div>
        </div>
        <button className="px-8 py-3 bg-[#b7c8e1] text-[#213145] font-bold rounded-md hover:opacity-90 transition-all">
          Ver Relatório Completo
        </button>
      </div>
    </div>
  );
}
