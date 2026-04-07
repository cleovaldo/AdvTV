export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'admin' | 'screen';
  name: string;
  defaultPath?: string;
  status: 'active' | 'inactive' | 'pending';
}

export type ScreenType = 'dashboard' | 'screens' | 'playlists' | 'library' | 'settings' | 'studio' | 'news' | 'holyrics';

export interface MediaAsset {
  id: string;
  title: string;
  type: 'image' | 'video' | 'announcement';
  thumbnail: string;
  url?: string;
  duration?: string;
  quality?: string;
  updatedAt: string;
  // Optional styling for announcements
  content?: string;
  accentColor?: string;
  layout?: 'classic' | 'modern' | 'minimal';
  fontFamily?: 'sans' | 'serif' | 'mono';
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
  contentFontSize?: number;
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
  logoUrl?: string;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface PlaylistItem {
  id: string;
  assetId?: string;
  title: string;
  content?: string;
  duration: string | number;
  type: 'image' | 'video';
  thumbnail: string;
  url?: string;
  accentColor?: string;
  layout?: 'classic' | 'modern' | 'minimal';
  fontFamily?: 'sans' | 'serif' | 'mono';
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
  contentFontSize?: number;
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
  logoUrl?: string;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  isActive?: boolean;
}

export interface TVScreen {
  id: string;
  name: string;
  ip: string;
  model: string;
  status: 'online' | 'offline' | 'waiting';
  currentContent: string;
  lastSeen: string;
  latency: number; // in ms
  cpuUsage: number; // percentage
  gpuUsage: number; // percentage
  temperature: number; // in Celsius
  isPowerOn: boolean;
}
