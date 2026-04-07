import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Globe, Monitor, Shield, Bell, Database, Cloud, Save, RefreshCw, Info, Users, UserPlus, Trash2, Edit2, Mail, Key, ShieldCheck, ChevronRight, Search, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { USERS, TV_SCREENS } from '../constants';
import { User, TVScreen } from '../types';

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('system_users');
    return saved ? JSON.parse(saved) : USERS as User[];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'admin', status: 'active' });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [availableScreens, setAvailableScreens] = useState<TVScreen[]>(() => {
    const saved = localStorage.getItem('tv_screens');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error parsing tv_screens in settings:', e);
      }
    }
    
    // If we've never initialized before, use defaults
    const initialized = localStorage.getItem('tv_screens_initialized');
    if (!initialized) {
      return TV_SCREENS;
    }
    
    return [];
  });

  const [systemLocation, setSystemLocation] = useState(() => {
    return localStorage.getItem('system_location') || 'São Paulo, Brasil';
  });

  // Persist users to localStorage
  useEffect(() => {
    localStorage.setItem('system_users', JSON.stringify(users));
  }, [users]);

  // Sync screens from localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tv_screens' && e.newValue !== null) {
        try {
          const newScreens = JSON.parse(e.newValue);
          if (JSON.stringify(newScreens) !== JSON.stringify(availableScreens)) {
            setAvailableScreens(newScreens);
          }
        } catch (err) {
          console.error('Error syncing screens in settings:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [availableScreens]);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('system_location', systemLocation);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configurações Salvas', {
        description: 'As alterações foram aplicadas com sucesso em todo o sistema.'
      });
    }, 1500);
  };

  const handleResetPassword = (user: User) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: 'Gerando nova senha...',
        success: `Senha resetada para ${user.name}. Uma nova senha temporária foi enviada para ${user.email}.`,
        error: 'Erro ao resetar senha.',
      }
    );
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    const user: User = {
      id: `u-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as 'admin' | 'screen',
      status: newUser.status as 'active' | 'inactive' | 'pending',
      password: 'password123', // Default password
    };
    setUsers([...users, user]);
    setIsAddUserModalOpen(false);
    setNewUser({ role: 'admin', status: 'active' });
    toast.success('Usuário adicionado com sucesso');
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser?.name || !editingUser?.email) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setIsEditUserModalOpen(false);
    setEditingUser(null);
    toast.success('Usuário atualizado com sucesso');
  };

  const handleDeleteUser = (id: string) => {
    if (id === 'u1') {
      toast.error('Não é possível excluir o administrador principal');
      return;
    }
    setUsers(users.filter(u => u.id !== id));
    toast.success('Usuário removido');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-extrabold text-[#d8e3fb] tracking-tight mb-2">Configurações do Sistema</h2>
          <p className="text-slate-400 max-w-lg">Gerencie as preferências globais, usuários e parâmetros de segurança da rede Batista & Saraiva TV.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex bg-[#111c2d] p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'general' ? 'bg-[#ffb95f] text-[#472a00]' : 'text-slate-400 hover:text-white'}`}
            >
              Geral
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-[#ffb95f] text-[#472a00]' : 'text-slate-400 hover:text-white'}`}
            >
              Usuários
            </button>
          </div>
          {activeTab === 'general' && (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-[#ffb95f] text-[#472a00] rounded-md font-bold shadow-lg shadow-[#ffb95f]/10 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          )}
        </div>
      </header>

      {activeTab === 'general' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - General & Network */}
          <div className="lg:col-span-2 space-y-8">
            {/* Network Settings */}
            <section className="bg-[#111c2d] rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <Globe className="text-[#b7c8e1] w-5 h-5" />
                <h3 className="font-bold text-lg">Conectividade e Rede</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Endereço do Servidor Central</label>
                    <input 
                      type="text" 
                      defaultValue="https://server-batista-saraiva-broadcast.local"
                      className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Porta de Transmissão (UDP/TCP)</label>
                    <input 
                      type="text" 
                      defaultValue="3000"
                      className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Localização (Cidade/Estado)</label>
                    <input 
                      type="text" 
                      value={systemLocation}
                      onChange={(e) => setSystemLocation(e.target.value)}
                      placeholder="Ex: São Paulo, SP"
                      className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#081425] rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Cloud className="text-green-500 w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Sincronização em Nuvem</p>
                      <p className="text-[10px] text-slate-500">Backup automático de playlists e configurações</p>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffb95f]"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Display Preferences */}
            <section className="bg-[#111c2d] rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <Monitor className="text-[#ffb95f] w-5 h-5" />
                <h3 className="font-bold text-lg">Preferências de Exibição</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Resolução Padrão</label>
                    <select className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all appearance-none">
                      <option>Ultra HD (4K) - 3840x2160</option>
                      <option>Full HD (1080p) - 1920x1080</option>
                      <option>HD (720p) - 1280x720</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Transição de Slides (Segundos)</label>
                    <input 
                      type="number" 
                      defaultValue="15"
                      className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#081425] rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#b7c8e1]/10 flex items-center justify-center">
                      <Bell className="text-[#b7c8e1] w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Alertas de Emergência</p>
                      <p className="text-[10px] text-slate-500">Sobrepor conteúdo atual com avisos urgentes</p>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffb95f]"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Security & Info */}
          <div className="space-y-8">
            {/* Security Settings */}
            <section className="bg-[#111c2d] rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <Shield className="text-red-400 w-5 h-5" />
                <h3 className="font-bold text-lg">Segurança</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Senha de Acesso ao Painel</label>
                  <input 
                    type="password" 
                    defaultValue="••••••••••••"
                    className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                  />
                </div>
                <button className="w-full py-3 bg-[#2a3548] text-[#d8e3fb] font-bold rounded-lg text-xs hover:bg-slate-700 transition-all uppercase tracking-widest">
                  Alterar Chave de API
                </button>
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Autenticação em 2 Fatores</span>
                    <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">ATIVO</span>
                  </div>
                </div>
              </div>
            </section>

            {/* System Info */}
            <section className="bg-[#111c2d] rounded-2xl border border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center gap-3">
                <Info className="text-[#b7c8e1] w-5 h-5" />
                <h3 className="font-bold text-lg">Sobre o Sistema</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Versão do Software</span>
                  <span className="text-xs font-bold text-[#d8e3fb]">v4.2.0-stable</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Última Atualização</span>
                  <span className="text-xs font-bold text-[#d8e3fb]">24 Mar 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Licença</span>
                  <span className="text-xs font-bold text-[#ffb95f]">Enterprise Batista & Saraiva TV</span>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <button className="w-full flex items-center justify-center gap-2 py-3 text-[#b7c8e1] font-bold text-xs hover:bg-white/5 rounded-lg transition-all">
                    <RefreshCw className="w-3 h-3" />
                    Verificar Atualizações
                  </button>
                </div>
              </div>
            </section>

            {/* Database Info */}
            <div className="bg-gradient-to-br from-[#152031] to-[#111c2d] p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#ffb95f]/10 flex items-center justify-center">
                  <Database className="text-[#ffb95f] w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold">Armazenamento Local</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Cache de Mídia</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500">12.4 GB / 50 GB</span>
                  <span className="text-[#ffb95f]">25%</span>
                </div>
                <div className="h-1.5 w-full bg-[#081425] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ffb95f] rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* User Management Section */}
          <section className="bg-[#111c2d] rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="text-[#ffb95f] w-5 h-5" />
                <h3 className="font-bold text-lg">Gerenciamento de Usuários</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Buscar usuários..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#081425] border border-white/5 rounded-lg pl-10 pr-4 py-2 text-xs text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] w-64"
                  />
                </div>
                <button 
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#ffb95f] text-[#472a00] rounded-lg text-xs font-bold hover:opacity-90 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Novo Usuário
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0d1726]">
                    <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Usuário</th>
                    <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">E-mail</th>
                    <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Função</th>
                    <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Último Acesso</th>
                    <th className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffb95f]/20 to-[#ffb95f]/5 flex items-center justify-center border border-[#ffb95f]/10">
                            <span className="text-[#ffb95f] font-bold text-sm">{user.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-[#ffb95f] transition-colors">{user.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className="w-3 h-3" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          {user.role === 'admin' ? (
                            <ShieldCheck className="w-4 h-4 text-[#ffb95f]" />
                          ) : (
                            <Monitor className="w-4 h-4 text-blue-400" />
                          )}
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                            user.role === 'admin' ? 'bg-[#ffb95f]/10 text-[#ffb95f]' : 'bg-blue-400/10 text-blue-400'
                          }`}>
                            {user.role === 'admin' ? 'Administrador' : 'Terminal/Tela'}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            user.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                            user.status === 'pending' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' :
                            'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                          }`}></div>
                          <span className="text-xs text-slate-400 capitalize">{user.status}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-xs text-slate-500">{user.id === 'u1' ? 'Agora mesmo' : 'Há 2 horas'}</span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleResetPassword(user)}
                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-[#ffb95f] transition-all"
                            title="Resetar Senha"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                            title="Editar Usuário"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="p-20 text-center">
                  <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-500">Nenhum usuário encontrado com "{searchQuery}"</p>
                </div>
              )}
            </div>
          </section>

          {/* Security Summary for Users */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111c2d] p-6 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <ShieldCheck className="text-green-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{users.length}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total de Usuários</p>
              </div>
            </div>
            <div className="bg-[#111c2d] p-6 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#ffb95f]/10 flex items-center justify-center">
                <Shield className="text-[#ffb95f] w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{users.filter(u => u.role === 'admin').length}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Administradores</p>
              </div>
            </div>
            <div className="bg-[#111c2d] p-6 rounded-2xl border border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Monitor className="text-blue-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{availableScreens.filter(s => s.status === 'online').length}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Terminais Online</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditUserModalOpen(false)}></div>
          <div className="relative bg-[#111c2d] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Edit2 className="text-blue-400 w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Editar Usuário</h3>
              </div>
              <button onClick={() => setIsEditUserModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                <input 
                  type="email" 
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Status</label>
                <select 
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value as any})}
                  className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all appearance-none"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
            </div>
            
            <div className="p-6 bg-[#0d1726] border-t border-white/5 flex gap-3">
              <button 
                onClick={() => setIsEditUserModalOpen(false)}
                className="flex-1 py-3 text-slate-400 font-bold text-xs hover:text-white transition-all uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpdateUser}
                className="flex-[2] py-3 bg-[#ffb95f] text-[#472a00] font-bold rounded-lg text-xs hover:opacity-90 transition-all uppercase tracking-widest shadow-lg shadow-[#ffb95f]/10"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddUserModalOpen(false)}></div>
          <div className="relative bg-[#111c2d] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffb95f]/10 flex items-center justify-center">
                  <UserPlus className="text-[#ffb95f] w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Novo Usuário</h3>
              </div>
              <button onClick={() => setIsAddUserModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Ex: João Silva"
                  value={newUser.name || ''}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                <input 
                  type="email" 
                  placeholder="usuario@batistasaraiva.tv"
                  value={newUser.email || ''}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Função no Sistema</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setNewUser({...newUser, role: 'admin'})}
                    className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                      newUser.role === 'admin' ? 'bg-[#ffb95f]/10 border-[#ffb95f] text-[#ffb95f]' : 'bg-[#081425] border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Administrador
                  </button>
                  <button 
                    onClick={() => setNewUser({...newUser, role: 'screen'})}
                    className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                      newUser.role === 'screen' ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-[#081425] border-white/5 text-slate-500 hover:border-white/10'
                    }`}
                  >
                    <Monitor className="w-5 h-5" />
                    Terminal/Tela
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Status Inicial</label>
                <select 
                  value={newUser.status}
                  onChange={(e) => setNewUser({...newUser, status: e.target.value as any})}
                  className="w-full bg-[#081425] border border-white/5 rounded-lg px-4 py-3 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f] transition-all appearance-none"
                >
                  <option value="active">Ativo</option>
                  <option value="pending">Pendente</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-[10px] text-blue-300 leading-relaxed">
                  Uma senha temporária será gerada automaticamente e enviada para o e-mail informado. O usuário deverá alterá-la no primeiro acesso.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-[#0d1726] border-t border-white/5 flex gap-3">
              <button 
                onClick={() => setIsAddUserModalOpen(false)}
                className="flex-1 py-3 text-slate-400 font-bold text-xs hover:text-white transition-all uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddUser}
                className="flex-[2] py-3 bg-[#ffb95f] text-[#472a00] font-bold rounded-lg text-xs hover:opacity-90 transition-all uppercase tracking-widest shadow-lg shadow-[#ffb95f]/10"
              >
                Criar Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
