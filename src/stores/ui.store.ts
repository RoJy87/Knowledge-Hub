import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(true);
  const theme = ref<'light' | 'dark'>('light');
  const toasts = ref<Toast[]>([]);

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme;
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  }

  function initTheme() {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
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
    toasts,
    toggleSidebar,
    setTheme,
    initTheme,
    addToast,
    removeToast,
  };
});
