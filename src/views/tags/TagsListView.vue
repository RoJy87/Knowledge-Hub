<template>
  <MainLayout>
    <section class="page-shell space-y-8">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('tags.eyebrow') }}</p>
          <h1 class="page-title">{{ t('tags.title') }}</h1>
          <p class="page-description">{{ t('tags.description') }}</p>
        </div>
      </header>

      <section class="surface-card p-6">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] pb-4">
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ t('tags.popularTitle') }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ t('tags.popularDescription') }}</p>
          </div>
          <router-link to="/articles" class="text-sm font-semibold text-[var(--color-brand-700)]">
            {{ t('tags.browseAll') }}
          </router-link>
        </div>

        <div v-if="loading" class="flex flex-wrap gap-3">
          <div v-for="i in 8" :key="i" class="h-9 w-24 animate-pulse rounded-full bg-slate-200"></div>
        </div>

        <div v-else-if="popular.length === 0" class="empty-state">
          <p class="text-lg font-semibold text-slate-900">{{ t('tags.emptyTitle') }}</p>
          <p class="mt-2">{{ t('tags.emptyDescription') }}</p>
        </div>

        <div v-else class="flex flex-wrap gap-3">
          <button
            v-for="tag in popular"
            :key="tag.id"
            type="button"
            class="tag-chip transition"
            :style="{ borderColor: tag.color, color: tag.color }"
            @click="openTag(tag.id)"
          >
            {{ tag.name }}
            <span class="ml-1 text-xs opacity-70">{{ tag.articlesCount ?? '' }}</span>
          </button>
        </div>
      </section>

      <section class="surface-card p-6">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] pb-4">
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ t('tags.allTitle') }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ t('tags.allDescription') }}</p>
          </div>
        </div>

        <div v-if="loading" class="grid gap-3">
          <div v-for="i in 6" :key="i" class="data-row animate-pulse">
            <div class="h-7 rounded bg-slate-200"></div>
            <div class="h-7 rounded bg-slate-200"></div>
          </div>
        </div>

        <div v-else-if="tags.length === 0" class="empty-state">
          <p class="text-sm text-slate-500">{{ t('tags.emptyDescription') }}</p>
        </div>

        <div v-else class="data-list">
          <article v-for="tag in tags" :key="tag.id" class="data-row" style="grid-template-columns: minmax(0, 1fr) auto auto">
            <button type="button" class="min-w-0 text-left" @click="openTag(tag.id)">
              <h2 class="truncate text-base font-semibold text-slate-900">{{ tag.name }}</h2>
              <p class="mt-1 text-xs text-slate-500">/tag/{{ tag.slug }}</p>
            </button>

            <div class="flex items-center gap-3">
              <span class="inline-block h-3.5 w-3.5 rounded-full" :style="{ backgroundColor: tag.color }"></span>
              <span class="text-sm text-slate-500">
                {{ t('tags.articleCount', { count: tag.articlesCount ?? 0 }) }}
              </span>
            </div>

            <button type="button" class="btn-secondary lg:justify-self-end" @click="openTag(tag.id)">
              {{ t('tags.openArticles') }}
            </button>
          </article>
        </div>
      </section>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import { tagsApi } from '@/api/tags.api';
import type { Tag } from '@/types/models';
import { useLocale } from '@/composables/useLocale';

const router = useRouter();
const { t } = useLocale();

const loading = ref(false);
const popular = ref<Tag[]>([]);
const tags = ref<Tag[]>([]);

async function loadTags() {
  loading.value = true;
  try {
    const [popularResponse, tagsResponse] = await Promise.all([tagsApi.getPopularTags(12), tagsApi.getTags(1, 50)]);
    popular.value = popularResponse.filter((tag) => (tag.articlesCount ?? 0) > 0).slice(0, 12);
    tags.value = tagsResponse.data;
  } catch (error) {
    console.error('Failed to load tags:', error);
    popular.value = [];
    tags.value = [];
  } finally {
    loading.value = false;
  }
}

function openTag(tagId: string) {
  router.push({ name: 'articles', query: { tagId } });
}

onMounted(loadTags);
</script>