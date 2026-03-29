import type { VideoSource } from '../types';

export interface ParsedVideoUrl {
  source: VideoSource;
  videoId: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
}

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

const VIMEO_REGEX = /vimeo\.com\/(?:video\/)?(\d+)/;

const DAILYMOTION_REGEX =
  /dailymotion\.com\/(?:video\/|embed\/video\/)([A-Za-z0-9]+)/;

export function parseVideoUrl(url: string): ParsedVideoUrl {
  // YouTube
  const ytMatch = url.match(YOUTUBE_REGEX);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      source: 'youtube',
      videoId: id,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(VIMEO_REGEX);
  if (vimeoMatch) {
    const id = vimeoMatch[1];
    return {
      source: 'vimeo',
      videoId: id,
      embedUrl: `https://player.vimeo.com/video/${id}`,
      thumbnailUrl: null, // requires API call
    };
  }

  // Dailymotion
  const dmMatch = url.match(DAILYMOTION_REGEX);
  if (dmMatch) {
    const id = dmMatch[1];
    return {
      source: 'dailymotion',
      videoId: id,
      embedUrl: `https://www.dailymotion.com/embed/video/${id}`,
      thumbnailUrl: `https://www.dailymotion.com/thumbnail/video/${id}`,
    };
  }

  return {
    source: 'other',
    videoId: null,
    embedUrl: url,
    thumbnailUrl: null,
  };
}

export function detectSource(url: string): VideoSource {
  return parseVideoUrl(url).source;
}
