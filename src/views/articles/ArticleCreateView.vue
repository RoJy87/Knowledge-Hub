<template>
  <MainLayout>
    <div class="p-8">
      <div class="max-w-4xl mx-auto">
        <div class="mb-6">
          <router-link to="/articles" class="text-primary-600 hover:underline flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Articles
          </router-link>
        </div>

        <div class="card">
          <h1 class="text-3xl font-bold mb-6">Create Article</h1>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 class="font-medium text-red-800">Failed to create article</h3>
                <p class="mt-2 text-sm text-red-700">{{ errorMessage }}</p>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                v-model="form.title"
                type="text"
                class="input-field"
                placeholder="Enter article title..."
                required
                minlength="5"
              />
              <p v-if="fieldErrors.title" class="mt-1 text-sm text-red-600">{{ fieldErrors.title }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                v-model="form.excerpt"
                class="input-field"
                rows="2"
                placeholder="Brief summary..."
                maxlength="500"
              ></textarea>
              <p v-if="fieldErrors.excerpt" class="mt-1 text-sm text-red-600">{{ fieldErrors.excerpt }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                v-model="form.content"
                class="w-full h-64 border border-gray-300 rounded-lg p-4 resize-y outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Write your article content in Markdown..."
                required
              ></textarea>
              <p v-if="fieldErrors.content" class="mt-1 text-sm text-red-600">{{ fieldErrors.content }}</p>
              <p class="text-sm text-gray-500 mt-1">Markdown format supported</p>
            </div>

            <div class="flex items-center gap-4">
              <label class="flex items-center gap-2">
                <input v-model="form.status" type="radio" value="DRAFT" checked />
                <span>Save as Draft</span>
              </label>
              <label class="flex items-center gap-2">
                <input v-model="form.status" type="radio" value="PUBLISHED" />
                <span>Publish</span>
              </label>
            </div>

            <div class="flex gap-3">
              <button type="submit" class="btn-primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Article' }}
              </button>
              <router-link to="/articles" class="btn-secondary">
                Cancel
              </router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import { articlesApi } from '@/api/articles.api';

const router = useRouter();

const form = reactive({
  title: '',
  excerpt: '',
  content: '',
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
});

const saving = ref(false);
const errorMessage = ref('');
const fieldErrors = reactive<Record<string, string>>({});

function parseValidationErrors(error: any): string[] {
  const errors: string[] = [];
  
  if (error.response?.data?.errors) {
    const validationErrors = error.response.data.errors;
    if (Array.isArray(validationErrors)) {
      validationErrors.forEach((err: any) => {
        if (err.constraints && Array.isArray(err.constraints)) {
          err.constraints.forEach((constraint: string) => {
            errors.push(`${err.property}: ${constraint}`);
          });
        } else if (err.constraints) {
          Object.values(err.constraints).forEach((constraint: any) => {
            errors.push(`${err.property}: ${constraint}`);
          });
        }
      });
    }
  }
  
  if (errors.length === 0) {
    errors.push(error.response?.data?.message || 'An unexpected error occurred');
  }
  
  return errors;
}

async function handleSubmit() {
  saving.value = true;
  errorMessage.value = '';
  Object.keys(fieldErrors).forEach(key => delete fieldErrors[key]);
  
  try {
    await articlesApi.createArticle({
      title: form.title,
      content: form.content,
      excerpt: form.excerpt,
      status: form.status,
    });
    router.push('/articles');
  } catch (e: any) {
    const errors = parseValidationErrors(e);
    
    // Parse field-specific errors
    errors.forEach((error: string) => {
      if (error.includes('title:')) {
        fieldErrors.title = error.replace('title:', '').trim();
      } else if (error.includes('content:')) {
        fieldErrors.content = error.replace('content:', '').trim();
      } else if (error.includes('excerpt:')) {
        fieldErrors.excerpt = error.replace('excerpt:', '').trim();
      }
    });
    
    // If no field-specific errors, show general error
    if (Object.keys(fieldErrors).length === 0) {
      errorMessage.value = errors.join(', ');
    }
  } finally {
    saving.value = false;
  }
}
</script>
