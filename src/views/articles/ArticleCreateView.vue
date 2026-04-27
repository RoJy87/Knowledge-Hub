<template>
  <MainLayout>
    <section class="page-shell space-y-8">
      <header class="page-header">
        <div>
          <router-link to="/articles" class="eyebrow inline-flex text-[var(--color-brand-700)]">{{ t('editor.backToDocuments') }}</router-link>
          <h1 class="page-title mt-3">{{ t('editor.createTitle') }}</h1>
          <p class="page-description">{{ t('editor.createDescription') }}</p>
        </div>
      </header>

      <div v-if="loading" class="surface-card p-8 text-sm text-slate-500">
        {{ t('editor.loadingEditor') }}
      </div>

      <ArticleEditorForm
        v-else
        v-model="form"
        :projects="projects"
        :tags="tags"
        :saving="saving"
        :submit-label="t('editor.createDocument')"
        :general-error="generalError"
        :field-errors="fieldErrors"
        @submit="handleSubmit"
      />
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import ArticleEditorForm, { type ArticleEditorState } from '@/components/articles/ArticleEditorForm.vue';
import { articlesApi } from '@/api/articles.api';
import { projectsApi } from '@/api/projects.api';
import { tagsApi } from '@/api/tags.api';
import type { Project, Tag } from '@/types/models';
import { parseValidationErrors } from '@/utils/api-errors';
import { useLocale } from '@/composables/useLocale';
import { useUiStore } from '@/stores/ui.store';

const route = useRoute();
const router = useRouter();
const uiStore = useUiStore();
const { t } = useLocale();

const loading = ref(false);
const saving = ref(false);
const generalError = ref('');
const projects = ref<Project[]>([]);
const tags = ref<Tag[]>([]);
const fieldErrors = reactive<Record<string, string>>({});

const form = reactive<ArticleEditorState>({
  title: '',
  excerpt: '',
  content: '',
  projectId: '',
  status: 'DRAFT',
  tagIds: [],
});

function resetErrors() {
  generalError.value = '';
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key]);
}

function validateForm() {
  resetErrors();

  if (form.title.trim().length < 5) {
    fieldErrors.title = t('editor.validationTitle');
  }

  if (form.content.trim().length === 0) {
    fieldErrors.content = t('editor.validationContent');
  }

  if (form.excerpt.trim().length > 500) {
    fieldErrors.excerpt = t('editor.validationExcerpt');
  }

  return Object.keys(fieldErrors).length === 0;
}

async function loadEditorData() {
  loading.value = true;
  try {
    const [projectsResponse, tagsResponse] = await Promise.all([projectsApi.getProjects(), tagsApi.getTags(1, 50)]);
    projects.value = projectsResponse.data;
    tags.value = tagsResponse.data;

    const requestedProjectId = typeof route.query.projectId === 'string' ? route.query.projectId : '';
    if (requestedProjectId && projects.value.some((project) => project.id === requestedProjectId)) {
      form.projectId = requestedProjectId;
    }
  } catch (error) {
    generalError.value = t('editor.loadFailed');
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  if (!validateForm()) return;

  saving.value = true;
  resetErrors();

  try {
    const article = await articlesApi.createArticle({
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || undefined,
      content: form.content.trim(),
      projectId: form.projectId || undefined,
      status: form.status,
      tagIds: form.tagIds,
    });

    uiStore.addToast(t('editor.createSuccess'), 'success');
    router.push(`/articles/${article.id}`);
  } catch (error) {
    const parsed = parseValidationErrors(error, t('editor.createFailed'));
    generalError.value = parsed.general[0] || '';
    Object.assign(fieldErrors, parsed.fields);
  } finally {
    saving.value = false;
  }
}

onMounted(loadEditorData);
</script>