<template>
  <MainLayout>
    <section class="page-shell space-y-8">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('profile.settings') }}</p>
          <h1 class="page-title">{{ t('profile.title') }}</h1>
          <p class="page-description">
            {{ t('profile.description') }}
          </p>
        </div>
      </header>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <section class="surface-card p-8">
          <div class="flex flex-col gap-6 border-b border-[var(--app-border)] pb-8 sm:flex-row sm:items-center">
            <div class="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[var(--color-brand-100)] text-3xl font-bold text-[var(--color-brand-700)]">
              {{ userInitials }}
            </div>
            <div>
              <h2 class="section-title">{{ userName }}</h2>
              <p class="mt-2 text-sm text-slate-500">{{ authStore.user?.email || 'workspace@docspace.app' }}</p>
              <span class="status-chip mt-4 inline-flex status-chip--active">
                {{ roleLabel }}
              </span>
            </div>
          </div>

          <div class="mt-8">
            <div>
              <p class="eyebrow">{{ t('profile.account') }}</p>
              <h3 class="section-title mt-2">{{ t('profile.accountCardTitle') }}</h3>
              <p class="mt-2 text-sm leading-6 text-slate-500">{{ t('profile.accountDescription') }}</p>
            </div>

            <div class="mt-6 grid gap-5 md:grid-cols-2">
              <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-700">{{ t('profile.firstName') }}</span>
                <input v-model="profile.firstName" type="text" class="input-field" />
              </label>
              <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-700">{{ t('profile.lastName') }}</span>
                <input v-model="profile.lastName" type="text" class="input-field" />
              </label>
              <label class="grid gap-2 md:col-span-2">
                <span class="text-sm font-semibold text-slate-700">{{ t('profile.bio') }}</span>
                <textarea v-model="profile.bio" class="input-field min-h-32" rows="4" :placeholder="t('profile.bioPlaceholder')"></textarea>
              </label>

              <div class="surface-panel p-4">
                <p class="text-sm font-semibold text-slate-700">{{ t('profile.email') }}</p>
                <p class="mt-2 text-sm text-slate-500">{{ authStore.user?.email || 'workspace@docspace.app' }}</p>
              </div>

              <div class="surface-panel p-4">
                <p class="text-sm font-semibold text-slate-700">{{ t('profile.workspaceRole') }}</p>
                <p class="mt-2 text-sm text-slate-500">{{ roleLabel }}</p>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <button @click="saveProfile" class="btn-primary" :disabled="saving">
                {{ saving ? t('common.saving') : t('profile.saveChanges') }}
              </button>
            </div>
          </div>
        </section>

        <aside class="space-y-6">
          <section class="surface-card p-6">
            <p class="eyebrow">{{ t('profile.language') }}</p>
            <h3 class="section-title mt-2">{{ t('profile.preferencesCardTitle') }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-500">{{ t('profile.languageDescription') }}</p>

            <div class="mt-5 grid gap-3">
              <button
                v-for="option in locales"
                :key="option.value"
                type="button"
                class="surface-panel flex items-center justify-between p-4 text-left transition"
                :class="option.value === locale ? 'border-slate-900 shadow-[0_16px_35px_rgba(15,23,42,0.12)]' : ''"
                @click="changeLocale(option.value)"
              >
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ option.label }}</p>
                  <p class="mt-1 text-xs text-slate-500">{{ option.value.toUpperCase() }}</p>
                </div>
                <span v-if="option.value === locale" class="status-chip status-chip--active">{{ t('common.active') }}</span>
              </button>
            </div>
          </section>

          <section class="surface-card p-6">
            <p class="eyebrow">{{ t('profile.appearance') }}</p>
            <h3 class="section-title mt-2">{{ t('profile.appearance') }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-500">{{ t('profile.appearanceDescription') }}</p>

            <div class="mt-5 grid gap-3">
              <button
                type="button"
                class="surface-panel flex items-center justify-between p-4 text-left transition"
                :class="theme === 'light' ? 'border-slate-900 shadow-[0_16px_35px_rgba(15,23,42,0.12)]' : ''"
                @click="uiStore.setTheme('light')"
              >
                <span class="text-sm font-semibold text-slate-900">{{ t('profile.lightTheme') }}</span>
                <span v-if="theme === 'light'" class="status-chip status-chip--active">{{ t('common.active') }}</span>
              </button>
              <button
                type="button"
                class="surface-panel flex items-center justify-between p-4 text-left opacity-80 transition"
                :class="theme === 'dark' ? 'border-slate-900 shadow-[0_16px_35px_rgba(15,23,42,0.12)]' : ''"
                @click="uiStore.setTheme('dark')"
              >
                <span class="text-sm font-semibold text-slate-900">{{ t('profile.darkTheme') }}</span>
                <span v-if="theme === 'dark'" class="status-chip status-chip--draft">{{ t('common.beta') }}</span>
              </button>
            </div>
          </section>

          <section class="surface-card p-6">
            <p class="eyebrow">{{ t('common.signOut') }}</p>
            <p class="mt-2 text-sm leading-6 text-slate-500">{{ t('profile.signOutDescription') }}</p>

            <button @click="handleLogout" class="mt-5 inline-flex text-sm font-semibold text-rose-600 hover:text-rose-700">
              {{ t('common.signOut') }}
            </button>
          </section>
        </aside>
      </div>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import MainLayout from '@/components/layout/MainLayout.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';
import { useLocale } from '@/composables/useLocale';
import type { Locale } from '@/locales/messages';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();
const { t, locale, locales, setLocale } = useLocale();
const { theme } = storeToRefs(uiStore);

const saving = ref(false);

const profile = reactive({
  firstName: '',
  lastName: '',
  bio: '',
});

const userInitials = computed(() => {
  if (!authStore.user) return '?';
  return `${authStore.user.firstName[0]}${authStore.user.lastName[0]}`.toUpperCase();
});

const userName = computed(() => {
  if (!authStore.user) return t('common.guest');
  return `${authStore.user.firstName} ${authStore.user.lastName}`;
});

const roleLabel = computed(() => {
  if (!authStore.user) return t('shell.viewer');
  return authStore.user.role === 'ADMIN' ? t('shell.workspaceAdmin') : t('shell.teamMember');
});

async function saveProfile() {
  saving.value = true;
  try {
    authStore.updateLocalProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio,
    });
    uiStore.addToast(t('profile.profileSaved'), 'success');
  } catch (e) {
    uiStore.addToast(t('profile.profileFailed'), 'error');
  } finally {
    saving.value = false;
  }
}

function changeLocale(nextLocale: Locale) {
  setLocale(nextLocale);
  uiStore.addToast(t('profile.localeSaved'), 'success');
}

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

onMounted(() => {
  if (authStore.user) {
    profile.firstName = authStore.user.firstName;
    profile.lastName = authStore.user.lastName;
    profile.bio = authStore.user.bio || '';
  }
});
</script>
