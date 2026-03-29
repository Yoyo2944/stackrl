export type VideoSource = 'youtube' | 'vimeo' | 'dailymotion' | 'other';
export type ViewMode = 'list' | 'stack';
export type Theme = 'dark' | 'light';

export interface Video {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration: number; // seconds
  source: VideoSource;
  addedAt: string; // ISO date
  isFavorite: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  category: string;
  videos: Video[];
  viewMode: ViewMode;
  createdAt: string; // ISO date
  coverImage?: string;
}

export interface AppSettings {
  theme: Theme;
  defaultViewMode: ViewMode;
}
