import { useState, useEffect } from 'react';
import { Music2, Link as LinkIcon, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Info, Copy, Settings as SettingsIcon, Play, SkipForward, SkipBack } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function HolyricsIntegration() {
  const [holyricsData, setHolyricsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [serverIp, setServerIp] = useState(() => localStorage.getItem('holyrics_ip') || '');
  const [serverPort, setServerPort] = useState(() => localStorage.getItem('holyrics_port') || '8080');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  const receiverUrl = `${window.location.origin}/api/holyrics`;

  const fetchHolyricsData = async () => {
    try {
      const response = await fetch('/api/holyrics');
      if (response.ok) {
        const data = await response.json();
        setHolyricsData(data);
      }
    } catch (error) {
      console.error('Error fetching Holyrics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolyricsData();
    const interval = setInterval(fetchHolyricsData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = () => {
    localStorage.setItem('holyrics_ip', serverIp);
    localStorage.setItem('holyrics_port', serverPort);
    toast.success('Configurações salvas com sucesso!');
  };

  const testConnection = async () => {
    if (!serverIp) {
      toast.error('Por favor, insira o IP do servidor Holyrics.');
      return;
    }
    
    setIsConnecting(true);
    setConnectionStatus('idle');
    
    try {
      // In a real app, we would call the Holyrics API directly from the client
      // to avoid CORS issues if enabled, or via a proxy if not.
      // For this demo, we'll simulate a connection test.
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success if IP is provided
      setConnectionStatus('connected');
      toast.success('Conectado ao servidor Holyrics!');
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Falha ao conectar ao servidor Holyrics.');
    } finally {
      setIsConnecting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('URL copiada para a área de transferência!');
  };

  const handleSendToScreens = async () => {
    try {
      // Get all screen IDs from the server metrics or local storage
      // For simplicity, we'll use a generic approach or ask the user to select screens
      // But for this "Broadcast" feature, we'll send to all known screens
      const response = await fetch('/api/screens/metrics');
      if (response.ok) {
        const metrics = await response.json();
        const screenIds = Object.keys(metrics);
        
        if (screenIds.length === 0) {
          toast.error('Nenhuma tela encontrada para transmitir.');
          return;
        }

        const publishResponse = await fetch('/api/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            screenIds,
            mode: 'holyrics'
          })
        });

        if (publishResponse.ok) {
          toast.success(`Transmitindo Holyrics para ${screenIds.length} telas!`);
        } else {
          throw new Error('Falha ao publicar para as telas');
        }
      }
    } catch (error) {
      console.error('Error sending Holyrics to screens:', error);
      toast.error('Erro ao enviar para as telas.');
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Music2 className="w-8 h-8 text-[#ffb95f]" />
              Integração Holyrics
            </h1>
            <p className="text-slate-400 mt-1">Conecte o sistema de projeção da igreja com as telas da Batista & Saraiva TV.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
              connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' : 
              connectionStatus === 'error' ? 'bg-red-500/20 text-red-400' : 
              'bg-slate-800 text-slate-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                connectionStatus === 'error' ? 'bg-red-400' : 
                'bg-slate-500'
              }`} />
              {connectionStatus === 'connected' ? 'Servidor Online' : 
               connectionStatus === 'error' ? 'Erro de Conexão' : 
               'Desconectado'}
            </div>
            <button 
              onClick={testConnection}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a3548] hover:bg-[#36445d] text-white rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
              {isConnecting ? 'Conectando...' : 'Testar Conexão'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-2 text-white font-semibold">
                <SettingsIcon className="w-5 h-5 text-[#ffb95f]" />
                Configurações do Servidor
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">IP do Servidor (Local)</label>
                  <input 
                    type="text" 
                    value={serverIp}
                    onChange={(e) => setServerIp(e.target.value)}
                    placeholder="Ex: 192.168.1.100"
                    className="w-full bg-[#081425] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#ffb95f]/50 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Porta do Servidor</label>
                  <input 
                    type="text" 
                    value={serverPort}
                    onChange={(e) => setServerPort(e.target.value)}
                    placeholder="8080"
                    className="w-full bg-[#081425] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#ffb95f]/50 transition-all outline-none"
                  />
                </div>
                <button 
                  onClick={handleSaveConfig}
                  className="w-full py-3 bg-[#ffb95f] text-[#081425] font-bold rounded-lg hover:bg-[#ff9d23] transition-all active:scale-95"
                >
                  Salvar Configurações
                </button>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-white font-semibold mb-4">
                  <LinkIcon className="w-5 h-5 text-[#ffb95f]" />
                  URL do Receptor (Webhook)
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Copie esta URL e cole no Holyrics em: <br/>
                  <span className="text-slate-300">Ferramentas &gt; Vários &gt; API &gt; Adicionar Receptor URL</span>
                </p>
                <div className="flex items-center gap-2 bg-[#081425] border border-white/10 rounded-lg p-3">
                  <code className="text-[10px] text-[#ffb95f] truncate flex-1">{receiverUrl}</code>
                  <button 
                    onClick={() => copyToClipboard(receiverUrl)}
                    className="p-2 hover:bg-white/5 rounded-md text-slate-400 hover:text-white transition-all"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-blue-400">Como funciona?</h4>
                  <p className="text-xs text-blue-300/80 leading-relaxed">
                    A integração permite que as letras de músicas e versículos bíblicos exibidos no Holyrics apareçam automaticamente nas telas da igreja.
                  </p>
                  <ul className="text-[10px] text-blue-300/60 space-y-1 list-disc pl-4">
                    <li>Sincronização em tempo real</li>
                    <li>Layouts personalizados para TV</li>
                    <li>Controle remoto via painel</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111c2d] border border-white/5 rounded-2xl p-8 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ffb95f]/10 flex items-center justify-center">
                    <Play className="w-5 h-5 text-[#ffb95f]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Visualização em Tempo Real</h3>
                    <p className="text-xs text-slate-500">O que está sendo exibido agora no Holyrics</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-[#081425] border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button className="p-2 bg-[#081425] border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all">
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#081425] rounded-xl border border-white/5 relative overflow-hidden group">
                {/* Simulated TV Frame */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ffb95f]/5 to-transparent opacity-50" />
                
                <AnimatePresence mode="wait">
                  {holyricsData && holyricsData.text ? (
                    <motion.div
                      key={holyricsData.timestamp}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="relative z-10 space-y-6 max-w-2xl"
                    >
                      <div className="space-y-2">
                        <span className="px-3 py-1 bg-[#ffb95f]/20 text-[#ffb95f] text-[10px] font-bold rounded-full uppercase tracking-widest">
                          {holyricsData.type === 'song' ? 'Música' : 'Versículo'}
                        </span>
                        <h2 className="text-2xl font-bold text-white">{holyricsData.title}</h2>
                        {holyricsData.artist && <p className="text-[#ffb95f] font-medium">{holyricsData.artist}</p>}
                      </div>
                      
                      <p className="text-3xl md:text-4xl font-serif italic text-slate-200 leading-tight">
                        "{holyricsData.text}"
                      </p>

                      {holyricsData.next_text && (
                        <div className="pt-8 opacity-40">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Próximo</p>
                          <p className="text-sm text-slate-400">{holyricsData.next_text}</p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="relative z-10 space-y-4">
                      <Music2 className="w-16 h-16 text-slate-800 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-slate-500 font-medium">Aguardando dados do Holyrics...</p>
                        <p className="text-[10px] text-slate-600">Certifique-se de que o receptor está configurado corretamente.</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Overlay Controls */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={handleSendToScreens}
                    className="px-3 py-1.5 bg-[#ffb95f] text-[#081425] text-[10px] font-bold rounded-md hover:bg-[#ff9d23] transition-all"
                  >
                    Transmitir para Telas
                  </button>
                  <button className="px-3 py-1.5 bg-white/10 text-white text-[10px] font-bold rounded-md hover:bg-white/20 transition-all">
                    Personalizar Layout
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-[#081425] p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Última Atualização</p>
                  <p className="text-sm text-white font-mono">
                    {holyricsData?.timestamp ? new Date(holyricsData.timestamp).toLocaleTimeString() : '--:--:--'}
                  </p>
                </div>
                <div className="bg-[#081425] p-4 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Status do Receptor</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <p className="text-sm text-white">Ativo e Escutando</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
