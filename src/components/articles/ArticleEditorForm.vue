<template>
  <form class="surface-card p-8" @submit.prevent="handleSubmit">
    <div v-if="generalError" class="mb-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
      {{ generalError }}
    </div>

    <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="space-y-6">
        <label class="grid gap-2">
          <span class="text-sm font-semibold text-slate-700">{{ t('editor.title') }}</span>
          <input v-model="localForm.title" type="text" class="input-field" :placeholder="t('editor.titlePlaceholder')" />
          <span v-if="fieldErrors.title" class="text-sm text-rose-600">{{ fieldErrors.title }}</span>
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-semibold text-slate-700">{{ t('editor.excerpt') }}</span>
          <textarea
            v-model="localForm.excerpt"
            class="textarea-field"
            rows="3"
            :placeholder="t('editor.excerptPlaceholder')"
          ></textarea>
          <span v-if="fieldErrors.excerpt" class="text-sm text-rose-600">{{ fieldErrors.excerpt }}</span>
        </label>

        <label class="grid gap-2">
          <span class="text-sm font-semibold text-slate-700">{{ t('editor.content') }}</span>
          <textarea
            v-model="localForm.content"
            class="textarea-field min-h-[24rem]"
            rows="14"
            :placeholder="t('editor.contentPlaceholder')"
          ></textarea>
          <span v-if="fieldErrors.content" class="text-sm text-rose-600">{{ fieldErrors.content }}</span>
          <span class="text-sm text-slate-500">{{ t('editor.contentHelp') }}</span>
        </label>
      </div>

      <aside class="space-y-6">
        <section class="surface-panel p-5">
          <p class="eyebrow">{{ t('editor.project') }}</p>
          <div class="mt-4">
            <select v-model="localForm.projectId" class="select-field w-full">
              <option value="">{{ t('editor.noProject') }}</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
            </select>
          </div>
        </section>

        <section class="surface-panel p-5">
          <p class="eyebrow">{{ t('editor.status') }}</p>
          <div class="mt-4 grid gap-3">
            <label class="flex items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3">
              <input v-model="localForm.status" type="radio" value="DRAFT" />
              <span class="text-sm font-semibold text-slate-800">{{ t('editor.statusDraft') }}</span>
            </label>
            <label class="flex items-center gap-3 rounded-2xl border border-[var(--app-border)] bg-white px-4 py-3">
              <input v-model="localForm.status" type="radio" value="PUBLISHED" />
              <span class="text-sm font-semibold text-slate-800">{{ t('editor.statusPublished') }}</span>
            </label>
          </div>
        </section>

        <section class="surface-panel p-5">
          <div class="flex items-center justify-between gap-3">
            <p class="eyebrow">{{ t('editor.tags') }}</p>
            <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              {{ t('editor.selectedTags', { count: localForm.tagIds.length }) }}
            </span>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button
              v-for="tag in tags"
              :key="tag.id"
              type="button"
              class="tag-chip transition"
              :class="localForm.tagIds.includes(tag.id) ? 'border-transparent text-white' : ''"
              :style="tagStyle(tag)"
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </button>
            <span v-if="tags.length === 0" class="text-sm text-slate-500">{{ t('editor.noTags') }}</span>
          </div>
        </section>

        <div class="flex flex-col gap-3">
          <button type="submit" class="btn-primary w-full justify-center" :disabled="saving">
            {{ saving ? t('editor.saving') : submitLabel }}
          </button>
          <router-link to="/articles" class="btn-secondary w-full justify-center">{{ t('common.cancel') }}</router-link>
        </div>
      </aside>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Project, Tag } from '@/types/models';
import { useLocale } from '@/composables/useLocale';

export interface ArticleEditorState {
  title: string;
  excerpt: string;
  content: string;
  projectId: string;
  status: 'DRAFT' | 'PUBLISHED';
  tagIds: string[];
}

const props = defineProps<{
  modelValue: ArticleEditorState;
  projects: Project[];
  tags: Tag[];
  saving: boolean;
  submitLabel: string;
  generalError: string;
  fieldErrors: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: ArticleEditorState): void;
  (e: 'submit'): void;
}>();

const { t } = useLocale();

const localForm = reactive<ArticleEditorState>({
  title: props.modelValue.title,
  excerpt: props.modelValue.excerpt,
  content: props.modelValue.content,
  projectId: props.modelValue.projectId,
  status: props.modelValue.status,
  tagIds: [...props.modelValue.tagIds],
});

watch(
  () => props.modelValue,
  (value) => {
    localForm.title = value.title;
    localForm.excerpt = value.excerpt;
    localForm.content = value.content;
    localForm.projectId = value.projectId;
    localForm.status = value.status;
    localForm.tagIds = [...value.tagIds];
  },
  { deep: true },
);

watch(
  localForm,
  (value) => {
    emit('update:modelValue', {
      title: value.title,
      excerpt: value.excerpt,
      content: value.content,
      projectId: value.projectId,
      status: value.status,
      tagIds: [...value.tagIds],
    });
  },
  { deep: true },
);

function toggleTag(tagId: string) {
  const index = localForm.tagIds.indexOf(tagId);
  if (index >= 0) {
    localForm.tagIds.splice(index, 1);
    return;
  }

  localForm.tagIds.push(tagId);
}

function tagStyle(tag: Tag) {
  const selected = localForm.tagIds.includes(tag.id);

  if (selected) {
    return {
      backgroundColor: tag.color,
      borderColor: tag.color,
    };
  }

  return {
    borderColor: tag.color,
    color: tag.color,
  };
}

function handleSubmit() {
  emit('submit');
}
</script>
