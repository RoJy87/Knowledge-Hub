import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Locale } from '@/locales/messages';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const RECENT_SEARCHES_KEY = 'recent-searches';
const MAX_RECENT_SEARCHES = 8;

function readRecentSearches() {
  if (typeof localStorage === 'undefined') return [] as string[];

  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true);
  const theme = ref<'light' | 'dark'>('light');
  const locale = ref<Locale>('ru');
  const toasts = ref<Toast[]>([]);
  const recentSearches = ref<string[]>(readRecentSearches());

  function persistRecentSearches() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches.value));
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme;
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  }

  function setLocale(newLocale: Locale) {
    locale.value = newLocale;
    document.documentElement.lang = newLocale;
    localStorage.setItem('locale', newLocale);
  }

  function initTheme() {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }

  function initLocale() {
    const storedLocale = localStorage.getItem('locale') as Locale | null;
    if (storedLocale === 'ru' || storedLocale === 'en') {
      setLocale(storedLocale);
      return;
    }

    const browserLocale = navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
    setLocale(browserLocale);
  }

  function addRecentSearch(query: string) {
    const normalized = query.trim();
    if (!normalized) return;

    recentSearches.value = [normalized, ...recentSearches.value.filter((item) => item !== normalized)].slice(0, MAX_RECENT_SEARCHES);
    persistRecentSearches();
  }

  function clearRecentSearches() {
    recentSearches.value = [];
    persistRecentSearches();
  }

  function addToast(message: string, type: Toast['type'] = 'info') {
    const id = Date.now().toString();
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  }

  return {
    sidebarOpen,
    theme,
    locale,
    toasts,
    recentSearches,
    toggleSidebar,
    setTheme,
    setLocale,
    initTheme,
    initLocale,
    addRecentSearch,
    clearRecentSearches,
    addToast,
    removeToast,
  };
});