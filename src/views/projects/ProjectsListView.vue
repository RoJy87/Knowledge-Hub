<template>
  <MainLayout>
    <section class="page-shell space-y-8">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('projects.eyebrow') }}</p>
          <h1 class="page-title">{{ t('projects.title') }}</h1>
          <p class="page-description">{{ t('projects.description') }}</p>
        </div>

        <button type="button" class="btn-primary" @click="showCreateModal = true">{{ t('projects.newProject') }}</button>
      </header>

      <section class="surface-card p-5">
        <div class="flex flex-col gap-4 lg:flex-row">
          <input v-model="filters.search" type="text" class="input-field lg:flex-1" :placeholder="t('projects.searchPlaceholder')" />
          <select v-model="filters.state" class="select-field lg:max-w-56">
            <option value="">{{ t('projects.allStatuses') }}</option>
            <option value="recent">{{ t('projects.updatedRecently') }}</option>
            <option value="active">{{ t('projects.activeOnly') }}</option>
          </select>
        </div>
      </section>

      <section class="surface-card p-6">
        <div class="grid gap-3">
          <div v-if="loading" class="grid gap-3">
            <div v-for="i in 5" :key="i" class="data-row animate-pulse">
              <div class="h-6 rounded bg-slate-200"></div>
              <div class="h-6 rounded bg-slate-200"></div>
              <div class="h-6 rounded bg-slate-200"></div>
              <div class="h-10 rounded bg-slate-200"></div>
            </div>
          </div>

          <div v-else-if="filteredProjects.length === 0" class="empty-state">
            <p class="text-lg font-semibold text-slate-900">{{ t('projects.emptyTitle') }}</p>
            <p class="mt-2">{{ t('projects.emptyDescription') }}</p>
          </div>

          <article v-for="project in filteredProjects" :key="project.id" class="data-row">
            <div class="min-w-0">
              <div class="flex items-start gap-4">
                <span
                  class="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white"
                  :style="{ backgroundColor: project.color || '#3B82F6' }"
                >
                  {{ project.name.charAt(0).toUpperCase() }}
                </span>
                <div class="min-w-0">
                  <h2 class="truncate text-lg font-semibold text-slate-900">{{ project.name }}</h2>
                  <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                    {{ project.description || t('projects.fallbackDescription') }}
                  </p>
                </div>
              </div>
            </div>

            <div class="text-sm">
              <p class="font-semibold text-slate-900">{{ t('projects.members', { count: project.members?.length || 0 }) }}</p>
              <p class="mt-1 text-slate-500">{{ t('projects.docs', { count: project.documentsCount || 0 }) }}</p>
            </div>

            <div class="text-sm">
              <p class="font-semibold text-slate-900">{{ formatDate(project.updatedAt) }}</p>
              <p class="mt-1 text-slate-500">{{ t('projects.lastUpdated') }}</p>
            </div>

            <button type="button" class="btn-secondary justify-self-start lg:justify-self-end" @click="goToProject(project.id)">
              {{ t('projects.open') }}
            </button>
          </article>
        </div>
      </section>
    </section>

    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm"
      @click="showCreateModal = false"
    >
      <div class="surface-card w-full max-w-xl p-8" @click.stop>
        <p class="eyebrow">{{ t('projects.modalEyebrow') }}</p>
        <h2 class="mt-3 text-2xl font-semibold text-slate-900">{{ t('projects.modalTitle') }}</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">{{ t('projects.modalDescription') }}</p>

        <form class="mt-6 grid gap-4" @submit.prevent="handleCreate">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">{{ t('projects.projectName') }}</label>
            <input v-model="newProject.name" type="text" class="input-field" :placeholder="t('projects.projectNamePlaceholder')" required />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">{{ t('projects.projectDescription') }}</label>
            <textarea v-model="newProject.description" class="textarea-field" :placeholder="t('projects.projectDescriptionPlaceholder')"></textarea>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">{{ t('projects.accentColor') }}</label>
            <input v-model="newProject.color" type="color" class="h-12 w-full rounded-2xl border border-[var(--app-border)] bg-white p-2" />
          </div>

          <div class="mt-2 flex flex-wrap justify-end gap-3">
            <button type="button" class="btn-secondary" @click="showCreateModal = false">{{ t('common.cancel') }}</button>
            <button type="submit" class="btn-primary" :disabled="creating">
              {{ creating ? t('projects.creating') : t('projects.createProject') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import { projectsApi } from '@/api/projects.api';
import type { Project } from '@/types/models';
import { useLocale } from '@/composables/useLocale';

const router = useRouter();
const { t, locale } = useLocale();

const projects = ref<Project[]>([]);
const loading = ref(false);
const creating = ref(false);
const showCreateModal = ref(false);

const filters = reactive({
  search: '',
  state: '',
});

const newProject = reactive({
  name: '',
  description: '',
  color: '#3B82F6',
});

const filteredProjects = computed(() => {
  return projects.value.filter((project) => {
    const matchesSearch =
      !filters.search ||
      project.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      project.description?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesState = !filters.state || (filters.state === 'active' ? project.isActive : true);

    return matchesSearch && matchesState;
  });
});

function formatDate(value?: string) {
  if (!value) return t('projects.noUpdates');
  return new Date(value).toLocaleDateString(locale.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function loadProjects() {
  loading.value = true;
  try {
    const response = await projectsApi.getProjects();
    projects.value = response.data;
  } catch (error) {
    console.error('Failed to load projects:', error);
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  creating.value = true;
  try {
    const project = await projectsApi.createProject(newProject);
    showCreateModal.value = false;
    newProject.name = '';
    newProject.description = '';
    newProject.color = '#3B82F6';
    await loadProjects();
    router.push(`/projects/${project.id}`);
  } catch (error) {
    console.error('Failed to create project:', error);
  } finally {
    creating.value = false;
  }
}

function goToProject(id: string) {
  router.push(`/projects/${id}`);
}

onMounted(loadProjects);
</script>