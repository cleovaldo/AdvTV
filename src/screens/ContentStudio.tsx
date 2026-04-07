import { Edit3, Palette, Upload, CheckCircle, ArrowRight, Tv, Share2, Calendar, Users, Info, TrendingUp, Plus, Loader2, Sparkles, Wand2, Newspaper } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { GoogleGenAI, Type } from "@google/genai";
import { TV_SCREENS, PLAYLIST_ITEMS } from '../constants';
import { TVScreen, MediaAsset, PlaylistItem } from '../types';
import { saveAssets, loadAssets } from '../lib/storage';

interface ContentStudioProps {
  onPreview: () => void;
}

export default function ContentStudio({ onPreview }: ContentStudioProps) {
  const [title, setTitle] = useState('Community Worship Night');
  const [content, setContent] = useState('Join us this Friday at 7 PM for an evening of prayer, music, and community fellowship in the main sanctuary.');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'announcements' | 'news'>('announcements');
  const [availableScreens, setAvailableScreens] = useState<TVScreen[]>([]);
  const [selectedBg, setSelectedBg] = useState('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800');
  const [accentColor, setAccentColor] = useState('#ffb95f');
  const [layout, setLayout] = useState<'classic' | 'modern' | 'minimal'>('classic');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [duration, setDuration] = useState(15);
  const [fontSize, setFontSize] = useState(48);
  const [transition, setTransition] = useState<'fade' | 'slide' | 'zoom' | 'none'>('fade');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('top-right');
  const [contentFontSize, setContentFontSize] = useState(24);
  
  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  const CHURCH_TEMPLATES = [
    {
      id: 'sunday-service',
      title: 'Culto de Celebração',
      content: 'Junte-se a nós neste domingo às 10h e 18h para um tempo precioso de louvor e a ministração da Palavra.',
      bg: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200',
      accent: '#ffb95f',
      layout: 'classic',
      font: 'serif'
    },
    {
      id: 'worship-night',
      title: 'Noite de Louvor & Adoração',
      content: 'Uma noite dedicada inteiramente à adoração. Sexta-feira, às 20h no santuário principal. Traga sua família!',
      bg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200',
      accent: '#a29bfe',
      layout: 'modern',
      font: 'sans'
    },
    {
      id: 'youth-retreat',
      title: 'Retiro de Jovens 2024',
      content: 'Inscrições abertas para o nosso retiro anual! "Conectados com o Criador". Vagas limitadas, garanta a sua.',
      bg: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1200',
      accent: '#55efc4',
      layout: 'minimal',
      font: 'mono'
    },
    {
      id: 'bible-study',
      title: 'Estudo Bíblico Semanal',
      content: 'Aprofunde seus conhecimentos na Palavra. Todas as quartas-feiras às 19h30. Venha crescer conosco.',
      bg: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1200',
      accent: '#b7c8e1',
      layout: 'classic',
      font: 'serif'
    }
  ];

  const applyTemplate = (template: typeof CHURCH_TEMPLATES[0]) => {
    setTitle(template.title);
    setContent(template.content);
    setSelectedBg(template.bg);
    setAccentColor(template.accent);
    setLayout(template.layout as any);
    setFontFamily(template.font as any);
    toast.success('Template aplicado!', {
      description: `O estilo "${template.title}" foi carregado.`
    });
  };

  useEffect(() => {
    const savedDraft = localStorage.getItem('announcement_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title);
        setContent(draft.content);
        if (draft.isScheduled) {
          setIsScheduled(true);
          setStartDate(draft.startDate || '');
          setStartTime(draft.startTime || '');
          setEndDate(draft.endDate || '');
          setEndTime(draft.endTime || '');
        }
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    const savedScreens = localStorage.getItem('tv_screens');
    if (savedScreens) {
      try {
        setAvailableScreens(JSON.parse(savedScreens));
      } catch (e) {
        console.error('Error loading screens:', e);
      }
    }
  }, []);

  // Listen for storage changes to keep screens in sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tv_screens' && e.newValue) {
        try {
          setAvailableScreens(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Error syncing screens from storage:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-save draft as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('announcement_draft', JSON.stringify({ 
        title, 
        content,
        isScheduled,
        startDate,
        startTime,
        endDate,
        endTime
      }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [title, content, isScheduled, startDate, startTime, endDate, endTime]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    const draft = {
      title,
      content,
      isScheduled,
      startDate,
      startTime,
      endDate,
      endTime,
      selectedBg,
      accentColor,
      layout,
      fontFamily,
      textAlign,
      duration,
      fontSize,
      contentFontSize,
      transition,
      logoUrl,
      logoPosition,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('announcement_draft', JSON.stringify(draft));
    
    // Also save to Media Library
    try {
      const currentAssets = await loadAssets();
      const newAsset: MediaAsset = {
        id: `announcement-${Date.now()}`,
        title: title || 'Sem Título',
        type: 'announcement',
        thumbnail: selectedBg,
        url: selectedBg,
        duration: `${duration}s`,
        updatedAt: 'Agora mesmo',
        content,
        accentColor,
        layout,
        fontFamily,
        textAlign,
        fontSize,
        contentFontSize,
        transition,
        logoUrl: logoUrl || undefined,
        logoPosition
      };
      
      await saveAssets([newAsset, ...currentAssets]);
      
      toast.success('Anúncio salvo na Galeria!', {
        description: 'O slide foi salvo na sua Galeria e está disponível para uso.'
      });
    } catch (e) {
      console.error('Error saving to media library:', e);
      toast.success('Rascunho salvo localmente');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('O título do comunicado é obrigatório');
      return;
    }

    setIsPublishing(true);
    try {
      const scheduleData = isScheduled ? {
        start: `${startDate}T${startTime}`,
        end: `${endDate}T${endTime}`
      } : null;

      // Basic validation for scheduled content
      if (isScheduled && (!startDate || !startTime || !endDate || !endTime)) {
        toast.error('Por favor, preencha todas as datas e horários de agendamento.');
        setIsPublishing(false);
        return;
      }

      if (activeSubTab === 'announcements') {
        // For announcements, we update the playlist for all online screens
        const screenIds = availableScreens
          .filter(s => s.status === 'online')
          .map(s => s.id);
          
        // Fallback to all screens if none are online (for testing)
        const targetIds = screenIds.length > 0 ? screenIds : availableScreens.map(s => s.id);

        if (targetIds.length === 0) {
          toast.error('Nenhuma tela disponível', {
            description: 'Não há telas registradas para publicação.'
          });
          setIsPublishing(false);
          return;
        }

        console.log(`Saving announcement to playlist instead of direct publish: ${targetIds.join(', ')}`);

        // Also save to Media Library when publishing
        const currentAssets = await loadAssets();
        const newAsset: MediaAsset = {
          id: `announcement-${Date.now()}`,
          title: title || 'Sem Título',
          type: 'announcement',
          thumbnail: selectedBg,
          url: selectedBg,
          duration: `${duration}s`,
          updatedAt: 'Agora mesmo',
          content,
          accentColor,
          layout,
          fontFamily,
          textAlign,
          fontSize,
          transition,
          logoUrl: logoUrl || undefined,
          logoPosition
        };
        await saveAssets([newAsset, ...currentAssets]);

        // Also save to Playlist when publishing (Lista de Reprodução)
        try {
          const savedPlaylist = localStorage.getItem('media_playlist');
          const currentPlaylist = savedPlaylist ? JSON.parse(savedPlaylist) : PLAYLIST_ITEMS;
          
          const newPlaylistItem: PlaylistItem = {
            id: `p-pub-${Date.now()}`,
            assetId: newAsset.id,
            title: newAsset.title,
            content: newAsset.content,
            duration: newAsset.duration || '15s',
            type: 'image',
            thumbnail: newAsset.thumbnail,
            accentColor: newAsset.accentColor,
            layout: newAsset.layout,
            fontFamily: newAsset.fontFamily,
            textAlign: newAsset.textAlign,
            fontSize: newAsset.fontSize,
            transition: newAsset.transition,
            logoUrl: newAsset.logoUrl,
            logoPosition: newAsset.logoPosition
          };
          
          localStorage.setItem('media_playlist', JSON.stringify([newPlaylistItem, ...currentPlaylist]));
        } catch (playlistError) {
          console.error('Error saving to playlist during publish:', playlistError);
        }
      } else {
        // For news, we update the news feed
        const response = await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            news: [
              {
                id: Date.now().toString(),
                title: title,
                content: content,
                date: new Date().toISOString(),
                style: {
                  accentColor: accentColor,
                  fontFamily: fontFamily
                },
                schedule: scheduleData
              }
            ]
          })
        });
        if (!response.ok) throw new Error('Failed to publish news');
      }

      localStorage.setItem('announcement_draft', JSON.stringify({ title, content }));
      toast.success('Publicado com sucesso!', {
        description: activeSubTab === 'announcements' 
          ? 'O anúncio foi publicado, salvo na Galeria e adicionado à Lista de Reprodução.'
          : 'O feed de notícias foi atualizado.',
      });
    } catch (error) {
      console.error('Publish Error:', error);
      toast.error('Erro ao publicar conteúdo.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateNew = () => {
    setTitle('');
    setContent('');
    toast.info('Novo rascunho iniciado', {
      description: 'Campos limpos para nova criação.',
    });
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Por favor, descreva o que você deseja gerar.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const systemInstruction = activeSubTab === 'announcements' 
        ? "Você é um redator criativo para uma rede de TVs de avisos comunitários (Batista & Saraiva TV). Crie um anúncio impactante e conciso."
        : "Você é um jornalista para um feed de notícias de rodapé (scrolling news). Crie uma notícia curta e objetiva.";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Gere um ${activeSubTab === 'announcements' ? 'anúncio' : 'item de notícia'} baseado no seguinte tema: ${aiPrompt}`,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Um título curto e chamativo (máx 40 caracteres)"
              },
              content: {
                type: Type.STRING,
                description: activeSubTab === 'announcements' 
                  ? "O corpo do anúncio (máx 150 caracteres)" 
                  : "A notícia para o feed (máx 100 caracteres)"
              }
            },
            required: ["title", "content"]
          }
        }
      });

      const result = JSON.parse(response.text);
      setTitle(result.title);
      setContent(result.content);
      setShowAIPanel(false);
      setAiPrompt('');
      toast.success('Conteúdo gerado com sucesso!', {
        icon: <Sparkles className="w-4 h-4 text-yellow-500" />
      });
    } catch (error) {
      console.error('AI Generation Error:', error);
      toast.error('Erro ao gerar conteúdo com IA. Verifique sua conexão e chave de API.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-[#d8e3fb] tracking-tight mb-2">Estúdio de Conteúdo</h2>
            <p className="text-[#b7c8e1]/70 max-w-lg">
              {activeSubTab === 'announcements' 
                ? 'Crie e gerencie slides de anúncios em alta definição para o sistema de exibição do santuário.'
                : 'Configure o feed de notícias em tempo real para as telas laterais e recepção.'}
            </p>
          </div>
          <div className="flex gap-3 bg-[#111c2d] p-1 rounded-lg">
            <button 
              onClick={() => setActiveSubTab('announcements')}
              className={`px-6 py-2 rounded-md text-sm font-semibold shadow-sm transition-all ${activeSubTab === 'announcements' ? 'bg-[#2a3548] text-[#ffb95f]' : 'text-slate-400 hover:text-[#d8e3fb]'}`}
            >
              Anúncios
            </button>
            <button 
              onClick={() => setActiveSubTab('news')}
              className={`px-6 py-2 rounded-md text-sm font-semibold shadow-sm transition-all ${activeSubTab === 'news' ? 'bg-[#2a3548] text-[#ffb95f]' : 'text-slate-400 hover:text-[#d8e3fb]'}`}
            >
              Feed de Notícias
            </button>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7 space-y-8">
            <section className="bg-[#111c2d] rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-[#ffb95f]">
                  <Edit3 className="w-5 h-5" />
                  <h3 className="font-bold text-lg uppercase tracking-wider">
                    {activeSubTab === 'announcements' ? 'Detalhes do Slide' : 'Configuração do Feed'}
                  </h3>
                </div>
                <button 
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${showAIPanel ? 'bg-[#ffb95f] text-[#472a00]' : 'bg-[#2a3548] text-[#ffb95f] hover:bg-[#36445d]'}`}
                >
                  <Sparkles className="w-3 h-3" />
                  Assistente de IA
                </button>
              </div>

              {showAIPanel && (
                <div className="mb-8 p-6 bg-[#081425] rounded-xl border border-[#ffb95f]/20 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Wand2 className="w-4 h-4 text-[#ffb95f]" />
                    <h4 className="text-xs font-bold text-[#d8e3fb] uppercase tracking-wider">O que você deseja anunciar?</h4>
                  </div>
                  <div className="flex gap-3">
                    <input 
                      type="text"
                      placeholder="Ex: Noite de pizza para jovens no sábado às 19h..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGenerateAI()}
                      className="flex-1 bg-[#111c2d] border border-white/5 rounded-lg px-4 py-2 text-sm text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f]"
                    />
                    <button 
                      onClick={handleGenerateAI}
                      disabled={isGeneratingAI}
                      className="px-6 py-2 bg-[#ffb95f] text-[#472a00] rounded-lg font-bold text-xs hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isGeneratingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Gerar
                    </button>
                  </div>
                  <p className="mt-3 text-[10px] text-slate-500 italic">A IA criará um título e conteúdo otimizados para as telas.</p>
                </div>
              )}

              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-2">
                      {activeSubTab === 'announcements' ? 'Título do Anúncio' : 'Título da Notícia'}
                    </label>
                    <input
                      type="text"
                      placeholder={activeSubTab === 'announcements' ? "Ex: Noite de Louvor" : "Ex: Últimas Notícias"}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#2a3548] border border-white/10 rounded-md px-4 py-3 text-[#d8e3fb] focus:ring-1 focus:ring-[#b7c8e1] outline-none transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-2">
                      {activeSubTab === 'announcements' ? 'Conteúdo do Slide' : 'Texto do Feed (Scrolling)'}
                    </label>
                    <textarea
                      rows={4}
                      placeholder={activeSubTab === 'announcements' ? "Descreva o evento..." : "Digite as notícias que irão rolar no rodapé..."}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-[#2a3548] border border-white/10 rounded-md px-4 py-3 text-[#d8e3fb] focus:ring-1 focus:ring-[#b7c8e1] outline-none transition-all"
                    />
                  </div>
                  {activeSubTab === 'news' && (
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-2">Velocidade do Scroll</label>
                      <select className="w-full bg-[#2a3548] border border-white/10 rounded-md px-4 py-3 text-[#d8e3fb] outline-none">
                        <option>Lento</option>
                        <option selected>Normal</option>
                        <option>Rápido</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-2">Duração (Segundos)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        value={duration} 
                        onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
                        className="w-full bg-[#2a3548] border border-white/10 rounded-md px-4 py-3 text-[#d8e3fb] focus:ring-1 focus:ring-[#b7c8e1] outline-none" 
                      />
                      <span className="text-slate-500 text-xs font-medium">sec</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#ffb95f]" />
                      <h4 className="text-xs font-bold text-[#d8e3fb] uppercase tracking-wider">Agendamento de Publicação</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isScheduled}
                        onChange={(e) => setIsScheduled(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-[#2a3548] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ffb95f]"></div>
                      <span className="ml-3 text-xs font-medium text-slate-400">{isScheduled ? 'Ativado' : 'Desativado'}</span>
                    </label>
                  </div>

                  {isScheduled && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Início da Exibição</p>
                        <div className="flex gap-2">
                          <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="flex-1 bg-[#2a3548] border border-white/10 rounded-md px-3 py-2 text-xs text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f]"
                          />
                          <input 
                            type="time" 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-24 bg-[#2a3548] border border-white/10 rounded-md px-3 py-2 text-xs text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f]"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fim da Exibição</p>
                        <div className="flex gap-2">
                          <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="flex-1 bg-[#2a3548] border border-white/10 rounded-md px-3 py-2 text-xs text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f]"
                          />
                          <input 
                            type="time" 
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-24 bg-[#2a3548] border border-white/10 rounded-md px-3 py-2 text-xs text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </section>

            <section className="bg-[#111c2d] rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-[#ffb95f]">
                <Palette className="w-5 h-5" />
                <h3 className="font-bold text-lg uppercase tracking-wider">Estilo Visual</h3>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-3">Imagem de Fundo</label>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1517673132405-a56a62b18acc?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1490730141103-6ac27d020028?auto=format&fit=crop&q=80&w=800',
                      'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=800'
                    ].map((url, i) => (
                      <button 
                        key={i}
                        type="button"
                        onClick={() => setSelectedBg(url)}
                        className={`relative aspect-video rounded-md overflow-hidden transition-all ${selectedBg === url ? 'ring-2 ring-[#ffb95f] scale-95' : 'hover:opacity-80'}`}
                      >
                        <img src={url} className={`w-full h-full object-cover ${selectedBg === url ? 'opacity-80' : 'opacity-50'}`} referrerPolicy="no-referrer" />
                        {selectedBg === url && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <CheckCircle className="text-[#ffb95f] w-6 h-6" />
                          </div>
                        )}
                      </button>
                    ))}
                    <button 
                      type="button"
                      className="aspect-video rounded-md bg-[#2a3548] flex flex-col items-center justify-center gap-1 border border-dashed border-white/10 text-slate-500 hover:text-[#b7c8e1] transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-[10px] font-bold">PERSONALIZAR</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-3">Cor de Destaque</label>
                    <div className="flex gap-3">
                      {['#ffb95f', '#b7c8e1', '#ff6b6b', '#4ecdc4', '#a29bfe', '#55efc4'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setAccentColor(color)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-3">Layout do Slide</label>
                    <div className="flex gap-2">
                      {(['classic', 'modern', 'minimal'] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setLayout(l)}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${layout === l ? 'bg-[#ffb95f] text-[#472a00]' : 'bg-[#2a3548] text-[#b7c8e1] hover:bg-[#36445d]'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-3">Tamanho da Fonte (Título)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="24" 
                        max="120" 
                        value={fontSize} 
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-[#2a3548] rounded-lg appearance-none cursor-pointer accent-[#ffb95f]"
                      />
                      <span className="text-[#d8e3fb] text-xs font-bold w-8">{fontSize}px</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-3">Tamanho da Fonte (Conteúdo)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="12" 
                        max="64" 
                        value={contentFontSize} 
                        onChange={(e) => setContentFontSize(parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-[#2a3548] rounded-lg appearance-none cursor-pointer accent-[#ffb95f]"
                      />
                      <span className="text-[#d8e3fb] text-xs font-bold w-8">{contentFontSize}px</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-3">Logotipo do Comunicado</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        id="logo-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setLogoUrl(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#2a3548] border border-dashed border-white/20 rounded-md text-[10px] font-bold text-[#b7c8e1] hover:bg-[#36445d] transition-all"
                      >
                        {logoUrl ? 'ALTERAR LOGO' : 'UPLOAD LOGO'}
                      </button>
                      {logoUrl && (
                        <button 
                          type="button"
                          onClick={() => setLogoUrl(null)}
                          className="p-2 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-3">Posição do Logo</label>
                    <select 
                      value={logoPosition}
                      onChange={(e) => setLogoPosition(e.target.value as any)}
                      className="w-full bg-[#2a3548] border border-white/10 rounded-md px-3 py-2 text-xs text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f]"
                    >
                      <option value="top-left">Superior Esquerda</option>
                      <option value="top-right">Superior Direita</option>
                      <option value="bottom-left">Inferior Esquerda</option>
                      <option value="bottom-right">Inferior Direita</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-3">Transição de Texto</label>
                    <select 
                      value={transition}
                      onChange={(e) => setTransition(e.target.value as any)}
                      className="w-full bg-[#2a3548] border border-white/10 rounded-md px-3 py-2 text-xs text-[#d8e3fb] outline-none focus:ring-1 focus:ring-[#ffb95f]"
                    >
                      <option value="fade">Fade (Suave)</option>
                      <option value="slide">Slide (Deslizar)</option>
                      <option value="zoom">Zoom (Aproximar)</option>
                      <option value="none">Nenhuma</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1] mb-3">Tipografia</label>
                    <div className="flex gap-2">
                      {(['sans', 'serif', 'mono'] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFontFamily(f)}
                          className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${fontFamily === f ? 'bg-[#ffb95f] text-[#472a00]' : 'bg-[#2a3548] text-[#b7c8e1] hover:bg-[#36445d]'}`}
                          style={{ fontFamily: f === 'sans' ? 'sans-serif' : f === 'serif' ? 'serif' : 'monospace' }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                  <button 
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="px-8 py-3 text-[#d8e3fb] font-semibold text-sm hover:bg-[#1f2a3c] transition-colors rounded-md disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Salvar Rascunho
                  </button>
                  <button 
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="px-10 py-3 bg-[#ffb95f] text-[#472a00] font-bold text-sm uppercase tracking-widest rounded-md shadow-lg shadow-[#ffb95f]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
                    Publicar na TV
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#ffb95f] rounded-full animate-pulse"></span>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#b7c8e1]">Prévia da TV ao Vivo</h4>
                </div>
                <button onClick={onPreview} className="text-[10px] text-[#ffb95f] font-bold hover:underline uppercase tracking-widest">Ver em Tela Cheia</button>
              </div>

              <div className="relative aspect-video w-full bg-slate-950 rounded-lg overflow-hidden shadow-2xl ring-8 ring-[#111c2d]">
                {activeSubTab === 'announcements' ? (
                  <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url('${selectedBg}')` }}>
                    <div className={`absolute inset-0 ${layout === 'minimal' ? 'bg-black/40' : 'bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent'}`}></div>
                    
                    {logoUrl && (
                      <div className={`absolute z-10 ${
                        logoPosition === 'top-left' ? 'top-4 left-4' :
                        logoPosition === 'top-right' ? 'top-4 right-4' :
                        logoPosition === 'bottom-left' ? 'bottom-4 left-4' :
                        'bottom-4 right-4'
                      }`}>
                        <img src={logoUrl} alt="Logo" className="max-w-[60px] max-h-[60px] object-contain drop-shadow-lg" />
                      </div>
                    )}

                    <div 
                      className={`absolute inset-0 p-8 flex flex-col ${layout === 'modern' ? 'justify-center items-center text-center' : 'justify-end'}`}
                      style={{ 
                        fontFamily: fontFamily === 'sans' ? 'inherit' : fontFamily === 'serif' ? 'serif' : 'monospace',
                        textAlign: textAlign 
                      }}
                    >
                      <h1 
                        className={`${layout === 'modern' ? 'text-4xl' : 'text-3xl'} font-black text-white leading-tight mb-2 drop-shadow-lg`}
                        style={{ fontSize: fontSize ? `${fontSize / 2}px` : undefined }} // Scale down for preview
                      >
                        {title}
                      </h1>
                      <p 
                        className={`text-sm text-slate-200 font-medium leading-relaxed opacity-90 ${layout === 'modern' ? 'max-w-md' : 'max-w-sm'}`}
                        style={{ fontSize: contentFontSize ? `${contentFontSize / 2}px` : undefined }} // Scale down for preview
                      >
                        {content}
                      </p>
                      {layout !== 'minimal' && (
                        <div className={`mt-6 flex items-center justify-between border-t border-white/20 pt-4 ${layout === 'modern' ? 'w-full' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-white/10 backdrop-blur flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left">
                              <p className="text-[8px] text-slate-400 font-bold uppercase">Time & Location</p>
                              <p className="text-[10px] text-white font-semibold">Friday, 7:00 PM • Main Sanctuary</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-slate-400 font-bold uppercase">Streaming Live</p>
                            <p className="text-[10px] font-bold" style={{ color: accentColor }}>batistasaraiva.tv/live</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-[#040e1f] flex flex-col items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Newspaper className="w-5 h-5 text-[#ffb95f]" />
                        <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400">Visualização do Feed</h5>
                      </div>
                      <div className="bg-[#111c2d] p-6 rounded-xl border border-white/5 shadow-xl">
                        <h4 className="text-lg font-bold text-[#d8e3fb] mb-2" style={{ color: accentColor }}>{title}</h4>
                        <p className="text-sm text-slate-400 line-clamp-2">{content}</p>
                      </div>
                      <div className="relative h-12 bg-[#111c2d] rounded-lg overflow-hidden border border-white/5 flex items-center">
                        <div className="absolute left-0 top-0 bottom-0 w-24 bg-[#ffb95f] text-[#472a00] flex items-center justify-center text-[10px] font-black uppercase tracking-tighter z-10">
                          URGENTE
                        </div>
                        <div className="flex whitespace-nowrap animate-marquee pl-28">
                          <span className="text-xs font-bold text-[#d8e3fb] mr-12">{title}: {content}</span>
                          <span className="text-xs font-bold text-[#d8e3fb] mr-12">{title}: {content}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-[#111c2d] p-4 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Prioridade de Rotação</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#d8e3fb]">Alta</span>
                    <TrendingUp className="text-[#ffb95f] w-5 h-5" />
                  </div>
                </div>
                <div className="bg-[#111c2d] p-4 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Alcance Diário Est.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#d8e3fb]">2,450</span>
                    <Users className="text-[#b7c8e1] w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button 
                  onClick={handlePublish}
                  className="w-full flex items-center justify-between px-6 py-4 bg-[#2a3548] hover:bg-[#1f2a3c] transition-colors rounded-xl group"
                >
                  <div className="flex items-center gap-4">
                    <Tv className="text-[#b7c8e1] group-hover:scale-110 transition-transform w-5 h-5" />
                    <span className="text-sm font-semibold">Transmitir para Telas</span>
                  </div>
                  <ArrowRight className="text-slate-500 w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between px-6 py-4 bg-[#2a3548] hover:bg-[#1f2a3c] transition-colors rounded-xl group">
                  <div className="flex items-center gap-4">
                    <Share2 className="text-[#b7c8e1] group-hover:scale-110 transition-transform w-5 h-5" />
                    <span className="text-sm font-semibold">Exportar para Redes</span>
                  </div>
                  <ArrowRight className="text-slate-500 w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Templates da Igreja</h3>
            <p className="text-xs text-slate-500">Selecione um template para carregar configurações pré-definidas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CHURCH_TEMPLATES.map((template) => (
              <div 
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="bg-[#111c2d] group cursor-pointer hover:bg-[#1f2a3c] transition-all p-4 rounded-xl border border-white/5 hover:border-[#ffb95f]/30"
              >
                <div className="aspect-video mb-4 rounded-lg overflow-hidden relative">
                  <img src={template.bg} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle className="text-[#ffb95f] w-8 h-8" />
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[8px] font-bold uppercase tracking-widest text-white">
                    {template.layout}
                  </div>
                </div>
                <h5 className="font-bold text-sm mb-1 text-[#d8e3fb]">{template.title}</h5>
                <p className="text-[10px] text-slate-500 font-medium line-clamp-1">{template.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Anúncios Recentes</h3>
            <button className="text-sm text-[#ffb95f] font-semibold hover:underline">Ver Histórico</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#111c2d] group cursor-pointer hover:bg-[#1f2a3c] transition-all p-4 rounded-lg">
                <div className="aspect-video mb-4 rounded overflow-hidden relative">
                  <img src={`https://picsum.photos/seed/recent${i}/800/450`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="text-white w-6 h-6" />
                  </div>
                </div>
                <h5 className="font-bold text-sm mb-1">Recent Announcement {i}</h5>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Ativo • Expira em {i * 2} dias</p>
              </div>
            ))}
            <div 
              onClick={handleCreateNew}
              className="border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-4 rounded-lg hover:border-[#ffb95f] transition-colors cursor-pointer text-slate-500 hover:text-[#ffb95f] group"
            >
              <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Create New</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
