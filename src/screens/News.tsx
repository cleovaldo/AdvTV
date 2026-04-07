import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Facebook, Instagram, Youtube, Twitter, Search, Moon, Menu, Loader2 } from 'lucide-react';

interface NewsProps {
  fullScreen?: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  author?: string;
  thumbnail?: string;
  link?: string;
}

export default function News({ fullScreen = false }: NewsProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setNews(data);
        }
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && news.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#c00]" />
      </div>
    );
  }

  // Fallback to static news if none published yet, matching the visual style of the image
  const displayNews = news.length > 0 ? news : [
    {
      id: '1',
      title: 'Evangélicos são maioria em mais de 200 municípios brasileiros',
      content: 'Redação CPAD News — 1 de abril de 2026',
      category: 'UNIVERSO CRISTÃO',
      date: '2026-04-01',
      thumbnail: 'https://images.unsplash.com/photo-1523733593134-a15d80966249?auto=format&fit=crop&q=80&w=1200'
    },
    {
      id: '2',
      title: 'Inconsistências no currículo eliminam candidatos e acendem alerta no mercado de trabalho',
      content: 'Destaque na área de carreira e desenvolvimento profissional.',
      category: 'CARREIRA',
      date: '2026-04-02',
      thumbnail: 'https://images.unsplash.com/photo-1454165833767-027ff33027ef?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '3',
      title: 'Governo Federal divulga reajuste de até 3,81% no preço dos remédios',
      content: 'Novos valores entram em vigor a partir desta semana.',
      category: 'SAÚDE',
      date: '2026-04-02',
      thumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800'
    },
    {
      id: '4',
      title: 'Muçulmanos se convertem no Sudão',
      content: 'Relatos de avivamento e transformação em regiões de conflito.',
      category: 'UNIVERSO CRISTÃO',
      date: '2026-04-02',
      thumbnail: 'https://images.unsplash.com/photo-1519817650390-64a934479f67?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const mainStory = displayNews[0];
  const centerStory = displayNews[1];
  const rightStories = displayNews.slice(2, 4);

  return (
    <div className="h-full bg-white text-[#333] font-sans flex flex-col">
      {/* Top Bar */}
      <div className="bg-[#c00] text-white py-3 px-8 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4 w-1/3">
          <Facebook className="w-4 h-4 cursor-pointer hover:opacity-80" />
          <Instagram className="w-4 h-4 cursor-pointer hover:opacity-80" />
          <Youtube className="w-4 h-4 cursor-pointer hover:opacity-80" />
          <Twitter className="w-4 h-4 cursor-pointer hover:opacity-80" />
        </div>
        
        <div className="flex items-center justify-center w-1/3">
          <h1 className="text-5xl font-black italic tracking-tighter">B&S<span className="font-light">NEWS</span></h1>
        </div>

        <div className="flex items-center justify-end gap-6 text-[10px] font-bold w-1/3">
          <button className="bg-black/20 px-4 py-1.5 rounded uppercase hover:bg-black/30 transition-colors">Se Inscrever</button>
          <div className="flex items-center gap-1 cursor-pointer hover:opacity-80">
            <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span className="uppercase">Login</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="bg-white border-b border-gray-100 py-3 px-8 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-8">
          <Menu className="w-5 h-5 text-gray-400 cursor-pointer" />
          <div className="flex items-center gap-6 text-[11px] font-extrabold text-gray-600 uppercase tracking-tight">
            <span className="text-[#c00] cursor-pointer border-b-2 border-[#c00] pb-1">Home</span>
            <span className="cursor-pointer hover:text-[#c00] transition-colors border-b-2 border-transparent hover:border-[#c00] pb-1">Notícias</span>
            <span className="cursor-pointer hover:text-[#c00] transition-colors border-b-2 border-transparent hover:border-[#c00] pb-1">Batista & Saraiva TV</span>
            <span className="cursor-pointer hover:text-[#c00] transition-colors border-b-2 border-transparent hover:border-[#c00] pb-1">Saúde</span>
            <span className="cursor-pointer hover:text-[#c00] transition-colors border-b-2 border-transparent hover:border-[#c00] pb-1">Cultura</span>
            <span className="cursor-pointer hover:text-[#c00] transition-colors border-b-2 border-transparent hover:border-[#c00] pb-1">Carreira</span>
            <span className="cursor-pointer hover:text-[#c00] transition-colors border-b-2 border-transparent hover:border-[#c00] pb-1">Igreja em Ação</span>
            <span className="cursor-pointer hover:text-[#c00] transition-colors border-b-2 border-transparent hover:border-[#c00] pb-1">Entrevistas</span>
            <span className="cursor-pointer hover:text-[#c00] transition-colors border-b-2 border-transparent hover:border-[#c00] pb-1">Colunistas</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <Moon className="w-4 h-4 cursor-pointer hover:text-gray-600" />
          <Search className="w-4 h-4 cursor-pointer hover:text-gray-600" />
        </div>
      </nav>

      {/* Main Content Grid */}
      <main className="flex-1 overflow-y-auto p-1 bg-gray-50">
        <div className="grid grid-cols-12 gap-1 h-[600px] max-w-[1600px] mx-auto">
          {/* Left Feature */}
          <div className="col-span-6 relative group cursor-pointer overflow-hidden">
            <img 
              src={mainStory.thumbnail} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-10 w-full">
              <span className="bg-[#c00] text-white text-[10px] font-bold px-2 py-0.5 uppercase mb-4 inline-block">
                {mainStory.category || 'NOTÍCIAS'}
              </span>
              <h2 className="text-4xl font-bold text-white leading-tight mb-4 group-hover:underline decoration-[#c00] underline-offset-4">
                {mainStory.title}
              </h2>
              <p className="text-white/70 text-[11px] font-medium uppercase tracking-wider">
                {mainStory.author || 'Redação CPAD News'} — {new Date(mainStory.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Center Story */}
          <div className="col-span-4 relative group cursor-pointer overflow-hidden">
            <img 
              src={centerStory.thumbnail} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-10 w-full">
              <span className="bg-[#c00] text-white text-[10px] font-bold px-2 py-0.5 uppercase mb-4 inline-block">
                {centerStory.category || 'NOTÍCIAS'}
              </span>
              <h2 className="text-3xl font-bold text-white leading-tight group-hover:underline decoration-[#c00] underline-offset-4">
                {centerStory.title}
              </h2>
            </div>
          </div>

          {/* Right Stories */}
          <div className="col-span-2 flex flex-col gap-1">
            {rightStories.map((story) => (
              <div key={story.id} className="flex-1 relative group cursor-pointer overflow-hidden">
                <img 
                  src={story.thumbnail} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <span className="bg-[#c00] text-white text-[9px] font-bold px-2 py-0.5 uppercase mb-3 inline-block">
                    {story.category || 'NOTÍCIAS'}
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug group-hover:underline decoration-[#c00] underline-offset-2">
                    {story.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 px-8 pb-12 max-w-[1600px] mx-auto">
          <div className="w-full h-56 bg-[#081425] rounded-lg overflow-hidden relative shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000" 
              className="w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-16 px-16">
              <div className="text-center">
                <h3 className="text-white text-5xl font-black italic tracking-tighter mb-2">UM CURRÍCULO</h3>
                <p className="text-[#ffb95f] text-6xl font-black tracking-tighter">TODAS AS GERAÇÕES</p>
              </div>
              <div className="flex gap-6 h-40">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-28 h-full bg-white/10 rounded-md border border-white/20 shadow-2xl transform hover:-translate-y-3 transition-transform duration-300 backdrop-blur-sm"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Ticker (Optional but keeping it for dynamic feel) */}
      <div className="bg-black text-white h-10 flex items-center overflow-hidden border-t border-white/5">
        <div className="bg-[#c00] h-full px-6 flex items-center gap-2 shrink-0 z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Destaques</span>
        </div>
        <div className="flex whitespace-nowrap animate-marquee py-2">
          {displayNews.map((story) => (
            <div key={story.id} className="flex items-center gap-8 px-8">
              <span className="text-xs font-bold text-white/80">
                {story.title}
              </span>
              <div className="w-1 h-1 rounded-full bg-[#c00]"></div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
      `}</style>
    </div>
  );
}

