<template>
  <div class="app-shell">
    <aside class="app-sidebar">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="eyebrow">{{ t('shell.workspace') }}</p>
          <router-link to="/" class="mt-1 inline-flex text-2xl font-bold tracking-tight text-slate-900">
            DocSpace
          </router-link>
          <p class="mt-2 max-w-40 text-sm leading-6 text-slate-500">
            {{ t('shell.brandDescription') }}
          </p>
        </div>
        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--app-border)] bg-white/70 text-slate-600 lg:hidden"
          type="button"
          @click="toggleSidebar"
          :aria-label="t('shell.toggleNavigation')"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>

      <div class="mt-8 space-y-2" :class="{ hidden: !sidebarOpen }">
        <router-link v-for="item in navigation" :key="item.to" :to="item.to" class="nav-item">
          <component :is="item.icon" class="h-5 w-5" />
          <span>{{ t(item.labelKey) }}</span>
        </router-link>
      </div>

      <div class="mt-10 rounded-[1.25rem] border border-[var(--app-border)] bg-white/70 p-4" :class="{ hidden: !sidebarOpen }">
        <p class="eyebrow">{{ t('shell.focusNow') }}</p>
        <h3 class="mt-2 text-base font-semibold text-slate-900">{{ t('shell.focusCardTitle') }}</h3>
        <p class="mt-2 text-sm leading-6 text-slate-500">
          {{ t('shell.focusCardDescription') }}
        </p>
        <router-link to="/articles" class="mt-4 inline-flex text-sm font-semibold text-[var(--color-brand-700)]">
          {{ t('shell.openDocuments') }}
        </router-link>
      </div>
    </aside>

    <div class="app-main">
      <header class="app-topbar">
        <label class="search-field">
          <svg class="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M21 21l-4.35-4.35m1.85-5.65a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
          </svg>
          <input type="text" :placeholder="t('common.searchPlaceholder')" />
        </label>

        <div class="flex items-center gap-3">
          <div class="hidden items-center gap-1 rounded-2xl border border-[var(--app-border)] bg-white/80 p-1 sm:inline-flex">
            <button
              v-for="option in localeOptions"
              :key="option.value"
              type="button"
              class="rounded-xl px-3 py-2 text-xs font-semibold transition"
              :class="option.value === locale ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'"
              @click="handleLocaleChange(option.value)"
            >
              {{ option.label }}
            </button>
          </div>

          <button type="button" class="btn-primary hidden sm:inline-flex">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 5v14m-7-7h14" />
            </svg>
            <span>{{ t('common.newDocument') }}</span>
          </button>

          <router-link
            to="/profile"
            class="inline-flex items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-white/80 px-3 py-2"
          >
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-100)] font-semibold text-[var(--color-brand-700)]">
              {{ userInitials }}
            </span>
            <span class="hidden text-left sm:block">
              <span class="block text-sm font-semibold text-slate-900">{{ userName }}</span>
              <span class="block text-xs text-slate-500">{{ userRole }}</span>
            </span>
          </router-link>
        </div>
      </header>

      <main class="app-page">
        <slot />
      </main>
    </div>

    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-card"
        :data-tone="toast.type"
      >
        <span class="text-sm font-medium">{{ toast.message }}</span>
        <button class="ml-auto inline-flex text-current/70" type="button" :aria-label="t('shell.dismissNotification')" @click="removeToast(toast.id)">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue';
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { useLocale } from '@/composables/useLocale';
import type { Locale } from '@/locales/messages';

function createIcon(path: string) {
  return defineComponent({
    name: 'LayoutIcon',
    setup() {
      return () =>
        h(
          'svg',
          { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },
          [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: path })],
        );
    },
  });
}

const DashboardIcon = createIcon('M4 5.5h7v5H4zM13 5.5h7v13h-7zM4 12.5h7V19H4z');
const ProjectsIcon = createIcon('M3.5 7.5h6l1.8 2H20.5v8.5a1 1 0 01-1 1h-15a1 1 0 01-1-1z');
const DocumentsIcon = createIcon('M7 4.5h7l4 4V19a1 1 0 01-1 1H7a1 1 0 01-1-1v-13a1 1 0 011-1zM13 4.5V9h4');
const ActivityIcon = createIcon('M4 13h3l2-7 4 12 2-5h5');
const FavoritesIcon = createIcon('M12 20l-6.5-6.2a4.3 4.3 0 116.1-6l.4.4.4-.4a4.3 4.3 0 116.1 6z');
const SettingsIcon = createIcon('M10.3 4.5l.6-1.5h2.2l.6 1.5 1.7.7 1.5-.6 1.6 1.6-.6 1.5.7 1.7 1.5.6v2.2l-1.5.6-.7 1.7.6 1.5-1.6 1.6-1.5-.6-1.7.7-.6 1.5h-2.2l-.6-1.5-1.7-.7-1.5.6-1.6-1.6.6-1.5-.7-1.7-1.5-.6V10.7l1.5-.6.7-1.7-.6-1.5 1.6-1.6 1.5.6zM12 15.2A3.2 3.2 0 1012 8.8a3.2 3.2 0 000 6.4z');

const navigation = [
  { labelKey: 'common.dashboard', to: '/', icon: DashboardIcon },
  { labelKey: 'common.projects', to: '/projects', icon: ProjectsIcon },
  { labelKey: 'common.documents', to: '/articles', icon: DocumentsIcon },
  { labelKey: 'common.activity', to: '/activity', icon: ActivityIcon },
  { labelKey: 'common.favorites', to: '/favorites', icon: FavoritesIcon },
  { labelKey: 'common.settings', to: '/profile', icon: SettingsIcon },
];

const uiStore = useUiStore();
const authStore = useAuthStore();
const { t, locale, locales } = useLocale();

const { sidebarOpen, toasts } = storeToRefs(uiStore);
const { toggleSidebar, removeToast, setLocale } = uiStore;

const localeOptions = computed(() =>
  locales.map((item) => ({
    value: item.value,
    label: item.value.toUpperCase(),
  })),
);

const userInitials = computed(() => {
  if (!authStore.user) return 'DS';
  return `${authStore.user.firstName[0] ?? ''}${authStore.user.lastName[0] ?? ''}`.toUpperCase();
});

const userName = computed(() => {
  if (!authStore.user) return t('shell.workspaceGuest');
  return `${authStore.user.firstName} ${authStore.user.lastName}`;
});

const userRole = computed(() => {
  if (!authStore.user) return t('shell.viewer');
  return authStore.user.role === 'ADMIN' ? t('shell.workspaceAdmin') : t('shell.teamMember');
});

function handleLocaleChange(nextLocale: Locale) {
  setLocale(nextLocale);
}
</script>
