<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary-600 mb-2">Knowledge Hub</h1>
        <p class="text-gray-600">Create your account</p>
      </div>

      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                class="input-field"
                placeholder="John"
                required
              />
            </div>

            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                class="input-field"
                placeholder="Doe"
                required
              />
            </div>
          </div>

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
              minlength="8"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              class="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="error" class="text-red-500 text-sm">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="loading">
            <span v-if="loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <router-link to="/login" class="text-primary-600 hover:underline">
              Sign in
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
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await authStore.register(form.email, form.password, form.firstName, form.lastName);
    uiStore.addToast('Account created successfully!', 'success');
    router.push('/');
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to create account';
    uiStore.addToast(error.value, 'error');
  } finally {
    loading.value = false;
  }
}
</script>
