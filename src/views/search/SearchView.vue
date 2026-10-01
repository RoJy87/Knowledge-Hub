<template>
  <MainLayout>
    <section class="page-shell space-y-8">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ searchCopy.eyebrow }}</p>
          <h1 class="page-title">{{ searchCopy.title }}</h1>
          <p class="page-description">
            {{ searchCopy.description }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <button type="button" class="btn-secondary" :disabled="!hasActiveFilters" @click="clearFilters">{{ searchCopy.clearFilters }}</button>
          <router-link :to="createRoute" class="btn-primary">{{ t('common.newDocument') }}</router-link>
        </div>
      </header>

      <section class="surface-card p-5">
        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_12rem_14rem_12rem]">
          <input
            v-model="filters.q"
            type="text"
            class="input-field"
            :placeholder="t('common.searchPlaceholder')"
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
          <button type="button" class="btn-secondary" @click="loadResults">{{ t('documents.refresh') }}</button>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section class="rounded-[1.25rem] border border-[var(--app-border)] bg-white/70 p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ searchCopy.recentSearchesTitle }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ searchCopy.recentSearchesDescription }}</p>
              </div>
              <button type="button" class="text-xs font-semibold text-slate-500 hover:text-slate-900" :disabled="recentSearches.length === 0" @click="uiStore.clearRecentSearches()">
                {{ searchCopy.clear }}
              </button>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                v-for="query in recentSearches"
                :key="query"
                type="button"
                class="rounded-full border border-[var(--app-border)] bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                @click="applyRecentSearch(query)"
              >
                {{ query }}
              </button>
              <p v-if="recentSearches.length === 0" class="text-sm text-slate-500">
                {{ searchCopy.recentSearchesEmpty }}
              </p>
            </div>
          </section>

          <section class="rounded-[1.25rem] border border-[var(--app-border)] bg-white/70 p-4">
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ searchCopy.projectShortcutsTitle }}</p>
              <p class="mt-1 text-xs text-slate-500">{{ searchCopy.projectShortcutsDescription }}</p>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                v-for="project in featuredProjects"
                :key="project.id"
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-[var(--app-border)] bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                @click="applyProjectShortcut(project.id)"
              >
                <span class="inline-flex h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: project.color || '#3B82F6' }"></span>
                <span>{{ project.name }}</span>
              </button>
              <p v-if="featuredProjects.length === 0" class="text-sm text-slate-500">
                {{ searchCopy.projectShortcutsEmpty }}
              </p>
            </div>
          </section>
        </div>
      </section>

      <section class="surface-card p-6">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--app-border)] pb-4">
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ summaryTitle }}</p>
            <p class="mt-1 text-sm text-slate-500">{{ summaryDescription }}</p>
          </div>
          <router-link to="/articles" class="text-sm font-semibold text-[var(--color-brand-700)]">
            {{ searchCopy.browseDocuments }}
          </router-link>
        </div>

        <div v-if="loading" class="grid gap-3">
          <div v-for="i in 6" :key="i" class="data-row animate-pulse">
            <div class="h-7 rounded bg-slate-200"></div>
            <div class="h-7 rounded bg-slate-200"></div>
            <div class="h-7 rounded bg-slate-200"></div>
            <div class="h-10 rounded bg-slate-200"></div>
          </div>
        </div>

        <div v-else-if="articles.length === 0" class="empty-state">
          <p class="text-lg font-semibold text-slate-900">{{ searchCopy.emptyTitle }}</p>
          <p class="mt-2">{{ searchCopy.emptyDescription }}</p>
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
import { storeToRefs } from 'pinia';
import MainLayout from '@/components/layout/MainLayout.vue';
import { articlesApi } from '@/api/articles.api';
import { projectsApi } from '@/api/projects.api';
import type { ArticleFilters } from '@/api/articles.api';
import type { ArticleList, Project } from '@/types/models';
import { useLocale } from '@/composables/useLocale';
import { useUiStore } from '@/stores/ui.store';
import { getSearchCopy } from '@/utils/product-copy';

const route = useRoute();
const router = useRouter();
const uiStore = useUiStore();
const { recentSearches } = storeToRefs(uiStore);
const { t, locale } = useLocale();

const articles = ref<ArticleList[]>([]);
const projects = ref<Project[]>([]);
const loading = ref(false);
const totalResults = ref(0);
const filters = reactive({
  q: '',
  status: '',
  projectId: '',
});

const searchCopy = computed(() => getSearchCopy(locale.value));
const createRoute = computed(() => (filters.projectId ? `/articles/create?projectId=${filters.projectId}` : '/articles/create'));
const hasActiveFilters = computed(() => Boolean(filters.q || filters.status || filters.projectId));
const featuredProjects = computed(() => projects.value.slice(0, 6));
const summaryTitle = computed(() => {
  if (!filters.q.trim()) return `All searchable knowledge (${totalResults.value})`;
  return `Results for "${filters.q}" (${totalResults.value})`;
});
const summaryDescription = computed(() => {
  if (!filters.q.trim()) return searchCopy.value.allKnowledgeDescription;
  return searchCopy.value.filteredDescription;
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

function syncFiltersFromRoute() {
  filters.q = typeof route.query.q === 'string' ? route.query.q : '';
  filters.status = typeof route.query.status === 'string' ? route.query.status : '';
  filters.projectId = typeof route.query.projectId === 'string' ? route.query.projectId : '';
}

function buildQuery() {
  return {
    ...(filters.q ? { q: filters.q } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
  };
}

function applyFilters() {
  const q = filters.q.trim();
  if (q) {
    uiStore.addRecentSearch(q);
  }

  router.replace({ name: 'search', query: buildQuery() });
}

function debouncedApplyFilters() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilters, 260);
}

function clearFilters() {
  filters.q = '';
  filters.status = '';
  filters.projectId = '';
  router.replace({ name: 'search', query: {} });
}

function applyRecentSearch(query: string) {
  filters.q = query;
  applyFilters();
}

function applyProjectShortcut(projectId: string) {
  filters.projectId = projectId;
  applyFilters();
}

async function loadProjects() {
  try {
    const response = await projectsApi.getProjects(1, 50);
    projects.value = response.data;
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
}

async function loadResults() {
  loading.value = true;
  try {
    const requestFilters: ArticleFilters = {
      ...(filters.q ? { search: filters.q } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      page: 1,
      limit: 50,
    };

    const response = await articlesApi.getArticles(requestFilters);
    articles.value = response.data;
    totalResults.value = response.meta.total;
  } catch (error) {
    console.error('Failed to load search results:', error);
    articles.value = [];
    totalResults.value = 0;
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
    loadResults();
  },
  { immediate: true },
);

onMounted(loadProjects);

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>