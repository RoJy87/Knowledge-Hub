<template>
  <MainLayout>
    <section class="page-shell space-y-8">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('favorites.eyebrow') }}</p>
          <h1 class="page-title">{{ t('favorites.title') }}</h1>
          <p class="page-description">{{ t('favorites.description') }}</p>
        </div>
      </header>

      <section class="surface-card p-6">
        <div v-if="loading" class="data-list">
          <div v-for="i in 3" :key="i" class="data-row animate-pulse">
            <div class="h-6 rounded bg-slate-200"></div>
            <div class="h-6 rounded bg-slate-200"></div>
            <div class="h-6 rounded bg-slate-200"></div>
            <div class="h-10 rounded bg-slate-200"></div>
          </div>
        </div>
        <div v-else-if="favoriteItems.length === 0" class="empty-state">
          <p class="text-lg font-semibold text-slate-900">{{ t('favorites.emptyTitle') }}</p>
          <p class="mt-2">{{ t('favorites.emptyDescription') }}</p>
        </div>
        <div v-else class="data-list">
          <article v-for="item in favoriteItems" :key="item.id" class="data-row">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">{{ item.title }}</h2>
              <p class="mt-1 text-sm leading-6 text-slate-600">{{ item.description }}</p>
            </div>
            <div class="text-sm">
              <p class="font-semibold text-slate-900">{{ item.project }}</p>
              <p class="mt-1 text-slate-500">{{ item.author }}</p>
            </div>
            <div class="text-sm">
              <p class="font-semibold text-slate-900">{{ item.savedAt }}</p>
              <p class="mt-1 text-slate-500">{{ t('favorites.saved') }}</p>
            </div>
            <router-link :to="`/articles/${item.articleId}`" class="btn-secondary justify-self-start lg:justify-self-end">{{ t('documents.open') }}</router-link>
          </article>
        </div>
      </section>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import MainLayout from '@/components/layout/MainLayout.vue';
import { favoritesApi } from '@/api/favorites.api';
import type { Favorite } from '@/types/models';
import { favoriteSummary } from '@/utils/presentation';
import { useLocale } from '@/composables/useLocale';

const loading = ref(false);
const favorites = ref<Favorite[]>([]);
const { t } = useLocale();

const favoriteItems = computed(() =>
  favorites.value.map((favorite) => ({
    id: favorite.id,
    articleId: favorite.articleId,
    title: favoriteSummary(favorite).title,
    description: favoriteSummary(favorite).description,
    project: t('favorites.workspaceKnowledge'),
    author: favoriteSummary(favorite).author,
    savedAt: favoriteSummary(favorite).savedAt,
  })),
);

async function loadFavorites() {
  loading.value = true;
  try {
    const response = await favoritesApi.getFavorites(1, 20);
    favorites.value = response.data;
  } catch (error) {
    console.error('Failed to load favorites:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(loadFavorites);
</script>
