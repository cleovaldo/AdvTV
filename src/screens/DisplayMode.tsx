import React, { useState, useEffect, useRef } from 'react';
import PublicDisplay from './PublicDisplay';
import News from './News';
import HolyricsDisplay from './HolyricsDisplay';
import { X, Monitor, Newspaper, PlayCircle, Music2 } from 'lucide-react';

interface DisplayModeProps {
  isNews?: boolean;
  userRole?: string;
  onExit: () => void;
}

export default function DisplayMode({ isNews: initialIsNews = false, userRole, onExit }: DisplayModeProps) {
  const [mode, setMode] = useState<'playlist' | 'news' | 'holyrics'>(initialIsNews ? 'news' : 'playlist');
  const [showSelector, setShowSelector] = useState(false);
  const [screenId] = useState<string | null>(localStorage.getItem('display_screen_id'));
  const lastTimestampRef = useRef(0);

  const isScreenUser = userRole === 'screen';

  // Poll for content/mode if screenId is set
  useEffect(() => {
    if (!isScreenUser || !screenId) return;

    const poll = async () => {
      try {
        const response = await fetch(`/api/screens/${screenId}/content`);
        if (response.ok) {
          const data = await response.json();
          if (data.timestamp > lastTimestampRef.current) {
            lastTimestampRef.current = data.timestamp;
            if (data.mode && (data.mode === 'playlist' || data.mode === 'news' || data.mode === 'holyrics')) {
              setMode(data.mode as any);
            }
          }
        }
      } catch (e) {
        console.error('Polling error in DisplayMode:', e);
      }
    };

    const interval = setInterval(poll, 3000);
    poll();
    return () => clearInterval(interval);
  }, [screenId, isScreenUser]);

  // Auto-hide selector after some time
  useEffect(() => {
    if (showSelector) {
      const timer = setTimeout(() => setShowSelector(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSelector]);

  return (
    <div className="fixed inset-0 z-[200] bg-black group">
      {/* Hidden trigger for selector - Only for non-screen users */}
      {!isScreenUser && (
        <div 
          className="absolute top-0 left-0 right-0 h-20 z-[220] cursor-pointer"
          onMouseMove={() => setShowSelector(true)}
          onClick={() => setShowSelector(true)}
        />
      )}

      {/* Mode Selector Overlay */}
      {showSelector && !isScreenUser && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[230] flex items-center gap-4 bg-[#081425]/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
          <button 
            onClick={() => setMode('playlist')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'playlist' ? 'bg-[#ffb95f] text-[#472a00]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <PlayCircle className="w-5 h-5" />
            Playlist
          </button>
          <button 
            onClick={() => setMode('news')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'news' ? 'bg-[#ffb95f] text-[#472a00]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Newspaper className="w-5 h-5" />
            Notícias
          </button>
          <button 
            onClick={() => setMode('holyrics')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'holyrics' ? 'bg-[#ffb95f] text-[#472a00]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Music2 className="w-5 h-5" />
            Holyrics
          </button>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <button 
            onClick={onExit}
            className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Render selected mode */}
      <div className="w-full h-full">
        {mode === 'playlist' ? (
          <PublicDisplay userRole={userRole} onExit={onExit} />
        ) : mode === 'news' ? (
          <div className="w-full h-full relative">
            <News fullScreen />
            {!isScreenUser && (
              <button 
                onClick={onExit}
                className="absolute top-8 right-8 z-[210] w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        ) : (
          <div className="w-full h-full relative">
            <HolyricsDisplay />
            {!isScreenUser && (
              <button 
                onClick={onExit}
                className="absolute top-8 right-8 z-[210] w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
