import * as React from 'react';

export interface QuranPlaylistItem {
  id: string;
  reciterId: string;
  surahNumber: number;
}

export interface QuranPlaylist {
  id: string;
  name: string;
  createdAt: number;
  items: QuranPlaylistItem[];
}

const STORAGE_KEY = 'subul-quran-playlists-v1';
const CHANGE_EVENT = 'subul:quran-playlists-change';

function isPlaylistItem(value: unknown): value is QuranPlaylistItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.reciterId === 'string' &&
    Number.isInteger(item.surahNumber) &&
    Number(item.surahNumber) >= 1 &&
    Number(item.surahNumber) <= 114
  );
}

function isPlaylist(value: unknown): value is QuranPlaylist {
  if (!value || typeof value !== 'object') return false;
  const playlist = value as Record<string, unknown>;
  return (
    typeof playlist.id === 'string' &&
    typeof playlist.name === 'string' &&
    typeof playlist.createdAt === 'number' &&
    Array.isArray(playlist.items) &&
    playlist.items.every(isPlaylistItem)
  );
}

export function loadQuranPlaylists(): QuranPlaylist[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed) || !parsed.every(isPlaylist)) {
    throw new Error('تعذر قراءة قوائم التشغيل المحفوظة على هذا الجهاز.');
  }
  return parsed;
}

export function saveQuranPlaylists(playlists: QuranPlaylist[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useQuranPlaylists() {
  const [playlists, setPlaylists] = React.useState<QuranPlaylist[]>([]);
  const [error, setError] = React.useState('');

  const refresh = React.useCallback(() => {
    try {
      setPlaylists(loadQuranPlaylists());
      setError('');
    } catch {
      setError('تعذر تحميل قوائم التشغيل من مساحة التخزين المحلية.');
    }
  }, []);

  React.useEffect(() => {
    refresh();
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  return { playlists, error, refresh };
}
