import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Calendar, MapPin, Radio, Heart, Users, ChevronRight, ChevronLeft, Info, Monitor, CheckCircle2, AlertCircle, Tv, Cloud, Sun, CloudRain, CloudLightning, Wind } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { TV_SCREENS, PLAYLIST_ITEMS } from '../constants';
import { TVScreen, PlaylistItem } from '../types';

interface PublicDisplayProps {
  userRole?: string;
  onExit: () => void;
}

export default function PublicDisplay({ userRole, onExit }: PublicDisplayProps) {
  const [screenId, setScreenId] = useState<string | null>(localStorage.getItem('display_screen_id'));
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [time, setTime] = useState(new Date());
  const [availableScreens, setAvailableScreens] = useState<TVScreen[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [systemLocation, setSystemLocation] = useState(() => {
    return localStorage.getItem('system_location') || 'Salvador, BA';
  });
  const [weather, setWeather] = useState<{ temp: number; condition: string; icon: string }>({
    temp: 28,
    condition: 'Ensolarado',
    icon: 'sun'
  });
  const lastTimestampRef = useRef(0);

  const fetchWeather = async () => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return;

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Obtenha a previsão do tempo atual para Salvador, BA. Use especificamente as informações desta URL: https://www.accuweather.com/pt/br/salvador/43080/weather-forecast/43080?type=locality. Retorne APENAS um objeto JSON com: 'temp' (número em Celsius), 'condition' (string curta em português, ex: 'Ensolarado', 'Nublado', 'Chuva') e 'icon' (uma das seguintes strings: 'sun', 'cloud', 'rain', 'lightning', 'wind').",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              temp: { type: Type.NUMBER },
              condition: { type: Type.STRING },
              icon: { type: Type.STRING, enum: ['sun', 'cloud', 'rain', 'lightning', 'wind'] }
            },
            required: ['temp', 'condition', 'icon']
          },
          tools: [{ googleSearch: {} }]
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setWeather(data);
        console.log('Weather updated:', data);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 1000 * 60 * 30); // Refresh every 30 minutes
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun': return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'cloud': return <Cloud className="w-4 h-4 text-slate-400" />;
      case 'rain': return <CloudRain className="w-4 h-4 text-blue-400" />;
      case 'lightning': return <CloudLightning className="w-4 h-4 text-purple-400" />;
      case 'wind': return <Wind className="w-4 h-4 text-slate-300" />;
      default: return <Sun className="w-4 h-4 text-yellow-400" />;
    }
  };

  const isScreenUser = userRole === 'screen';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load screens from localStorage to have the latest list
  useEffect(() => {
    const loadScreens = () => {
      const saved = localStorage.getItem('tv_screens');
      if (saved) {
        try {
          const screens = JSON.parse(saved);
          if (Array.isArray(screens)) {
            setAvailableScreens(screens);
          } else {
            setAvailableScreens([]);
          }
        } catch (e) {
          console.error('Error loading screens:', e);
          setAvailableScreens([]);
        }
      } else {
        // If not in localStorage, check if initialized
        const initialized = localStorage.getItem('tv_screens_initialized');
        if (!initialized) {
          setAvailableScreens(TV_SCREENS);
        } else {
          setAvailableScreens([]);
        }
      }
    };

    loadScreens();

    // Heartbeat to mark this screen as online
    const heartbeat = setInterval(() => {
      if (!screenId) return;
      
      const saved = localStorage.getItem('tv_screens');
      if (!saved) return;
      
      try {
        let screens = JSON.parse(saved);
        if (!Array.isArray(screens)) return;
        
        let found = false;
        const updatedScreens = screens.map((s: TVScreen) => {
          if (s.id === screenId) {
            found = true;
            return { ...s, status: 'online', lastSeen: 'Agora mesmo' };
          }
          return s;
        });

        // Only write back if something actually changed
        if (found) {
          const updatedString = JSON.stringify(updatedScreens);
          
          // Re-read from localStorage right before writing to minimize race conditions
          const latestSaved = localStorage.getItem('tv_screens');
          if (updatedString !== latestSaved) {
            localStorage.setItem('tv_screens', updatedString);
            setAvailableScreens(updatedScreens);
          }
        } else if (screenId.startsWith('s-')) {
          // If this is a newly registered screen (s-timestamp format) but not in the list,
          // it might have been deleted from another tab, so we don't re-add it automatically
          // to avoid "zombie" screens.
        }
      } catch (e) {
        console.error('Error in public display heartbeat:', e);
      }
    }, 5000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tv_screens') {
        loadScreens();
      }
      if (e.key === 'display_screen_id') {
        setScreenId(e.newValue);
      }
      if (e.key === 'system_location') {
        setSystemLocation(e.newValue || 'São Paulo, Brasil');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Poll for content if screenId is set
  useEffect(() => {
    if (!screenId) return;

    const poll = async () => {
      try {
        console.log(`Polling content for screen: ${screenId}...`);
        const response = await fetch(`/api/screens/${screenId}/content`);
        if (response.ok) {
          const data = await response.json();
          console.log(`Received data for ${screenId}:`, data);
          
          // Use refs to avoid stale closure issues with 'lastTimestamp'
          const hasNewTimestamp = data.timestamp > lastTimestampRef.current;
          const isInitialLoad = lastTimestampRef.current === 0 && data.playlist && data.playlist.length > 0;

          if (hasNewTimestamp || isInitialLoad) {
            console.log(`Updating playlist for ${screenId}. New timestamp: ${data.timestamp}, Old: ${lastTimestampRef.current}`);
            lastTimestampRef.current = data.timestamp;
            setLastTimestamp(data.timestamp);
            
            if (data.playlist && Array.isArray(data.playlist)) {
              setPlaylist(data.playlist);
              setCurrentIndex(0);
            } else {
              setPlaylist([]);
              setCurrentIndex(0);
            }
          }
        } else {
          console.error(`Failed to fetch content for ${screenId}: ${response.status}`);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    };

    const interval = setInterval(poll, 3000);
    poll(); // Initial check
    return () => clearInterval(interval);
  }, [screenId]);

  useEffect(() => {
    // Reset any state when item changes
  }, [currentIndex, playlist]);

  // Auto-advance playlist
  useEffect(() => {
    if (playlist.length <= 1) return;

    const currentItem = playlist[currentIndex];

    const durationSeconds = parseDuration(currentItem?.duration || 10);
    const timer = setTimeout(() => {
      nextItem();
    }, durationSeconds * 1000);

    return () => clearTimeout(timer);
  }, [playlist, currentIndex]);

  const parseDuration = (duration: string | number): number => {
    if (typeof duration === 'number') return duration;
    if (!duration) return 10;
    
    const durationStr = String(duration);
    
    // Handle MM:SS
    if (durationStr.includes(':')) {
      const parts = durationStr.split(':');
      if (parts.length === 2) {
        const [m, s] = parts.map(Number);
        return (m * 60) + s;
      }
    }
    
    // Handle "15s"
    if (durationStr.toLowerCase().endsWith('s')) {
      return parseInt(durationStr) || 10;
    }
    
    const parsed = parseInt(durationStr);
    return isNaN(parsed) ? 10 : parsed;
  };

  const nextItem = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
      setIsTransitioning(false);
    }, 500);
  };

  const selectScreen = (id: string) => {
    setScreenId(id);
    localStorage.setItem('display_screen_id', id);
  };

  if (!screenId) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#081425] text-white flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="w-20 h-20 bg-[#ffb95f]/10 rounded-3xl mx-auto flex items-center justify-center border border-[#ffb95f]/20">
            <Monitor className="w-10 h-10 text-[#ffb95f]" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Configurar Tela</h1>
            <p className="text-slate-400">Selecione qual identidade esta tela deve assumir para receber transmissões.</p>
          </div>
          
          <div className="space-y-3 mt-8">
            {availableScreens.length > 0 ? (
              availableScreens.map((screen) => (
                <button
                  key={screen.id}
                  onClick={() => selectScreen(screen.id)}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#ffb95f]/50 transition-all flex items-center justify-between group"
                >
                  <div className="text-left">
                    <p className="font-bold text-white group-hover:text-[#ffb95f] transition-colors">{screen.name}</p>
                    <p className="text-xs text-slate-500">{screen.model} • {screen.ip}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-[#ffb95f]" />
                </button>
              ))
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-white/10 text-slate-500">
                <Monitor className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">Nenhuma tela cadastrada</p>
                <p className="text-xs mt-2">Cadastre suas TVs no painel de gerenciamento para que elas apareçam aqui.</p>
              </div>
            )}
          </div>

          <button 
            onClick={onExit}
            className="text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest pt-4"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  const currentItem = playlist[currentIndex];

  const getTransitionProps = () => {
    switch (currentItem?.transition) {
      case 'slide':
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: '-100%', opacity: 0 },
          transition: { type: 'spring', damping: 20, stiffness: 100 }
        };
      case 'zoom':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 1.2, opacity: 0 },
          transition: { duration: 0.8 }
        };
      case 'none':
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
          transition: { duration: 0 }
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0, scale: 1.05 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
          transition: { duration: 1 }
        };
    }
  };

  const getLogoPositionClasses = () => {
    switch (currentItem?.logoPosition) {
      case 'top-left': return 'top-12 left-12';
      case 'bottom-left': return 'bottom-12 left-12';
      case 'bottom-right': return 'bottom-12 right-12';
      case 'top-right':
      default: return 'top-12 right-12';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* Controls Overlay (Hidden in real use) */}
      {!isScreenUser && (
        <div className="absolute top-8 left-8 z-[110] flex items-center gap-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="flex bg-black/50 backdrop-blur-xl p-1 rounded-full border border-white/10">
            <button onClick={() => {
              localStorage.removeItem('display_screen_id');
              setScreenId(null);
            }} className="p-2 rounded-full text-white hover:bg-white/10 flex items-center gap-2 px-4">
              <Monitor className="w-4 h-4" />
              <span className="text-xs font-bold">Trocar Tela</span>
            </button>
          </div>
          <button 
            onClick={onExit}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {playlist.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-20"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 relative">
              <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full border-t-blue-500 animate-spin"></div>
              <Tv className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase">Aguardando Transmissão</h2>
            <p className="text-xl text-slate-400 max-w-lg mx-auto mb-8">
              Esta tela está conectada como <span className="text-[#ffb95f] font-bold">{availableScreens.find(s => s.id === screenId)?.name || 'Desconhecida'}</span>. 
              Publique uma lista de reprodução para começar.
            </p>
            
            <div className="flex flex-col items-center gap-4">
              <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold mb-1">Identificador da Tela</p>
                <p className="text-2xl font-mono font-bold text-blue-400">{screenId}</p>
              </div>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('display_screen_id');
                  setScreenId(null);
                }}
                className="text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                <Monitor className="w-4 h-4" />
                Trocar Identidade da Tela
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={(currentItem?.id || 'item') + currentIndex}
            {...getTransitionProps()}
            className="absolute inset-0"
          >
            <div className="w-full h-full relative bg-slate-950">
              {currentItem?.type === 'video' ? (
                <video
                  src={currentItem?.url}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-all duration-700"
                  onEnded={() => nextItem()}
                  onError={() => {
                    console.error('Video failed, skipping item');
                    nextItem();
                  }}
                />
              ) : (
                <img 
                  src={currentItem?.url || currentItem?.thumbnail} 
                  className="w-full h-full object-cover transition-all duration-700" 
                  referrerPolicy="no-referrer"
                  onError={() => {
                    console.error('Image failed, skipping item');
                    nextItem();
                  }}
                />
              )}
              <div className={`absolute inset-0 ${currentItem?.layout === 'minimal' ? 'bg-black/40' : 'bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent'}`}></div>
              
              {currentItem?.logoUrl && (
                <div className={`absolute z-[106] ${getLogoPositionClasses()}`}>
                  <img src={currentItem.logoUrl} alt="Logo" className="max-w-[150px] max-h-[150px] object-contain drop-shadow-xl" />
                </div>
              )}
              
              <div 
                className={`absolute inset-0 p-20 flex flex-col ${
                  currentItem?.layout === 'modern' ? 'justify-center' : 'justify-end'
                } ${
                  currentItem?.textAlign === 'center' ? 'items-center' : 
                  currentItem?.textAlign === 'right' ? 'items-end' : 
                  'items-start'
                }`}
                style={{ 
                  fontFamily: currentItem?.fontFamily === 'serif' ? 'Georgia, serif' : 
                             currentItem?.fontFamily === 'mono' ? 'monospace' : 
                             'inherit',
                  textAlign: currentItem?.textAlign || 'left'
                }}
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-full max-w-5xl"
                >
                  <h2 
                    className={`${currentItem?.layout === 'modern' ? 'text-7xl' : 'text-6xl'} font-black text-white tracking-tighter mb-4 uppercase drop-shadow-2xl`}
                    style={{ fontSize: currentItem?.fontSize ? `${currentItem.fontSize}px` : undefined }}
                  >
                    {currentItem?.title}
                  </h2>
                  {currentItem?.content && (
                    <p 
                      className={`text-2xl text-white/80 font-medium leading-relaxed opacity-90 ${
                        currentItem?.layout === 'modern' ? 'max-w-3xl' : 'max-w-2xl'
                      } ${currentItem?.textAlign === 'center' ? 'mx-auto' : currentItem?.textAlign === 'right' ? 'ml-auto' : ''}`}
                      style={{ fontSize: currentItem?.contentFontSize ? `${currentItem.contentFontSize}px` : undefined }}
                    >
                      {currentItem?.content}
                    </p>
                  )}
                  
                  {currentItem?.layout !== 'minimal' && (
                    <div className={`mt-12 flex items-center justify-between border-t border-white/20 pt-8 ${
                      currentItem?.layout === 'modern' ? 'w-full' : 'max-w-2xl'
                    } ${currentItem?.textAlign === 'center' ? 'mx-auto' : currentItem?.textAlign === 'right' ? 'ml-auto' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Horário & Local</p>
                          <p className="text-lg text-white font-semibold">Sexta-feira, 19:00 • Santuário Principal</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Transmissão ao Vivo</p>
                        <p className="text-lg font-bold" style={{ color: currentItem?.accentColor || '#ffb95f' }}>batistasaraiva.tv/live</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 to-transparent z-[105] flex items-center justify-between px-20">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="text-4xl font-black tracking-tighter leading-none">{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="text-xs font-bold text-[#ffb95f] uppercase tracking-widest mt-1">Horário Local</span>
          </div>
          <div className="w-px h-10 bg-white/20"></div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {getWeatherIcon(weather.icon)}
              <span className="text-xl font-bold tracking-tight leading-none">{weather.temp}°C</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[8px] font-black text-[#ffb95f] uppercase tracking-tighter">AccuWeather</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{weather.condition} • Salvador</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Status da Tela</p>
            <p className="text-sm font-bold text-white">
              {screenId ? availableScreens.find(s => s.id === screenId)?.name : 'Não Identificada'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-[#ffb95f]/30 flex items-center justify-center relative">
            <div className="absolute inset-0 border-2 border-[#ffb95f] rounded-full border-t-transparent animate-spin"></div>
            <Radio className="w-5 h-5 text-[#ffb95f]" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {playlist.length > 0 && (
        <div 
          className="absolute bottom-0 left-0 h-1.5 bg-[#ffb95f] z-[110] transition-all ease-linear" 
          style={{ 
            width: '100%', 
            animation: `progress-fast ${(parseDuration(currentItem?.duration || 10))}s infinite linear` 
          }} 
          key={currentIndex}
        ></div>
      )}

      <style>{`
        @keyframes progress-fast {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
