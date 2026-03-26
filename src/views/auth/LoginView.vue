<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-600 mb-2">Knowledge Hub</h1>
        <p class="text-gray-600">Sign in to your account</p>
      </div>

      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="error" class="text-red-500 text-sm text-center">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="loading">
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <router-link to="/register" class="text-primary-600 hover:underline">
              Sign up
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();

const form = reactive({
  email: '',
  password: '',
});

const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  loading.value = true;
  error.value = '';

  try {
    await authStore.login(form.email, form.password);
    uiStore.addToast('Welcome back!', 'success');
    router.push('/');
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to sign in';
    uiStore.addToast(error.value, 'error');
  } finally {
    loading.value = false;
  }
}
</script>
