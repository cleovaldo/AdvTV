import { Filter, Upload, Plus, GripVertical, X, PlayCircle, Loader2, ListMusic, Trash2, Pencil, Check, AlertCircle, Monitor, CheckCircle2, Share2, Newspaper } from 'lucide-react';
import { MEDIA_ASSETS, PLAYLIST_ITEMS, TV_SCREENS } from '../constants';
import React, { useState, useRef, useEffect } from 'react';
import { MediaAsset, PlaylistItem, TVScreen } from '../types';
import { toast } from 'sonner';
import { saveAssets, loadAssets } from '../lib/storage';

export default function MediaLibrary({ activeScreen }: { activeScreen?: string }) {
  const [assets, setAssets] = useState<MediaAsset[]>(MEDIA_ASSETS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(() => {
    try {
      const saved = localStorage.getItem('media_playlist');
      return saved ? JSON.parse(saved) : PLAYLIST_ITEMS;
    } catch (e) {
      console.error('Error loading playlist:', e);
      return PLAYLIST_ITEMS;
    }
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isDraggingAsset, setIsDraggingAsset] = useState(false);
  const [draggedAsset, setDraggedAsset] = useState<MediaAsset | null>(null);
  const [draggedPlaylistIndex, setDraggedPlaylistIndex] = useState<number | null>(null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [availableScreens, setAvailableScreens] = useState<TVScreen[]>(() => {
    const saved = localStorage.getItem('tv_screens');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error parsing tv_screens in media library:', e);
      }
    }
    
    // If we've never initialized before, use defaults
    const initialized = localStorage.getItem('tv_screens_initialized');
    if (!initialized) {
      return TV_SCREENS;
    }
    
    return [];
  });
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'announcement' | 'playlist'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load assets from IndexedDB on mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const saved = await loadAssets();
        if (saved && saved.length > 0) {
          // Merge with defaults to ensure new defaults appear
          const userAssets = saved.filter((a: MediaAsset) => !MEDIA_ASSETS.some(ma => ma.id === a.id));
          setAssets([...MEDIA_ASSETS, ...userAssets]);
        }
        setIsLoaded(true);
      } catch (e) {
        console.error('Error loading assets from IndexedDB:', e);
        setIsLoaded(true);
      }
    };
    fetchAssets();
  }, []);

  // Load screens to know where we can publish
  useEffect(() => {
    const loadScreens = () => {
      const savedScreens = localStorage.getItem('tv_screens');
      if (savedScreens) {
        try {
          const screens = JSON.parse(savedScreens);
          if (Array.isArray(screens)) {
            setAvailableScreens(screens);
            
            // Auto-select online screens when modal opens
            if (isPublishModalOpen && selectedScreens.length === 0) {
              const onlineScreens = screens
                .filter((s: TVScreen) => s.status === 'online')
                .map((s: TVScreen) => s.id);
              setSelectedScreens(onlineScreens);
            }
          }
        } catch (e) {
          console.error('Error parsing screens in media library:', e);
        }
      } else {
        const initialized = localStorage.getItem('tv_screens_initialized');
        if (!initialized) {
          setAvailableScreens(TV_SCREENS);
        } else {
          setAvailableScreens([]);
        }
      }
    };

    loadScreens();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tv_screens') {
        loadScreens();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isPublishModalOpen, selectedScreens.length]);

  // Sync activeTab with activeScreen
  useEffect(() => {
    if (activeScreen === 'playlists') {
      setActiveTab('playlist');
    } else if (activeScreen === 'library') {
      setActiveTab('all');
    }
  }, [activeScreen]);

  // Save assets to IndexedDB whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    
    const persistAssets = async () => {
      try {
        await saveAssets(assets);
      } catch (e) {
        console.error('Error saving assets to IndexedDB:', e);
        toast.error('Erro ao salvar biblioteca: Espaço insuficiente no navegador.');
      }
    };
    persistAssets();
  }, [assets, isLoaded]);

  // Save playlist to localStorage
  useEffect(() => {
    localStorage.setItem('media_playlist', JSON.stringify(playlist));
  }, [playlist]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  };

  const loadChurchTemplates = () => {
    const churchAssets: MediaAsset[] = [
      {
        id: 'church-1',
        title: 'Boas Vindas - Culto',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=400',
        duration: 'Estático',
        updatedAt: 'Template'
      },
      {
        id: 'church-2',
        title: 'Louvor e Adoração',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        duration: 'Estático',
        updatedAt: 'Template'
      },
      {
        id: 'church-3',
        title: 'Estudo Bíblico',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1200',
        thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=400',
        duration: 'Estático',
        updatedAt: 'Template'
      },
    ];

    const existingIds = new Set(assets.map(a => a.id));
    const newAssets = [...assets];
    let addedCount = 0;

    churchAssets.forEach(asset => {
      if (!existingIds.has(asset.id)) {
        newAssets.push(asset);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      setAssets(newAssets);
      toast.success(`${addedCount} templates de igreja carregados!`, {
        description: 'Os novos recursos agora estão disponíveis na sua biblioteca.'
      });
    } else {
      toast.info('Templates já carregados', {
        description: 'Todos os templates de igreja já estão na sua biblioteca.'
      });
    }
  };

  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        
        video.onloadedmetadata = () => {
          video.currentTime = 1; // Capture frame at 1 second
        };
        
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg'));
        };
        
        video.onerror = () => {
          // Fallback to a video icon or placeholder if frame capture fails
          resolve('https://images.unsplash.com/photo-1523733593134-a15d80966249?auto=format&fit=crop&q=80&w=400');
        };
        
        video.src = URL.createObjectURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    });
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setIsDraggingFile(false);

    try {
      const thumbnail = await generateThumbnail(file);
      const isVideo = file.type.startsWith('video/');
      
      // Get video duration if it's a video
      let duration = 'Estático';
      if (isVideo) {
        duration = await new Promise((resolve) => {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = () => {
            const minutes = Math.floor(video.duration / 60);
            const seconds = Math.floor(video.duration % 60);
            resolve(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          };
          video.onerror = () => resolve('00:00');
          video.src = URL.createObjectURL(file);
        });
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        const newAsset: MediaAsset = {
          id: Date.now().toString(),
          title: file.name,
          thumbnail: thumbnail,
          url: dataUrl, // Store the actual data URL in the url field
          type: isVideo ? 'video' : 'image',
          duration: duration,
          updatedAt: 'Agora mesmo',
          quality: isVideo ? 'HD' : '4K'
        };
        
        setAssets(prev => [newAsset, ...prev]);
        setIsUploading(false);
        toast.success('Arquivo enviado com sucesso!', {
          description: `${file.name} foi adicionado à sua biblioteca.`,
        });
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      toast.error('Erro ao processar arquivo.');
    }
  };

  const handleDropToUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      uploadFile(file);
    }
  };

  const handleDragOverToUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeaveToUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const filteredAssets = assets.filter(asset => {
    if (activeTab === 'all') return true;
    if (activeTab === 'playlist') {
      return asset.type === 'announcement' || playlist.some(item => item.assetId === asset.id);
    }
    return asset.type === activeTab;
  });

  const handleDragStartAsset = (e: React.DragEvent, asset: MediaAsset) => {
    setDraggedAsset(asset);
    e.dataTransfer.setData('assetId', asset.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragStartPlaylist = (e: React.DragEvent, index: number) => {
    setDraggedPlaylistIndex(index);
    e.dataTransfer.setData('playlistIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropToPlaylist = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAsset(false);
    
    const assetId = e.dataTransfer.getData('assetId');
    const playlistIndexStr = e.dataTransfer.getData('playlistIndex');

    // Handle Reordering
    if (playlistIndexStr !== '') {
      const sourceIndex = parseInt(playlistIndexStr);
      if (targetIndex !== undefined && sourceIndex !== targetIndex) {
        const newPlaylist = [...playlist];
        const [movedItem] = newPlaylist.splice(sourceIndex, 1);
        newPlaylist.splice(targetIndex, 0, movedItem);
        setPlaylist(newPlaylist);
        toast.success('Ordem atualizada');
      }
      setDraggedPlaylistIndex(null);
      return;
    }
    
    // Handle Adding from Library
    const asset = draggedAsset || assets.find(a => a.id === assetId);
    if (asset) {
      const newItem: PlaylistItem = {
        id: `p-${Date.now()}`,
        assetId: asset.id,
        title: asset.title,
        duration: asset.duration && asset.duration !== 'Estático' && asset.duration !== '00:00' ? asset.duration : '10s',
        type: asset.type === 'video' ? 'video' : 'image',
        thumbnail: asset.thumbnail,
        url: asset.url,
        // Copy styling for announcements
        content: asset.content,
        accentColor: asset.accentColor,
        layout: asset.layout,
        fontFamily: asset.fontFamily,
        textAlign: asset.textAlign,
        fontSize: asset.fontSize,
        transition: asset.transition,
        logoUrl: asset.logoUrl,
        logoPosition: asset.logoPosition,
      };

      if (targetIndex !== undefined) {
        const newPlaylist = [...playlist];
        newPlaylist.splice(targetIndex, 0, newItem);
        setPlaylist(newPlaylist);
      } else {
        setPlaylist([...playlist, newItem]);
      }
      toast.success('Adicionado à lista');
    }
    setDraggedAsset(null);
  };

  const handleRemoveFromPlaylist = (id: string) => {
    setPlaylist(playlist.filter(item => item.id !== id));
  };

  const handleDeleteAsset = (id: string) => {
    // Check if asset is in playlist
    if (playlist.some(item => item.assetId === id)) {
      toast.error('Não é possível excluir', {
        description: 'Este ativo está sendo usado em uma lista de reprodução.'
      });
      return;
    }

    setAssets(prev => prev.filter(asset => asset.id !== id));
    toast.success('Ativo removido da biblioteca');
  };

  const startEditing = (asset: MediaAsset) => {
    setEditingAssetId(asset.id);
    setEditTitle(asset.title);
  };

  const saveEdit = () => {
    if (!editingAssetId) return;
    if (!editTitle.trim()) {
      toast.error('O título não pode estar vazio');
      return;
    }

    setAssets(prev => prev.map(asset => 
      asset.id === editingAssetId ? { ...asset, title: editTitle } : asset
    ));
    
    // Also update playlist items if they use this asset title
    setPlaylist(prev => prev.map(item => 
      item.assetId === editingAssetId ? { ...item, title: editTitle } : item
    ));

    setEditingAssetId(null);
    toast.success('Título atualizado');
  };

  const handleClearPlaylist = () => {
    setPlaylist([]);
  };

  const handleBroadcast = async () => {
    if (playlist.length === 0) {
      toast.error('Lista vazia', {
        description: 'Adicione pelo menos um item à lista antes de transmitir.'
      });
      return;
    }

    const onlineScreens = availableScreens.filter(s => s.status === 'online');
    const targetIds = onlineScreens.length > 0 ? onlineScreens.map(s => s.id) : availableScreens.map(s => s.id);

    if (targetIds.length === 0) {
      toast.error('Nenhuma tela disponível', {
        description: 'Não há telas registradas para transmissão.'
      });
      return;
    }

    setIsPublishing(true);
    
    toast.info('Iniciando transmissão em broadcast...', {
      description: `Enviando para ${targetIds.length} telas.`
    });

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenIds: targetIds, playlist, mode: 'playlist' })
      });
      
      if (!response.ok) throw new Error('Falha ao transmitir no servidor');
      
      // Update local state for screens
      const savedScreens = localStorage.getItem('tv_screens');
      if (savedScreens) {
        try {
          const screens = JSON.parse(savedScreens);
          const updatedScreens = screens.map((s: TVScreen) => {
            if (targetIds.includes(s.id)) {
              return { 
                ...s, 
                currentContent: playlist[0]?.title || 'Playlist Ativa',
                status: 'online',
                lastSeen: 'Agora mesmo'
              };
            }
            return s;
          });
          localStorage.setItem('tv_screens', JSON.stringify(updatedScreens));
          setAvailableScreens(updatedScreens);
        } catch (e) {
          console.error('Error updating screen content:', e);
        }
      }

      toast.success('Transmissão Concluída!', {
        description: `A lista foi enviada em broadcast para todas as telas disponíveis.`,
        icon: <Share2 className="w-5 h-5 text-green-500" />
      });
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error('Erro na Transmissão', {
        description: 'Não foi possível conectar ao servidor de transmissão.'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSendNews = async () => {
    const onlineScreens = availableScreens.filter(s => s.status === 'online');
    const targetIds = onlineScreens.length > 0 ? onlineScreens.map(s => s.id) : availableScreens.map(s => s.id);

    if (targetIds.length === 0) {
      toast.error('Nenhuma tela disponível', {
        description: 'Não há telas registradas para enviar notícias.'
      });
      return;
    }

    setIsPublishing(true);
    
    toast.info('Enviando Notícias para as telas...', {
      description: `Ativando modo notícias em ${targetIds.length} telas.`
    });

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenIds: targetIds, mode: 'news' })
      });
      
      if (!response.ok) throw new Error('Falha ao enviar notícias');
      
      // Update local state for screens
      const savedScreens = localStorage.getItem('tv_screens');
      if (savedScreens) {
        try {
          const screens = JSON.parse(savedScreens);
          const updatedScreens = screens.map((s: TVScreen) => {
            if (targetIds.includes(s.id)) {
              return { 
                ...s, 
                currentContent: 'Modo Notícias',
                status: 'online',
                lastSeen: 'Agora mesmo'
              };
            }
            return s;
          });
          localStorage.setItem('tv_screens', JSON.stringify(updatedScreens));
          setAvailableScreens(updatedScreens);
        } catch (e) {
          console.error('Error updating screen content:', e);
        }
      }

      toast.success('Modo Notícias Ativado!', {
        description: `As telas selecionadas agora estão exibindo notícias.`,
        icon: <Newspaper className="w-5 h-5 text-[#ffb95f]" />
      });
    } catch (error) {
      console.error('Send news error:', error);
      toast.error('Erro ao enviar notícias');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublish = () => {
    if (playlist.length === 0) {
      toast.error('Lista vazia', {
        description: 'Adicione pelo menos um item à lista antes de publicar.'
      });
      return;
    }
    setIsPublishModalOpen(true);
  };

  const confirmPublish = async () => {
    if (selectedScreens.length === 0) {
      toast.error('Nenhuma tela selecionada', {
        description: 'Selecione pelo menos uma tela para enviar a lista.'
      });
      return;
    }

    if (!playlist || playlist.length === 0) {
      toast.error('A lista de reprodução está vazia');
      return;
    }

    setIsPublishing(true);
    
    // Simulate publishing to selected screens
    try {
      console.log(`Publishing to screens: ${selectedScreens.join(', ')}`, playlist);
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenIds: selectedScreens, playlist, mode: 'playlist' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao publicar no servidor');
      }
      
      const result = await response.json();
      console.log('Publish successful:', result);
      
      setIsPublishing(false);
      setIsPublishModalOpen(false);
      
      const screenNames = selectedScreens.map(id => 
        availableScreens.find(s => s.id === id)?.name || 'Tela'
      ).join(', ');

      // Update localStorage for screens to reflect the new content
      const savedScreens = localStorage.getItem('tv_screens');
      if (savedScreens) {
        try {
          const screens = JSON.parse(savedScreens);
          const updatedScreens = screens.map((s: TVScreen) => {
            if (selectedScreens.includes(s.id)) {
              return { 
                ...s, 
                currentContent: playlist[0]?.title || 'Playlist Ativa',
                status: 'online',
                lastSeen: 'Agora mesmo'
              };
            }
            return s;
          });
          localStorage.setItem('tv_screens', JSON.stringify(updatedScreens));
          setAvailableScreens(updatedScreens);
        } catch (e) {
          console.error('Error updating screen content:', e);
        }
      }

      toast.success('Publicação Concluída!', {
        description: `A lista foi enviada com sucesso para: ${screenNames}`,
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
      });
      
      setSelectedScreens([]);
    } catch (error) {
      console.error('Publish error:', error);
      setIsPublishing(false);
      toast.error('Erro na Publicação', {
        description: 'Não foi possível conectar ao servidor de transmissão.'
      });
    }
  };

  const toggleScreenSelection = (id: string) => {
    setSelectedScreens(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex h-full">
      {/* Library Section */}
      <section 
        className={`flex-1 flex flex-col bg-[#111c2d] min-w-0 relative transition-all ${isDraggingFile ? 'ring-4 ring-inset ring-[#ffb95f]/30 bg-[#152031]' : ''}`}
        onDrop={handleDropToUpload}
        onDragOver={handleDragOverToUpload}
        onDragLeave={handleDragLeaveToUpload}
      >
        {isDraggingFile && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#081425]/80 backdrop-blur-sm pointer-events-none">
            <div className="w-24 h-24 rounded-full bg-[#ffb95f]/10 flex items-center justify-center mb-4 border-2 border-dashed border-[#ffb95f]">
              <Upload className="w-10 h-10 text-[#ffb95f] animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-[#ffb95f] uppercase tracking-tighter">Solte para fazer Upload</h3>
            <p className="text-slate-400 mt-2">Imagens e Vídeos (MP4) são suportados</p>
          </div>
        )}
        <div className="p-8 pb-4 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#d8e3fb] mb-1">Biblioteca de Mídia</h2>
            <p className="text-slate-500 text-sm">Gerencie e descubra ativos para suas transmissões.</p>
          </div>
          <div className="flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/mp4"
              onChange={handleFileChange}
            />
            <button 
              onClick={loadChurchTemplates}
              className="flex items-center gap-2 px-4 py-2 bg-[#111c2d] border border-[#ffb95f]/20 text-[#ffb95f] rounded-md text-sm font-bold hover:bg-[#1f2a3c] transition-all"
            >
              <Plus className="w-4 h-4" />
              CARREGAR TEMPLATES IGREJA
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1f2a3c] rounded-md text-sm font-medium hover:bg-[#2a3548] transition-colors">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button 
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-[#ffb95f] text-[#472a00] rounded-md text-sm font-bold shadow-lg shadow-[#ffb95f]/10 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isUploading ? 'Enviando...' : 'Upload de Ativo'}
            </button>
          </div>
        </div>

        <div className="px-8 mb-6 flex gap-6 text-sm font-semibold border-b border-white/5">
          <button 
            onClick={() => setActiveTab('all')}
            className={`pb-3 transition-all ${activeTab === 'all' ? 'text-[#ffb95f] border-b-2 border-[#ffb95f]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Todos os Ativos
          </button>
          <button 
            onClick={() => setActiveTab('image')}
            className={`pb-3 transition-all ${activeTab === 'image' ? 'text-[#ffb95f] border-b-2 border-[#ffb95f]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Imagens
          </button>
          <button 
            onClick={() => setActiveTab('announcement')}
            className={`pb-3 transition-all ${activeTab === 'announcement' ? 'text-[#ffb95f] border-b-2 border-[#ffb95f]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Anúncios
          </button>
          <button 
            onClick={() => setActiveTab('playlist')}
            className={`pb-3 transition-all ${activeTab === 'playlist' ? 'text-[#ffb95f] border-b-2 border-[#ffb95f]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Listas de Reprodução
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => (
              <div 
                key={asset.id} 
                draggable
                onDragStart={(e) => handleDragStartAsset(e, asset)}
                className="group relative bg-[#2a3548] rounded-lg overflow-hidden border border-white/5 hover:border-[#b7c8e1]/30 transition-all flex flex-col cursor-grab active:cursor-grabbing"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img src={asset.thumbnail} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040e1f] to-transparent opacity-60"></div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#111c2d]/80 backdrop-blur text-[10px] font-bold text-[#d8e3fb]">{asset.duration}</span>
                    {asset.quality && (
                      <span className="px-2 py-0.5 rounded bg-[#b7c8e1]/20 backdrop-blur text-[10px] font-bold text-[#b7c8e1]">{asset.quality}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      const newItem: PlaylistItem = {
                        id: `p-${Date.now()}`,
                        assetId: asset.id,
                        title: asset.title,
                        duration: asset.duration || '00:00',
                        type: asset.type === 'video' ? 'video' : 'image',
                        thumbnail: asset.thumbnail,
                        url: asset.url,
                        content: asset.content,
                        accentColor: asset.accentColor,
                        layout: asset.layout,
                        fontFamily: asset.fontFamily,
                        textAlign: asset.textAlign,
                        fontSize: asset.fontSize,
                        transition: asset.transition,
                        logoUrl: asset.logoUrl,
                        logoPosition: asset.logoPosition,
                      };
                      setPlaylist([...playlist, newItem]);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#111c2d]/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#ffb95f] hover:text-[#472a00]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  {editingAssetId === asset.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        className="flex-1 bg-[#111c2d] border border-[#ffb95f]/50 rounded px-2 py-1 text-xs text-[#d8e3fb] focus:outline-none focus:ring-1 focus:ring-[#ffb95f]"
                      />
                      <button onClick={saveEdit} className="text-[#ffb95f] hover:text-white">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingAssetId(null)} className="text-slate-500 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group/title">
                      <h3 className="font-bold text-sm text-[#d8e3fb] line-clamp-1 flex-1">{asset.title}</h3>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEditing(asset)}
                          className="p-1 text-slate-500 hover:text-[#ffb95f] transition-colors"
                          title="Editar título"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-1 text-slate-500 hover:text-[#ffb4ab] transition-colors"
                          title="Excluir ativo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1 uppercase">{asset.type} • Atualizado há {asset.updatedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Playlist Editor Section */}
      <aside className="w-[450px] bg-[#081425] flex flex-col border-l border-white/5">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#ffb95f] tracking-[0.2em] uppercase">Editor de Playlist</span>
            <span className="px-2 py-1 rounded-full bg-[#ffb4ab]/10 text-[#ffb4ab] text-[10px] font-bold">Rascunho</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#d8e3fb]">Lista de Reprodução</h2>
          
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <PlayCircle className="w-4 h-4" />
              {playlist.length > 0 ? `${playlist.length * 5}m total` : '0m total'}
            </div>
            <div className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              {playlist.length} itens
            </div>
          </div>
        </div>

        <div 
          className={`flex-1 overflow-y-auto px-6 py-4 space-y-3 custom-scrollbar min-h-[200px] transition-all ${isDraggingAsset ? 'bg-[#ffb95f]/5 ring-2 ring-inset ring-[#ffb95f]/20' : ''}`}
          onDrop={(e) => handleDropToPlaylist(e)}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            setIsDraggingAsset(true);
          }}
          onDragLeave={() => setIsDraggingAsset(false)}
        >
          {playlist.length === 0 && !isDraggingAsset && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 py-20">
              <GripVertical className="w-12 h-12 mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest">Sua lista está vazia</p>
              <p className="text-xs mt-2">Arraste ativos aqui para começar</p>
            </div>
          )}
          {playlist.map((item, index) => (
            <div 
              key={item.id} 
              draggable
              onDragStart={(e) => handleDragStartPlaylist(e, index)}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(e) => handleDropToPlaylist(e, index)}
              className={`flex items-center gap-4 p-3 rounded-lg border border-white/5 group transition-all cursor-move ${
                item.isActive ? 'bg-[#2a3548] ring-1 ring-[#b7c8e1]/40' : 'bg-[#152031] hover:bg-[#1f2a3c]'
              } ${draggedPlaylistIndex === index ? 'opacity-40 grayscale' : ''}`}
            >
              <div className={`flex flex-col items-center ${item.isActive ? 'text-[#b7c8e1]' : 'text-slate-600 group-hover:text-[#b7c8e1]'}`}>
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="w-16 aspect-video rounded bg-[#2a3548] overflow-hidden shrink-0">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`text-xs font-bold truncate ${item.isActive ? 'text-[#b7c8e1]' : 'text-[#d8e3fb]'}`}>{item.title}</h4>
                  {item.isActive && <span className="px-1.5 py-0.5 rounded bg-[#ffb95f] text-[8px] text-[#472a00] font-black uppercase">Ativo</span>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500">{item.duration}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span className="text-[10px] text-slate-500 uppercase">{item.type}</span>
                </div>
              </div>
              <button 
                onClick={() => handleRemoveFromPlaylist(item.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-[#ffb4ab] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          
          <div className="py-6 border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-600 hover:border-slate-700 hover:text-slate-500 transition-all cursor-pointer">
            <Plus className="w-6 h-6 mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Arraste os ativos aqui</span>
          </div>
        </div>

        <div className="p-8 bg-[#111c2d] border-t border-white/5 space-y-3">
          <div className="space-y-3">
            <button 
              onClick={handlePublish}
              className="w-full py-4 rounded-md bg-[#ffb95f] text-[#472a00] font-extrabold flex items-center justify-center gap-2 hover:opacity-90 shadow-xl shadow-[#ffb95f]/5 transition-all active:scale-[0.98]"
            >
              <Upload className="w-5 h-5" />
              Publicar Alterações
            </button>
            <button 
              onClick={handleBroadcast}
              disabled={isPublishing}
              className="w-full py-3 rounded-md bg-[#2a3548] text-[#ffb95f] text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors border border-[#ffb95f]/20"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              Transmitir para Todas (Broadcast)
            </button>
            <button 
              onClick={handleSendNews}
              disabled={isPublishing}
              className="w-full py-3 rounded-md bg-[#111c2d] text-[#ffb95f] text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors border border-[#ffb95f]/20"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Newspaper className="w-4 h-4" />}
              Enviar Notícias para Telas
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 rounded-md bg-[#2a3548] text-[#d8e3fb] text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
              Visualizar
            </button>
            <button 
              onClick={handleClearPlaylist}
              className="py-3 rounded-md bg-[#2a3548] text-[#ffb4ab] text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#ffb4ab]/10 transition-colors"
            >
              Limpar Lista
            </button>
          </div>
        </div>
      </aside>

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111c2d] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-[#152031] to-[#111c2d]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#ffb95f]/10 flex items-center justify-center">
                  <Monitor className="text-[#ffb95f] w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#d8e3fb]">Publicar para Telas</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Selecione os destinos</p>
                </div>
              </div>
              <button 
                onClick={() => !isPublishing && setIsPublishModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-400">Escolha para quais telas você deseja enviar a lista:</p>
                  <button 
                    onClick={() => {
                      if (selectedScreens.length === availableScreens.length) {
                        setSelectedScreens([]);
                      } else {
                        setSelectedScreens(availableScreens.map(s => s.id));
                      }
                    }}
                    className="text-[10px] font-bold text-[#ffb95f] hover:underline uppercase tracking-wider"
                  >
                    {selectedScreens.length === availableScreens.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {availableScreens.map((screen) => (
                    <button
                      key={screen.id}
                      onClick={() => toggleScreenSelection(screen.id)}
                      disabled={isPublishing}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        selectedScreens.includes(screen.id)
                          ? 'bg-[#ffb95f]/10 border-[#ffb95f] text-[#ffb95f]'
                          : 'bg-[#081425] border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <Monitor className={`w-5 h-5 ${selectedScreens.includes(screen.id) ? 'text-[#ffb95f]' : 'text-slate-600'}`} />
                        <div>
                          <p className="text-sm font-bold">{screen.name}</p>
                          <p className="text-[10px] opacity-60 uppercase">{screen.model} • {screen.ip}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        selectedScreens.includes(screen.id)
                          ? 'bg-[#ffb95f] border-[#ffb95f]'
                          : 'border-white/20'
                      }`}>
                        {selectedScreens.includes(screen.id) && <Check className="w-3 h-3 text-[#472a00]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setIsPublishModalOpen(false)}
                  disabled={isPublishing}
                  className="flex-1 py-3 bg-[#2a3548] text-[#d8e3fb] font-bold rounded-lg hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmPublish}
                  disabled={isPublishing || selectedScreens.length === 0}
                  className="flex-1 py-3 bg-[#ffb95f] text-[#472a00] font-bold rounded-lg shadow-lg shadow-[#ffb95f]/10 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Publicar Agora
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {isPublishing && (
              <div className="px-6 pb-6">
                <div className="h-1 w-full bg-[#081425] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ffb95f] animate-progress-fast"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
