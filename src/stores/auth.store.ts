import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth.api';
import type { User } from '@/types/models';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string>(localStorage.getItem('access_token') || '');
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');

  async function login(email: string, password: string) {
    const response = await authApi.login({ email, password });
    user.value = response.user;
    accessToken.value = response.accessToken;
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  async function register(email: string, password: string, firstName: string, lastName: string) {
    const response = await authApi.register({ email, password, firstName, lastName });
    user.value = response.user;
    accessToken.value = response.accessToken;
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore logout errors
    }
    user.value = null;
    accessToken.value = '';
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  async function loadUser() {
    try {
      const userData = await authApi.getCurrentUser();
      user.value = userData;
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      user.value = null;
    }
  }

  function initFromStorage() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('access_token');
    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser);
        accessToken.value = storedToken;
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    }
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    loadUser,
    initFromStorage,
  };
});
