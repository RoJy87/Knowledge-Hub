<template>
  <div class="rich-editor">
    <div class="rich-editor__toolbar" role="toolbar">
      <button
        type="button"
        class="rich-editor__button"
        :class="{ 'rich-editor__button--active': editor?.isActive('bold') }"
        :disabled="!editor?.can().toggleBold()"
        :title="t('editor.bold')"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        class="rich-editor__button"
        :class="{ 'rich-editor__button--active': editor?.isActive('italic') }"
        :disabled="!editor?.can().toggleItalic()"
        :title="t('editor.italic')"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        class="rich-editor__button"
        :class="{ 'rich-editor__button--active': editor?.isActive('underline') }"
        :disabled="!editor?.can().toggleUnderline()"
        :title="t('editor.underline')"
        @click="editor?.chain().focus().toggleUnderline().run()"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        class="rich-editor__button"
        :class="{ 'rich-editor__button--active': editor?.isActive('strike') }"
        :disabled="!editor?.can().toggleStrike()"
        :title="t('editor.strike')"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <s>S</s>
      </button>

      <span class="rich-editor__divider"></span>

      <button
        type="button"
        class="rich-editor__button rich-editor__button--wide"
        :class="{ 'rich-editor__button--active': editor?.isActive('heading', { level: 2 }) }"
        :disabled="!editor?.can().toggleHeading({ level: 2 })"
        :title="t('editor.heading', { level: 2 })"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        H2
      </button>
      <button
        type="button"
        class="rich-editor__button rich-editor__button--wide"
        :class="{ 'rich-editor__button--active': editor?.isActive('heading', { level: 3 }) }"
        :disabled="!editor?.can().toggleHeading({ level: 3 })"
        :title="t('editor.heading', { level: 3 })"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        H3
      </button>

      <span class="rich-editor__divider"></span>

      <button
        type="button"
        class="rich-editor__button"
        :class="{ 'rich-editor__button--active': editor?.isActive('bulletList') }"
        :disabled="!editor?.can().toggleBulletList()"
        :title="t('editor.bulletList')"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        •
      </button>
      <button
        type="button"
        class="rich-editor__button"
        :class="{ 'rich-editor__button--active': editor?.isActive('orderedList') }"
        :disabled="!editor?.can().toggleOrderedList()"
        :title="t('editor.orderedList')"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        1.
      </button>
      <button
        type="button"
        class="rich-editor__button"
        :class="{ 'rich-editor__button--active': editor?.isActive('blockquote') }"
        :disabled="!editor?.can().toggleBlockquote()"
        :title="t('editor.blockquote')"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        ❝
      </button>
      <button
        type="button"
        class="rich-editor__button"
        :class="{ 'rich-editor__button--active': editor?.isActive('code') }"
        :disabled="!editor?.can().toggleCode()"
        :title="t('editor.inlineCode')"
        @click="editor?.chain().focus().toggleCode().run()"
      >
        &lt;/&gt;
      </button>
      <button
        type="button"
        class="rich-editor__button"
        :class="{ 'rich-editor__button--active': editor?.isActive('codeBlock') }"
        :disabled="!editor?.can().toggleCodeBlock()"
        :title="t('editor.codeBlock')"
        @click="editor?.chain().focus().toggleCodeBlock().run()"
      >
        { }
      </button>
    </div>

    <EditorContent :editor="editor" class="rich-editor__content" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useLocale } from '@/composables/useLocale';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const { t } = useLocale();
const editor = shallowRef<Editor>();

onMounted(() => {
  editor.value = new Editor({
    content: props.modelValue,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: props.placeholder,
      }),
    ],
    onUpdate: () => {
      emit('update:modelValue', editor.value?.getHTML() ?? '');
    },
  });
});

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && value !== editor.value.getHTML()) {
      editor.value.commands.setContent(value, { emitUpdate: false });
    }
  },
);

onBeforeUnmount(() => {
  editor.value?.destroy();
  editor.value = undefined;
});
</script>