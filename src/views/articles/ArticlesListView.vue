<template>
  <MainLayout>
    <section class="page-shell space-y-8">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('documents.eyebrow') }}</p>
          <h1 class="page-title">{{ t('documents.title') }}</h1>
          <p class="page-description">{{ t('documents.description') }}</p>
        </div>

        <router-link to="/articles/create" class="btn-primary">{{ t('common.newDocument') }}</router-link>
      </header>

      <section class="surface-card p-5">
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_12rem_12rem]">
          <input
            v-model="filters.search"
            type="text"
            class="input-field"
            :placeholder="t('documents.searchPlaceholder')"
            @input="debouncedLoadArticles"
          />
          <select v-model="filters.status" class="select-field" @change="debouncedLoadArticles">
            <option value="">{{ t('documents.allStatuses') }}</option>
            <option value="PUBLISHED">{{ t('documents.published') }}</option>
            <option value="DRAFT">{{ t('documents.draft') }}</option>
            <option value="ARCHIVED">{{ t('documents.archived') }}</option>
          </select>
          <button type="button" class="btn-secondary" @click="loadArticles">{{ t('documents.refresh') }}</button>
        </div>
      </section>

      <section class="surface-card p-6">
        <div v-if="loading" class="grid gap-3">
          <div v-for="i in 6" :key="i" class="data-row animate-pulse">
            <div class="h-7 rounded bg-slate-200"></div>
            <div class="h-7 rounded bg-slate-200"></div>
            <div class="h-7 rounded bg-slate-200"></div>
            <div class="h-10 rounded bg-slate-200"></div>
          </div>
        </div>

        <div v-else-if="articles.length === 0" class="empty-state">
          <p class="text-lg font-semibold text-slate-900">{{ t('documents.emptyTitle') }}</p>
          <p class="mt-2">{{ t('documents.emptyDescription') }}</p>
          <router-link to="/articles/create" class="mt-5 inline-flex btn-primary">{{ t('documents.createDocument') }}</router-link>
        </div>

        <div v-else class="data-list">
          <article v-for="article in articles" :key="article.id" class="data-row">
            <button type="button" class="min-w-0 text-left" @click="goToArticle(article.id)">
              <h2 class="truncate text-lg font-semibold text-slate-900">{{ article.title }}</h2>
              <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                {{ article.excerpt || t('documents.noSummary') }}
              </p>
            </button>

            <div class="text-sm">
              <p class="font-semibold text-slate-900">{{ article.author.firstName }} {{ article.author.lastName }}</p>
              <p class="mt-1 text-slate-500">{{ formatDate(article.createdAt) }}</p>
            </div>

            <div class="flex flex-col items-start gap-2">
              <span class="status-chip" :class="statusClass(article.status)">{{ article.status.toLowerCase() }}</span>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in article.tags.slice(0, 2)" :key="tag.id" class="tag-chip">{{ tag.name }}</span>
              </div>
            </div>

            <button type="button" class="btn-secondary justify-self-start lg:justify-self-end" @click="goToArticle(article.id)">
              {{ t('documents.open') }}
            </button>
          </article>
        </div>
      </section>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import { articlesApi } from '@/api/articles.api';
import type { ArticleList } from '@/types/models';
import { useLocale } from '@/composables/useLocale';

const router = useRouter();
const { t, locale } = useLocale();

const articles = ref<ArticleList[]>([]);
const loading = ref(false);
const filters = reactive({
  search: '',
  status: '',
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function statusClass(status: string) {
  if (status === 'PUBLISHED') return 'status-chip--published';
  if (status === 'ARCHIVED') return 'status-chip--archived';
  return 'status-chip--draft';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(locale.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function debouncedLoadArticles() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(loadArticles, 260);
}

async function loadArticles() {
  loading.value = true;
  try {
    const response = await articlesApi.getArticles(filters);
    articles.value = response.data;
  } catch (error) {
    console.error('Failed to load articles:', error);
  } finally {
    loading.value = false;
  }
}

function goToArticle(id: string) {
  router.push(`/articles/${id}`);
}

onMounted(loadArticles);

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>
