<template>
  <MainLayout>
    <section class="page-shell space-y-8">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('documents.eyebrow') }}</p>
          <h1 class="page-title">{{ t('documents.title') }}</h1>
          <p class="page-description">{{ t('documents.description') }}</p>
        </div>

        <router-link :to="createRoute" class="btn-primary">{{ t('common.newDocument') }}</router-link>
      </header>

      <section class="surface-card p-5">
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_12rem_14rem_12rem]">
          <input
            v-model="filters.search"
            type="text"
            class="input-field"
            :placeholder="t('documents.searchPlaceholder')"
            @input="debouncedApplyFilters"
          />
          <select v-model="filters.status" class="select-field" @change="applyFilters">
            <option value="">{{ t('documents.allStatuses') }}</option>
            <option value="PUBLISHED">{{ t('documents.published') }}</option>
            <option value="DRAFT">{{ t('documents.draft') }}</option>
            <option value="ARCHIVED">{{ t('documents.archived') }}</option>
          </select>
          <select v-model="filters.projectId" class="select-field" @change="applyFilters">
            <option value="">{{ t('common.projects') }}</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
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
          <router-link :to="createRoute" class="mt-5 inline-flex btn-primary">{{ t('documents.createDocument') }}</router-link>
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
              <p class="mt-1 text-slate-500">{{ article.projectName || t('documents.generalKnowledge') }}</p>
            </div>

            <div class="flex flex-col items-start gap-2">
              <span class="status-chip" :class="statusClass(article.status)">{{ article.status.toLowerCase() }}</span>
              <p class="text-sm text-slate-500">{{ formatDate(article.updatedAt || article.createdAt) }}</p>
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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import { articlesApi } from '@/api/articles.api';
import { projectsApi } from '@/api/projects.api';
import type { ArticleFilters } from '@/api/articles.api';
import type { ArticleList, Project } from '@/types/models';
import { useLocale } from '@/composables/useLocale';

const route = useRoute();
const router = useRouter();
const { t, locale } = useLocale();

const articles = ref<ArticleList[]>([]);
const projects = ref<Project[]>([]);
const loading = ref(false);
const filters = reactive({
  search: '',
  status: '',
  projectId: '',
});

const createRoute = computed(() => (filters.projectId ? `/articles/create?projectId=${filters.projectId}` : '/articles/create'));

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function statusClass(status: string) {
  if (status === 'PUBLISHED') return 'status-chip--published';
  if (status === 'ARCHIVED') return 'status-chip--archived';
  return 'status-chip--draft';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(locale.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function syncFiltersFromRoute() {
  filters.search = typeof route.query.search === 'string' ? route.query.search : '';
  filters.status = typeof route.query.status === 'string' ? route.query.status : '';
  filters.projectId = typeof route.query.projectId === 'string' ? route.query.projectId : '';
}

function buildQuery() {
  return {
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
  };
}

function applyFilters() {
  router.replace({ name: 'articles', query: buildQuery() });
}

function debouncedApplyFilters() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilters, 260);
}

async function loadProjects() {
  try {
    const response = await projectsApi.getProjects(1, 50);
    projects.value = response.data;
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
}

async function loadArticles() {
  loading.value = true;
  try {
    const requestFilters: ArticleFilters = {
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    };

    const response = await articlesApi.getArticles(requestFilters);
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

watch(
  () => route.query,
  () => {
    syncFiltersFromRoute();
    loadArticles();
  },
  { immediate: true },
);

onMounted(loadProjects);

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>