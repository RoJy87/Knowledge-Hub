<template>
  <div class="auth-page min-h-screen flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">DocSpace</h1>
        <p class="mt-2 text-slate-600">{{ t('auth.signInSubtitle') }}</p>
      </div>

      <div class="surface-card p-8">
        <form @submit="onSubmit" class="space-y-5">
          <div>
            <label for="email" class="mb-1 block text-sm font-medium text-slate-700">
              {{ t('auth.email') }}
            </label>
            <input
              id="email"
              v-model="email"
              v-bind="emailProps"
              type="email"
              class="input-field"
              :class="{ 'border-rose-400': errors.email }"
              :placeholder="'you@example.com'"
              autocomplete="email"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-rose-600">{{ errors.email }}</p>
          </div>

          <div>
            <label for="password" class="mb-1 block text-sm font-medium text-slate-700">
              {{ t('auth.password') }}
            </label>
            <input
              id="password"
              v-model="password"
              v-bind="passwordProps"
              type="password"
              class="input-field"
              :class="{ 'border-rose-400': errors.password }"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-rose-600">{{ errors.password }}</p>
          </div>

          <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="isSubmitting">
            <span v-if="isSubmitting">{{ t('auth.signingIn') }}</span>
            <span v-else>{{ t('auth.signIn') }}</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-slate-600">
            {{ t('auth.noAccount') }}
            <router-link to="/register" class="font-semibold text-[var(--color-brand-700)] hover:underline">
              {{ t('auth.signUp') }}
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
import { useLocale } from '@/composables/useLocale';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();
const { t } = useLocale();

const schema = yup.object({
  email: yup.string().required(t('auth.validationEmailRequired')).email(t('auth.validationEmailInvalid')),
  password: yup.string().required(t('auth.validationPasswordRequired')),
});

const { defineField, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: {
    email: '',
    password: '',
  },
});

const [email, emailProps] = defineField('email');
const [password, passwordProps] = defineField('password');

const error = ref('');

const onSubmit = handleSubmit(async (values) => {
  error.value = '';

  try {
    await authStore.login(values.email, values.password);
    uiStore.addToast(t('auth.welcomeBack'), 'success');
    router.push('/');
  } catch (e: any) {
    error.value = e.response?.data?.message || t('auth.signInFailed');
    uiStore.addToast(error.value, 'error');
  }
});
</script>