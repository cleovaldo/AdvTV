import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music2 } from 'lucide-react';

export default function HolyricsDisplay() {
  const [data, setData] = useState<any>(null);
  const [lastTimestamp, setLastTimestamp] = useState(0);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/holyrics');
      if (response.ok) {
        const result = await response.json();
        if (result.timestamp !== lastTimestamp) {
          setData(result);
          setLastTimestamp(result.timestamp);
        }
      }
    } catch (error) {
      console.error('Error fetching Holyrics data for display:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [lastTimestamp]);

  if (!data || !data.text) {
    return (
      <div className="w-full h-full bg-[#081425] flex flex-col items-center justify-center text-center p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="w-24 h-24 rounded-full bg-[#ffb95f]/10 flex items-center justify-center mx-auto border border-[#ffb95f]/20">
            <Music2 className="w-12 h-12 text-[#ffb95f] animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Aguardando Holyrics...</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Inicie uma música ou versículo no sistema de projeção para exibir aqui.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#081425] relative overflow-hidden flex flex-col">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ffb95f]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-12 md:px-24 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={data.timestamp}
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl w-full space-y-12"
          >
            {/* Header Info */}
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ffb95f]/10 border border-[#ffb95f]/20 rounded-full"
              >
                <div className="w-2 h-2 rounded-full bg-[#ffb95f] animate-pulse" />
                <span className="text-[10px] font-black text-[#ffb95f] uppercase tracking-[0.2em]">
                  {data.type === 'song' ? 'Em Adoração' : 'Palavra de Deus'}
                </span>
              </motion.div>
              
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none uppercase">
                  {data.title}
                </h1>
                {data.artist && (
                  <p className="text-[#ffb95f] text-xl md:text-2xl font-medium opacity-80">
                    {data.artist}
                  </p>
                )}
              </div>
            </div>

            {/* Main Text */}
            <div className="relative py-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#ffb95f]/30 to-transparent" />
              <p className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-white leading-[1.1] drop-shadow-2xl">
                {data.text}
              </p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#ffb95f]/30 to-transparent" />
            </div>

            {/* Next Text Preview */}
            {data.next_text && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 0.4 }}
                className="pt-12"
              >
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Próximo Verso</p>
                <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-3xl mx-auto line-clamp-2">
                  {data.next_text}
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="p-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Music2 className="w-6 h-6 text-[#ffb95f]" />
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-widest">Batista & Saraiva TV</p>
            <p className="text-[10px] text-slate-500 font-medium">Sincronizado com Holyrics</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-white leading-none">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-[10px] text-[#ffb95f] font-bold uppercase tracking-widest mt-1">Ao Vivo</p>
        </div>
      </div>
    </div>
  );
}
