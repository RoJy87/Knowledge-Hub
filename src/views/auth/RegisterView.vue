<template>
  <div class="auth-page min-h-screen flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-900">DocSpace</h1>
        <p class="mt-2 text-slate-600">{{ t('auth.registerSubtitle') }}</p>
      </div>

      <div class="surface-card p-8">
        <form @submit="onSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('auth.firstName') }}
              </label>
              <input
                id="firstName"
                v-model="firstName"
                v-bind="firstNameProps"
                type="text"
                class="input-field"
                :class="{ 'border-rose-400': errors.firstName }"
                placeholder="John"
                autocomplete="given-name"
              />
              <p v-if="errors.firstName" class="mt-1 text-sm text-rose-600">{{ errors.firstName }}</p>
            </div>

            <div>
              <label for="lastName" class="mb-1 block text-sm font-medium text-slate-700">
                {{ t('auth.lastName') }}
              </label>
              <input
                id="lastName"
                v-model="lastName"
                v-bind="lastNameProps"
                type="text"
                class="input-field"
                :class="{ 'border-rose-400': errors.lastName }"
                placeholder="Doe"
                autocomplete="family-name"
              />
              <p v-if="errors.lastName" class="mt-1 text-sm text-rose-600">{{ errors.lastName }}</p>
            </div>
          </div>

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
              placeholder="you@example.com"
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
              autocomplete="new-password"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-rose-600">{{ errors.password }}</p>
          </div>

          <div>
            <label for="confirmPassword" class="mb-1 block text-sm font-medium text-slate-700">
              {{ t('auth.confirmPassword') }}
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              v-bind="confirmPasswordProps"
              type="password"
              class="input-field"
              :class="{ 'border-rose-400': errors.confirmPassword }"
              placeholder="••••••••"
              autocomplete="new-password"
            />
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-rose-600">{{ errors.confirmPassword }}</p>
          </div>

          <div v-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary w-full" :disabled="isSubmitting">
            <span v-if="isSubmitting">{{ t('auth.creatingAccount') }}</span>
            <span v-else>{{ t('auth.createAccount') }}</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-slate-600">
            {{ t('auth.haveAccount') }}
            <router-link to="/login" class="font-semibold text-[var(--color-brand-700)] hover:underline">
              {{ t('auth.signIn') }}
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
  firstName: yup.string().trim().required(t('auth.validationFirstNameRequired')),
  lastName: yup.string().trim().required(t('auth.validationLastNameRequired')),
  email: yup.string().required(t('auth.validationEmailRequired')).email(t('auth.validationEmailInvalid')),
  password: yup.string().required(t('auth.validationPasswordRequired')).min(8, t('auth.validationPasswordShort')),
  confirmPassword: yup
    .string()
    .required(t('auth.validationConfirmRequired'))
    .oneOf([yup.ref('password')], t('auth.validationPasswordMismatch')),
});

const { defineField, handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
});

const [firstName, firstNameProps] = defineField('firstName');
const [lastName, lastNameProps] = defineField('lastName');
const [email, emailProps] = defineField('email');
const [password, passwordProps] = defineField('password');
const [confirmPassword, confirmPasswordProps] = defineField('confirmPassword');

const error = ref('');

const onSubmit = handleSubmit(async (values) => {
  error.value = '';

  try {
    await authStore.register(values.email, values.password, values.firstName, values.lastName);
    uiStore.addToast(t('auth.accountCreated'), 'success');
    router.push('/');
  } catch (e: any) {
    error.value = e.response?.data?.message || t('auth.registerFailed');
    uiStore.addToast(error.value, 'error');
  }
});
</script>