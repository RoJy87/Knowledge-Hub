<template>
  <article class="surface-panel p-4">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-slate-900">
          {{ comment.author?.firstName }} {{ comment.author?.lastName }}
        </p>
        <p class="mt-1 text-xs text-slate-500">
          {{ formatDate(comment.createdAt) }}
          <span v-if="comment.isEdited"> | {{ t('documents.commentEdited') }}</span>
        </p>
      </div>

      <div v-if="isOwnComment" class="flex flex-wrap gap-2">
        <button type="button" class="text-xs font-semibold text-slate-500 hover:text-slate-900" @click="toggleEdit">
          {{ t('documents.commentEdit') }}
        </button>
        <button type="button" class="text-xs font-semibold text-rose-600 hover:text-rose-700" :disabled="isDeleting" @click="emitDelete">
          {{ isDeleting ? t('documents.commentDeleting') : t('documents.commentDelete') }}
        </button>
      </div>
    </div>

    <div v-if="isEditingLocal" class="mt-3 grid gap-3">
      <textarea v-model="editDraft" class="textarea-field" rows="3" :placeholder="t('documents.commentEditPlaceholder')"></textarea>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn-primary justify-center" :disabled="isEditing" @click="emitEdit">
          {{ isEditing ? t('documents.commentUpdating') : t('common.save') }}
        </button>
        <button type="button" class="btn-secondary justify-center" @click="toggleEdit">{{ t('common.cancel') }}</button>
      </div>
    </div>
    <p v-else class="mt-3 text-sm leading-6 text-slate-600">{{ comment.content }}</p>

    <div v-if="!comment.isDeleted" class="mt-4">
      <button type="button" class="text-xs font-semibold text-[var(--color-brand-700)] hover:text-[var(--color-brand-800)]" @click="toggleReply">
        {{ t('documents.commentReply') }}
      </button>
    </div>

    <div v-if="isReplyingLocal" class="mt-3 grid gap-3">
      <textarea v-model="replyDraft" class="textarea-field" rows="3" :placeholder="t('documents.commentReplyPlaceholder')"></textarea>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="btn-primary justify-center" :disabled="isReplying" @click="emitReply">
          {{ isReplying ? t('documents.commentReplying') : t('documents.commentReply') }}
        </button>
        <button type="button" class="btn-secondary justify-center" @click="toggleReply">{{ t('common.cancel') }}</button>
      </div>
    </div>

    <div v-if="comment.replies?.length" class="mt-4 grid gap-3 border-l border-[var(--app-border)] pl-4">
      <CommentThread
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :current-user-id="currentUserId"
        :is-replying="replyingIds.includes(reply.id)"
        :is-editing="editingIds.includes(reply.id)"
        :is-deleting="deletingIds.includes(reply.id)"
        :replying-ids="replyingIds"
        :editing-ids="editingIds"
        :deleting-ids="deletingIds"
        @reply="$emit('reply', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Comment } from '@/types/models';
import { useLocale } from '@/composables/useLocale';

defineOptions({ name: 'CommentThread' });

const props = defineProps<{
  comment: Comment;
  currentUserId?: string;
  isReplying: boolean;
  isEditing: boolean;
  isDeleting: boolean;
  replyingIds: string[];
  editingIds: string[];
  deletingIds: string[];
}>();

const emit = defineEmits<{
  (e: 'reply', value: { parentId: string; content: string }): void;
  (e: 'edit', value: { id: string; content: string }): void;
  (e: 'delete', id: string): void;
}>();

const { t, locale } = useLocale();

const isReplyingLocal = ref(false);
const isEditingLocal = ref(false);
const replyDraft = ref('');
const editDraft = ref(props.comment.content);

const isOwnComment = computed(() => props.comment.author?.id === props.currentUserId);

function formatDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function toggleReply() {
  isReplyingLocal.value = !isReplyingLocal.value;
  if (!isReplyingLocal.value) {
    replyDraft.value = '';
  }
}

function toggleEdit() {
  isEditingLocal.value = !isEditingLocal.value;
  if (isEditingLocal.value) {
    editDraft.value = props.comment.content;
  }
}

function emitReply() {
  if (replyDraft.value.trim().length === 0) return;
  emit('reply', { parentId: props.comment.id, content: replyDraft.value.trim() });
  replyDraft.value = '';
  isReplyingLocal.value = false;
}

function emitEdit() {
  if (editDraft.value.trim().length === 0) return;
  emit('edit', { id: props.comment.id, content: editDraft.value.trim() });
  isEditingLocal.value = false;
}

function emitDelete() {
  emit('delete', props.comment.id);
}
</script>
