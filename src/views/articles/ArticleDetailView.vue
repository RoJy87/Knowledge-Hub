<template>
  <MainLayout>
    <section class="page-shell">
      <div v-if="loading" class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="surface-card h-[48rem] animate-pulse"></div>
        <div class="surface-card h-[48rem] animate-pulse"></div>
      </div>

      <template v-else-if="article">
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <article class="surface-card p-10">
            <router-link to="/articles" class="eyebrow inline-flex text-[var(--color-brand-700)]">{{ t('documents.backToDocuments') }}</router-link>
            <p class="mt-4 text-sm font-semibold text-[var(--color-brand-700)]">
              {{ article.project?.name || t('documents.workspaceKnowledge') }}
            </p>
            <h1 class="mt-3 text-[2.6rem] font-bold leading-tight tracking-[-0.04em] text-slate-950">
              {{ article.title }}
            </h1>
            <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              {{ article.excerpt || t('documents.fallbackExcerpt') }}
            </p>

            <div class="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span class="font-semibold text-slate-900">
                {{ article.author?.firstName }} {{ article.author?.lastName }}
              </span>
              <span>{{ formatDate(article.createdAt) }}</span>
              <span>{{ t('documents.views', { count: article.viewCount }) }}</span>
            </div>

            <div class="mt-5 flex flex-wrap gap-2">
              <span class="status-chip" :class="statusClass(article.status)">{{ article.status.toLowerCase() }}</span>
              <span v-for="tag in article.tags" :key="tag.id" class="tag-chip">
                {{ tag.name }}
              </span>
            </div>

            <div class="mt-6 flex flex-wrap gap-3">
              <router-link :to="`/articles/${article.id}/edit`" class="btn-secondary">{{ t('documents.editDocument') }}</router-link>
            </div>

            <div class="mt-10 prose-doc">
              {{ article.content }}
            </div>
          </article>

          <aside class="space-y-6">
            <section class="surface-card p-6">
              <p class="eyebrow">{{ t('documents.metaEyebrow') }}</p>
              <h2 class="section-title mt-2">{{ t('documents.context') }}</h2>
              <dl class="mt-5 grid gap-4">
                <div>
                  <dt class="text-sm font-medium text-slate-500">{{ t('documents.metaStatus') }}</dt>
                  <dd class="mt-2">
                    <span class="status-chip" :class="statusClass(article.status)">{{ article.status.toLowerCase() }}</span>
                  </dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-slate-500">{{ t('documents.metaWorkspace') }}</dt>
                  <dd class="mt-1 text-base font-medium text-slate-900">{{ article.project?.name || t('documents.generalKnowledge') }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-slate-500">{{ t('documents.metaUpdated') }}</dt>
                  <dd class="mt-1 text-base font-medium text-slate-900">{{ formatDate(article.updatedAt) }}</dd>
                </div>
              </dl>
            </section>

            <section class="surface-card p-6">
              <p class="eyebrow">{{ t('documents.historyEyebrow') }}</p>
              <h2 class="section-title mt-2">{{ t('documents.historyTitle') }}</h2>
              <div v-if="history.length === 0" class="mt-5 text-sm leading-6 text-slate-500">
                {{ t('documents.historyEmpty') }}
              </div>
              <div v-else class="mt-5 grid gap-3">
                <article
                  v-for="entry in history"
                  :key="entry.id"
                  class="surface-panel cursor-pointer p-4 transition"
                  :class="selectedVersion?.id === entry.id ? 'border-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)]' : ''"
                  @click="selectedVersion = entry"
                >
                  <div class="flex items-center justify-between gap-3">
                    <p class="text-sm font-semibold text-slate-900">v{{ entry.version }}</p>
                    <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-700)]">
                      {{ t('documents.historyOpenVersion') }}
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-slate-600">{{ entry.changeLog || entrySummary(entry.content) }}</p>
                  <p class="mt-2 text-xs text-slate-500">{{ formatDate(entry.createdAt) }}</p>
                </article>
              </div>
            </section>

            <section class="surface-card p-6">
              <p class="eyebrow">{{ t('documents.historyPreview') }}</p>
              <h2 class="section-title mt-2">
                {{ selectedVersion ? `v${selectedVersion.version}` : t('documents.historyCurrent') }}
              </h2>
              <div v-if="selectedVersion" class="mt-5">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {{ formatDate(selectedVersion.createdAt) }}
                </p>
                <div class="mt-4 rounded-[1.5rem] border border-[var(--app-border)] bg-[var(--color-surface-muted)] p-4">
                  <pre class="whitespace-pre-wrap text-sm leading-6 text-slate-700">{{ selectedVersion.content }}</pre>
                </div>
              </div>
              <div v-else class="mt-5 text-sm leading-6 text-slate-500">
                {{ t('documents.historyPreviewEmpty') }}
              </div>
            </section>

            <section class="surface-card p-6">
              <p class="eyebrow">{{ t('documents.commentsEyebrow') }}</p>
              <h2 class="section-title mt-2">{{ t('documents.commentsTitle') }}</h2>
              <div v-if="comments.length === 0" class="mt-5 text-sm leading-6 text-slate-500">
                {{ t('documents.commentsEmpty') }}
              </div>
              <div v-else class="mt-5 grid gap-3">
                <CommentThread
                  v-for="comment in comments"
                  :key="comment.id"
                  :comment="comment"
                  :current-user-id="authStore.user?.id"
                  :is-replying="replyingIds.includes(comment.id)"
                  :is-editing="editingIds.includes(comment.id)"
                  :is-deleting="deletingIds.includes(comment.id)"
                  :replying-ids="replyingIds"
                  :editing-ids="editingIds"
                  :deleting-ids="deletingIds"
                  @reply="submitReply"
                  @edit="updateComment"
                  @delete="deleteComment"
                />
              </div>

              <div class="mt-5 grid gap-3">
                <textarea
                  v-model="commentDraft"
                  class="textarea-field"
                  rows="3"
                  :placeholder="t('documents.addCommentPlaceholder')"
                ></textarea>
                <button type="button" class="btn-primary justify-center" :disabled="commentSaving" @click="submitComment">
                  {{ commentSaving ? t('documents.addCommentSaving') : t('documents.addComment') }}
                </button>
              </div>

              <div class="mt-5 flex flex-wrap gap-3">
                <button type="button" class="btn-secondary" @click="toggleFavorite">
                  {{ isFavorite ? t('documents.removeFavorite') : t('documents.addFavorite') }}
                </button>
                <router-link to="/articles" class="btn-primary">{{ t('documents.openList') }}</router-link>
              </div>
            </section>
          </aside>
        </div>
      </template>

      <section v-else class="surface-card empty-state">
        <p class="text-lg font-semibold text-slate-900">{{ t('documents.notFoundTitle') }}</p>
        <p class="mt-2">{{ t('documents.notFoundDescription') }}</p>
        <router-link to="/articles" class="mt-5 inline-flex btn-secondary">{{ t('documents.backToDocuments') }}</router-link>
      </section>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import CommentThread from '@/components/articles/CommentThread.vue';
import { articlesApi } from '@/api/articles.api';
import { commentsApi } from '@/api/comments.api';
import { favoritesApi } from '@/api/favorites.api';
import type { Article, ArticleVersion, Comment } from '@/types/models';
import { useLocale } from '@/composables/useLocale';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';

const route = useRoute();
const { t, locale } = useLocale();
const authStore = useAuthStore();
const uiStore = useUiStore();

const article = ref<Article | null>(null);
const loading = ref(false);
const isFavorite = ref(false);
const commentSaving = ref(false);
const commentDraft = ref('');
const replyingIds = ref<string[]>([]);
const editingIds = ref<string[]>([]);
const deletingIds = ref<string[]>([]);
const history = ref<ArticleVersion[]>([]);
const comments = ref<Comment[]>([]);
const selectedVersion = ref<ArticleVersion | null>(null);

function formatDate(value?: string) {
  if (!value) return t('documents.noRecentUpdates');
  return new Date(value).toLocaleDateString(locale.value === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusClass(status: string) {
  if (status === 'PUBLISHED') return 'status-chip--published';
  if (status === 'ARCHIVED') return 'status-chip--archived';
  return 'status-chip--draft';
}

function entrySummary(content: string) {
  return content.length > 96 ? `${content.slice(0, 96)}...` : content;
}

async function loadArticle() {
  loading.value = true;
  try {
    const articleId = route.params.id as string;
    const [articleResponse, historyResponse, commentsResponse] = await Promise.all([
      articlesApi.getArticle(articleId),
      articlesApi.getArticleHistory(articleId),
      loadComments(articleId),
    ]);

    article.value = articleResponse;
    history.value = historyResponse;
    selectedVersion.value = historyResponse[0] ?? null;
    comments.value = commentsResponse;
    await checkFavorite();
  } catch (error) {
    console.error('Failed to load article:', error);
  } finally {
    loading.value = false;
  }
}

async function loadComments(articleId: string) {
  return commentsApi.getCommentsByArticle(articleId);
}

async function checkFavorite() {
  if (!article.value) return;
  try {
    const result = await favoritesApi.isFavorite(article.value.id);
    isFavorite.value = result.isFavorite;
  } catch (error) {
    console.error('Failed to check favorite:', error);
  }
}

async function toggleFavorite() {
  if (!article.value) return;
  try {
    if (isFavorite.value) {
      await favoritesApi.removeFromFavorites(article.value.id);
    } else {
      await favoritesApi.addToFavorites(article.value.id);
    }
    isFavorite.value = !isFavorite.value;
  } catch (error) {
    console.error('Failed to toggle favorite:', error);
  }
}

async function submitComment() {
  if (!article.value || commentDraft.value.trim().length === 0) return;

  commentSaving.value = true;
  try {
    const comment = await commentsApi.createComment({
      articleId: article.value.id,
      content: commentDraft.value.trim(),
    });

    comments.value = [comment, ...comments.value];
    commentDraft.value = '';
  } catch (error) {
    uiStore.addToast(t('documents.commentFailed'), 'error');
  } finally {
    commentSaving.value = false;
  }
}

async function submitReply(payload: { parentId: string; content: string }) {
  if (!article.value) return;

  replyingIds.value = [...replyingIds.value, payload.parentId];
  try {
    await commentsApi.createComment({
      articleId: article.value.id,
      content: payload.content,
      parentId: payload.parentId,
    });

    comments.value = await loadComments(article.value.id);
  } catch (error) {
    uiStore.addToast(t('documents.commentFailed'), 'error');
  } finally {
    replyingIds.value = replyingIds.value.filter((id) => id !== payload.parentId);
  }
}

async function updateComment(payload: { id: string; content: string }) {
  editingIds.value = [...editingIds.value, payload.id];
  try {
    await commentsApi.updateComment(payload.id, payload.content);

    if (article.value) {
      comments.value = await loadComments(article.value.id);
    }
  } catch (error) {
    uiStore.addToast(t('documents.commentUpdateFailed'), 'error');
  } finally {
    editingIds.value = editingIds.value.filter((id) => id !== payload.id);
  }
}

async function deleteComment(id: string) {
  deletingIds.value = [...deletingIds.value, id];
  try {
    await commentsApi.deleteComment(id);

    if (article.value) {
      comments.value = await loadComments(article.value.id);
    }
  } catch (error) {
    uiStore.addToast(t('documents.commentDeleteFailed'), 'error');
  } finally {
    deletingIds.value = deletingIds.value.filter((commentId) => commentId !== id);
  }
}

onMounted(loadArticle);
</script>
