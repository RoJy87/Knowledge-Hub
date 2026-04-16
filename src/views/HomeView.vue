<template>
  <MainLayout>
    <section class="page-shell space-y-8">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('home.dashboard') }}</p>
          <h1 class="page-title">{{ t('home.greeting', { name: firstName }) }}</h1>
          <p class="page-description">
            {{ t('home.description') }}
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <router-link to="/projects" class="btn-secondary">{{ t('home.viewProjects') }}</router-link>
          <router-link to="/articles/create" class="btn-primary">{{ t('common.newDocument') }}</router-link>
        </div>
      </header>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="space-y-6">
          <section class="surface-card p-8">
            <div class="flex items-start justify-between gap-6">
              <div>
                <p class="eyebrow">{{ t('home.continueWorking') }}</p>
                <h2 class="section-title mt-3">{{ t('home.continueWorkingTitle') }}</h2>
                <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  {{ t('home.continueWorkingDescription') }}
                </p>
              </div>

              <span class="status-chip status-chip--draft shrink-0">Draft</span>
            </div>

            <div class="mt-6 surface-panel p-5">
              <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span class="font-medium text-slate-900">{{ t('home.continueWorkingMetaSpace') }}</span>
                <span>{{ t('home.continueWorkingMetaEdited') }}</span>
                <span>{{ t('home.continueWorkingMetaAuthors') }}</span>
              </div>
              <div class="mt-5 flex flex-wrap gap-3">
                <router-link to="/articles" class="btn-primary">{{ t('common.resume') }}</router-link>
                <router-link to="/projects" class="btn-secondary">{{ t('common.openProject') }}</router-link>
              </div>
            </div>
          </section>

          <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
            <section class="surface-card p-6">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="eyebrow">{{ t('home.drafts') }}</p>
                  <h2 class="section-title mt-2">{{ t('home.draftsTitle') }}</h2>
                </div>
                <router-link to="/articles" class="text-sm font-semibold text-[var(--color-brand-700)]">
                  {{ t('common.viewAll') }}
                </router-link>
              </div>

              <div class="mt-5 grid gap-3">
                <article v-if="loading" class="surface-panel p-4">
                  <div class="h-6 w-2/3 animate-pulse rounded bg-slate-200"></div>
                  <div class="mt-3 h-4 w-full animate-pulse rounded bg-slate-200"></div>
                </article>
                <article v-else-if="drafts.length === 0" class="surface-panel p-4">
                  <h3 class="text-base font-semibold text-slate-900">{{ t('home.draftsEmptyTitle') }}</h3>
                  <p class="mt-2 text-sm leading-6 text-slate-600">
                    {{ t('home.draftsEmptyDescription') }}
                  </p>
                </article>
                <article v-for="draft in drafts" v-else :key="draft.id" class="surface-panel p-4">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <h3 class="text-base font-semibold text-slate-900">{{ draft.title }}</h3>
                    <span class="status-chip" :class="statusClass(draft.status)">{{ draft.status.toLowerCase() }}</span>
                  </div>
                  <p class="mt-2 text-sm leading-6 text-slate-600">
                    {{ draft.excerpt || t('home.draftFallback') }}
                  </p>
                  <p class="mt-3 text-sm text-slate-500">{{ formatRelativeTime(draft.createdAt) }}</p>
                </article>
              </div>
            </section>

            <section class="surface-card p-6">
              <p class="eyebrow">{{ t('home.pinnedProjects') }}</p>
              <h2 class="section-title mt-2">{{ t('home.pinnedProjectsTitle') }}</h2>

              <div class="mt-5 grid gap-3">
                <article v-if="loading" class="surface-panel p-3">
                  <div class="h-5 w-24 animate-pulse rounded bg-slate-200"></div>
                </article>
                <article v-else-if="pinnedProjects.length === 0" class="surface-panel p-3">
                  <h3 class="text-sm font-semibold text-slate-900">{{ t('home.pinnedProjectsEmptyTitle') }}</h3>
                  <p class="text-xs text-slate-500">{{ t('home.pinnedProjectsEmptyDescription') }}</p>
                </article>
                <template v-else>
                  <article
                    v-for="project in pinnedProjects"
                    :key="project.id"
                    class="surface-panel flex items-center gap-3 p-3"
                  >
                    <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: project.color || '#3B82F6' }"></span>
                    <div>
                      <h3 class="text-sm font-semibold text-slate-900">{{ project.name }}</h3>
                      <p class="text-xs text-slate-500">{{ t('home.docsCount', { count: Math.max(4, (project.members?.length || 1) * 3) }) }}</p>
                    </div>
                  </article>
                </template>
              </div>
            </section>
          </div>

          <section class="surface-card p-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="eyebrow">{{ t('home.quickActions') }}</p>
                <h2 class="section-title mt-2">{{ t('home.quickActionsTitle') }}</h2>
              </div>
            </div>

            <div class="mt-5 grid gap-4 md:grid-cols-3">
              <router-link v-for="action in actions" :key="action.titleKey" :to="action.to" class="surface-panel p-5">
                <p class="text-base font-semibold text-slate-900">{{ t(action.titleKey) }}</p>
                <p class="mt-2 text-sm leading-6 text-slate-600">{{ t(action.descriptionKey) }}</p>
              </router-link>
            </div>
          </section>
        </div>

        <aside class="surface-card p-6">
          <p class="eyebrow">{{ t('home.recentActivity') }}</p>
          <h2 class="section-title mt-2">{{ t('home.recentActivityTitle') }}</h2>

          <div class="mt-5">
            <div v-if="loading" class="grid gap-3">
              <div class="surface-panel p-4" v-for="i in 3" :key="i">
                <div class="h-5 w-2/3 animate-pulse rounded bg-slate-200"></div>
                <div class="mt-3 h-4 w-full animate-pulse rounded bg-slate-200"></div>
              </div>
            </div>
            <p v-else-if="activityItems.length === 0" class="text-sm leading-6 text-slate-500">{{ t('home.recentActivityEmpty') }}</p>
            <ActivityFeedList v-else :items="activityItems" />
          </div>
        </aside>
      </div>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import MainLayout from '@/components/layout/MainLayout.vue';
import { useAuthStore } from '@/stores/auth.store';
import { articlesApi } from '@/api/articles.api';
import { projectsApi } from '@/api/projects.api';
import { activityApi } from '@/api/activity.api';
import ActivityFeedList from '@/components/common/ActivityFeedList.vue';
import type { ArticleList, Project, Activity } from '@/types/models';
import { describeActivity, formatRelativeTime, statusClass } from '@/utils/presentation';
import { useLocale } from '@/composables/useLocale';

const authStore = useAuthStore();
const { t } = useLocale();

const firstName = computed(() => authStore.user?.firstName ?? 'Danil');

const loading = ref(false);
const drafts = ref<ArticleList[]>([]);
const pinnedProjects = ref<Project[]>([]);
const activity = ref<Activity[]>([]);

const actions = [
  { titleKey: 'home.actionCreateProject', descriptionKey: 'home.actionCreateProjectDescription', to: '/projects' },
  { titleKey: 'home.actionWriteDocument', descriptionKey: 'home.actionWriteDocumentDescription', to: '/articles/create' },
  { titleKey: 'home.actionOpenDocuments', descriptionKey: 'home.actionOpenDocumentsDescription', to: '/articles' },
];

const activityItems = computed(() =>
  activity.value.map((item) => ({
    key: item.id,
    ...describeActivity(item),
  })),
);

async function loadDashboard() {
  loading.value = true;

  try {
    const [articlesResponse, projectsResponse, activityResponse] = await Promise.all([
      articlesApi.getMyArticles(1, 3),
      projectsApi.getProjects(1, 3),
      activityApi.getActivity(1, 3),
    ]);

    drafts.value = articlesResponse.data;
    pinnedProjects.value = projectsResponse.data;
    activity.value = activityResponse.data;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(loadDashboard);
</script>
