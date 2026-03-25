<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
      <div class="flex items-center justify-between px-4 py-3">
        <div class="flex items-center gap-4">
          <button
            @click="toggleSidebar"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <router-link to="/" class="text-xl font-bold text-primary-600">
            Knowledge Hub
          </router-link>
        </div>

        <div class="flex items-center gap-4">
          <!-- Search -->
          <div class="relative">
            <input
              type="text"
              placeholder="Search..."
              class="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Notifications -->
          <button class="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <!-- User menu -->
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
              {{ userInitials }}
            </div>
            <span class="text-sm font-medium text-gray-700">{{ userName }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-20 overflow-hidden',
        sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'
      ]"
    >
      <nav class="mt-16 px-4 space-y-2">
        <router-link to="/projects" class="sidebar-link">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Projects
        </router-link>

        <router-link to="/articles" class="sidebar-link">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-9-1h4" />
          </svg>
          Articles
        </router-link>

        <router-link to="/favorites" class="sidebar-link">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Favorites
        </router-link>

        <router-link to="/activity" class="sidebar-link">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Activity
        </router-link>

        <router-link to="/profile" class="sidebar-link">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile
        </router-link>
      </nav>
    </aside>

    <!-- Main content -->
    <main
      :class="[
        'transition-all duration-300 min-h-screen',
        sidebarOpen ? 'ml-64' : 'ml-0'
      ]"
    >
      <div class="pt-16">
        <slot />
      </div>
    </main>

    <!-- Toast notifications -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in',
          toast.type === 'success' ? 'bg-green-500 text-white' : '',
          toast.type === 'error' ? 'bg-red-500 text-white' : '',
          toast.type === 'info' ? 'bg-blue-500 text-white' : '',
          toast.type === 'warning' ? 'bg-yellow-500 text-white' : ''
        ]"
      >
        <span>{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="ml-auto hover:opacity-75">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';

const uiStore = useUiStore();
const authStore = useAuthStore();

const { sidebarOpen, toasts } = storeToRefs(uiStore);
const { toggleSidebar, removeToast } = uiStore;

const userInitials = computed(() => {
  if (!authStore.user) return '?';
  return `${authStore.user.firstName[0]}${authStore.user.lastName[0]}`.toUpperCase();
});

const userName = computed(() => {
  if (!authStore.user) return 'Guest';
  return `${authStore.user.firstName} ${authStore.user.lastName}`;
});
</script>

<style scoped>
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
</style>
