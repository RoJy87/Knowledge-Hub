<template>
  <MainLayout>
    <section class="page-shell space-y-8">
      <div v-if="loading" class="grid gap-6">
        <div class="surface-card h-44 animate-pulse"></div>
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div class="surface-card h-[32rem] animate-pulse"></div>
          <div class="space-y-6">
            <div class="surface-card h-56 animate-pulse"></div>
            <div class="surface-card h-64 animate-pulse"></div>
          </div>
        </div>
      </div>

      <template v-else-if="project">
        <header class="surface-card p-8">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="min-w-0">
              <p class="eyebrow">{{ t('projects.projectOverview') }}</p>
              <div class="mt-4 flex items-center gap-4">
                <span
                  class="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] text-xl font-bold text-white"
                  :style="{ backgroundColor: project.color || '#3B82F6' }"
                >
                  {{ project.name.charAt(0).toUpperCase() }}
                </span>
                <div class="min-w-0">
                  <h1 class="page-title">{{ project.name }}</h1>
                  <p class="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                    {{ project.description || defaultDescription }}
                  </p>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <span class="status-chip" :class="project.isActive ? 'status-chip--published' : 'status-chip--archived'">
                {{ project.isActive ? t('projects.projectActive') : t('projects.projectArchived') }}
              </span>
              <button type="button" class="btn-secondary">{{ t('projects.manageMembers') }}</button>
              <router-link :to="createDocumentRoute" class="btn-primary">{{ t('common.newDocument') }}</router-link>
            </div>
          </div>

          <div class="mt-8 grid gap-4 md:grid-cols-3">
            <article class="surface-panel stat-card">
              <p class="stat-value">{{ project.members?.length || 0 }}</p>
              <p class="stat-label">{{ t('projects.statMembers') }}</p>
            </article>
            <article class="surface-panel stat-card">
              <p class="stat-value">{{ project.documentsCount || projectDocuments.length }}</p>
              <p class="stat-label">{{ t('projects.statDocuments') }}</p>
            </article>
            <article class="surface-panel stat-card">
              <p class="stat-value">{{ recentChanges }}</p>
              <p class="stat-label">{{ t('projects.statRecentChanges') }}</p>
            </article>
          </div>
        </header>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div class="space-y-6">
            <section class="surface-card p-6">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="eyebrow">{{ t('projects.pinnedDocuments') }}</p>
                  <h2 class="section-title mt-2">{{ t('projects.pinnedDocumentsTitle') }}</h2>
                </div>
                <router-link :to="projectDocumentsRoute" class="text-sm font-semibold text-[var(--color-brand-700)]">{{ t('common.viewAll') }}</router-link>
              </div>

              <div v-if="projectDocuments.length === 0" class="mt-5 empty-state">
                <p class="text-lg font-semibold text-slate-900">{{ t('documents.emptyTitle') }}</p>
                <p class="mt-2">{{ t('documents.emptyDescription') }}</p>
              </div>

              <div v-else class="mt-5 data-list">
                <router-link v-for="document in projectDocuments" :key="document.id" :to="`/articles/${document.id}`" class="surface-panel block p-5">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 class="text-lg font-semibold text-slate-900">{{ document.title }}</h3>
                      <p class="mt-1 text-sm text-slate-500">{{ documentMeta(document) }}</p>
                    </div>
                    <span class="status-chip" :class="resolveStatusClass(document.status)">{{ document.status.toLowerCase() }}</span>
                  </div>
                  <p class="mt-3 text-sm leading-6 text-slate-600">{{ document.excerpt || t('documents.noSummary') }}</p>
                </router-link>
              </div>
            </section>
          </div>

          <div class="space-y-6">
            <section class="surface-card p-6">
              <p class="eyebrow">{{ t('projects.projectDetails') }}</p>
              <h2 class="section-title mt-2">{{ t('projects.context') }}</h2>
              <dl class="mt-5 grid gap-4">
                <div>
                  <dt class="text-sm font-medium text-slate-500">{{ t('projects.detailType') }}</dt>
                  <dd class="mt-1 text-base font-medium text-slate-900">{{ t('projects.detailTypeValue') }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-slate-500">{{ t('projects.detailOwnerRole') }}</dt>
                  <dd class="mt-1 text-base font-medium text-slate-900">{{ leadRole }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-slate-500">{{ t('projects.detailUpdated') }}</dt>
                  <dd class="mt-1 text-base font-medium text-slate-900">{{ formatDate(project.updatedAt) }}</dd>
                </div>
              </dl>
            </section>

            <section class="surface-card p-6">
              <p class="eyebrow">{{ t('projects.membersSection') }}</p>
              <h2 class="section-title mt-2">{{ t('projects.membersSectionTitle') }}</h2>

              <div class="mt-5 grid gap-3">
                <article v-for="member in project.members" :key="member.id" class="surface-panel flex items-center justify-between gap-4 p-4">
                  <div class="flex items-center gap-3">
                    <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                      {{ getInitials(member) }}
                    </span>
                    <div>
                      <h3 class="text-sm font-semibold text-slate-900">{{ memberLabel(member) }}</h3>
                      <p class="text-xs text-slate-500">{{ t('projects.activeContributor') }}</p>
                    </div>
                  </div>
                  <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{{ member.role }}</span>
                </article>
              </div>
            </section>
          </div>
        </div>
      </template>

      <section v-else class="surface-card empty-state">
        <p class="text-lg font-semibold text-slate-900">{{ t('projects.projectNotFound') }}</p>
        <p class="mt-2">{{ t('projects.projectNotFoundDescription') }}</p>
        <router-link to="/projects" class="mt-5 inline-flex btn-secondary">{{ t('projects.backToProjects') }}</router-link>
      </section>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import { projectsApi } from '@/api/projects.api';
import { articlesApi } from '@/api/articles.api';
import type { Project, ProjectMember, ArticleList } from '@/types/models';
import { statusClass as resolveStatusClass } from '@/utils/presentation';
import { useLocale } from '@/composables/useLocale';

const route = useRoute();
const { t, locale } = useLocale();
const project = ref<Project | null>(null);
const projectDocuments = ref<ArticleList[]>([]);
const loading = ref(false);

const defaultDescription = computed(() => t('projects.defaultDescription'));
const createDocumentRoute = computed(() => (project.value ? `/articles/create?projectId=${project.value.id}` : '/articles/create'));
const projectDocumentsRoute = computed(() => (project.value ? `/articles?projectId=${project.value.id}` : '/articles'));
const recentChanges = computed(() => projectDocuments.value.filter((document) => isRecent(document.updatedAt || document.createdAt)).length);
const leadRole = computed(() => project.value?.members?.find((member) => member.role === 'ADMIN')?.role ?? t('projects.detailOwnerRoleValue'));

function formatDate(value?: string) {
  if (!value) return t('projects.noRecentUpdates');
  return new Date(value).toLocaleDateString(locale.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(member: ProjectMember) {
  return `${member.user?.firstName?.[0] ?? ''}${member.user?.lastName?.[0] ?? ''}`.toUpperCase() || 'TM';
}

function memberLabel(member: ProjectMember) {
  const firstName = member.user?.firstName ?? 'Team';
  const lastName = member.user?.lastName ?? 'Member';
  return `${firstName} ${lastName}`;
}

function isRecent(value?: string) {
  if (!value) return false;
  const diff = Date.now() - new Date(value).getTime();
  return diff <= 1000 * 60 * 60 * 24 * 7;
}

function documentMeta(document: ArticleList) {
  return [formatDate(document.updatedAt || document.createdAt), document.projectName || project.value?.name]
    .filter(Boolean)
    .join(' • ');
}

async function loadProject() {
  loading.value = true;
  try {
    const projectId = route.params.id as string;
    const [projectResponse, documentsResponse] = await Promise.all([
      projectsApi.getProject(projectId),
      articlesApi.getArticles({ projectId, page: 1, limit: 100 }),
    ]);

    project.value = projectResponse;
    projectDocuments.value = documentsResponse.data.slice(0, 4);

    if (project.value && project.value.documentsCount === undefined) {
      project.value.documentsCount = documentsResponse.meta.total;
    }
  } catch (error) {
    console.error('Failed to load project:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(loadProject);
</script>