import { MediaAsset, PlaylistItem, TVScreen } from './types';

export const MEDIA_ASSETS: MediaAsset[] = [
  {
    id: '3',
    title: 'Announcement: Youth Retreat 2024',
    type: 'announcement',
    thumbnail: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800',
    duration: '15s',
    updatedAt: '1 semana',
  },
  {
    id: '5',
    title: 'Church Picnic Flyer',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1504150559654-7255e7c51455?auto=format&fit=crop&q=80&w=800',
    duration: 'Estático',
    updatedAt: '3 dias',
  },
  {
    id: '6',
    title: 'Weekly Bulletin - March',
    type: 'announcement',
    thumbnail: 'https://images.unsplash.com/photo-1517673132405-a56a62b18acc?auto=format&fit=crop&q=80&w=800',
    duration: '30s',
    updatedAt: 'Ontem',
  }
];

export const PLAYLIST_ITEMS: PlaylistItem[] = [
  {
    id: 'p2',
    assetId: '3',
    title: 'Welcome Announcement',
    duration: '15s',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800',
  }
];

export const TV_SCREENS: TVScreen[] = [
  {
    id: 's1',
    name: 'Terminal Santuário 01',
    ip: '192.168.1.101',
    model: 'Samsung Q70 Smart TV',
    status: 'online',
    currentContent: 'Sem transmissão ativa',
    lastSeen: 'Agora mesmo',
    latency: 12,
    cpuUsage: 45,
    gpuUsage: 30,
    temperature: 42,
    isPowerOn: true
  },
  {
    id: 's2',
    name: 'Terminal Recepção 02',
    ip: '192.168.1.102',
    model: 'LG OLED C2',
    status: 'online',
    currentContent: 'Sem transmissão ativa',
    lastSeen: 'Agora mesmo',
    latency: 18,
    cpuUsage: 55,
    gpuUsage: 40,
    temperature: 48,
    isPowerOn: true
  },
  {
    id: 's3',
    name: 'Terminal Kids 03',
    ip: '192.168.1.103',
    model: 'Sony Bravia XR',
    status: 'offline',
    currentContent: 'Sem transmissão ativa',
    lastSeen: 'Há 2 horas',
    latency: 0,
    cpuUsage: 0,
    gpuUsage: 0,
    temperature: 22,
    isPowerOn: false
  }
];

export const USERS = [
  {
    id: 'u1',
    email: 'admin@saraivabatista.tv',
    password: 'admin',
    role: 'admin',
    name: 'Cleovaldo Admin',
    status: 'active',
  },
  {
    id: 's1',
    email: 'tela1@saraivabatista.tv',
    password: 'tela',
    role: 'screen',
    name: 'Terminal Santuário 01',
    defaultPath: '/display',
    status: 'active',
  },
  {
    id: 's2',
    email: 'tela2@saraivabatista.tv',
    password: 'tela',
    role: 'screen',
    name: 'Terminal Recepção 02',
    defaultPath: '/news',
    status: 'active',
  },
  {
    id: 's3',
    email: 'tela3@saraivabatista.tv',
    password: 'tela',
    role: 'screen',
    name: 'Terminal Kids 03',
    defaultPath: '/display',
    status: 'inactive',
  }
];
