<template>
  <MainLayout>
    <div class="p-8">
      <div class="max-w-4xl mx-auto">
        <div v-if="loading" class="animate-pulse">
          <div class="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div class="card">
            <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        <div v-else-if="article" class="space-y-6">
          <!-- Header -->
          <div>
            <router-link to="/articles" class="text-primary-600 hover:underline flex items-center gap-2 mb-4">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Articles
            </router-link>
            <h1 class="text-4xl font-bold mb-4">{{ article.title }}</h1>
            <div class="flex items-center gap-4 text-sm text-gray-600">
              <span>By {{ article.author?.firstName }} {{ article.author?.lastName }}</span>
              <span>•</span>
              <span>{{ new Date(article.createdAt).toLocaleDateString() }}</span>
              <span>•</span>
              <span>{{ article.viewCount }} views</span>
              <span
                :class="[
                  'px-2 py-1 rounded text-xs font-medium',
                  article.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : '',
                  article.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' : '',
                  article.status === 'ARCHIVED' ? 'bg-yellow-100 text-yellow-700' : ''
                ]"
              >
                {{ article.status }}
              </span>
            </div>
            <div v-if="article.tags.length > 0" class="flex gap-2 mt-4">
              <span
                v-for="tag in article.tags"
                :key="tag.id"
                class="px-2 py-1 rounded text-xs"
                :style="{ backgroundColor: tag.color + '20', color: tag.color }"
              >
                {{ tag.name }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="card prose prose-lg max-w-none">
            <pre>{{ article.content }}</pre>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button @click="toggleFavorite" class="btn-secondary flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
            </button>
            <button @click="editArticle" class="btn-primary">
              Edit
            </button>
          </div>

          <!-- Comments -->
          <div class="card">
            <h2 class="text-xl font-bold mb-4">Comments ({{ article.commentsCount }})</h2>
            <p class="text-gray-600 text-center py-8">No comments yet</p>
          </div>
        </div>

        <div v-else class="card text-center py-12">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Article not found</h3>
          <router-link to="/articles" class="text-primary-600 hover:underline">
            Back to articles
          </router-link>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import { articlesApi } from '@/api/articles.api';
import { favoritesApi } from '@/api/favorites.api';
import type { Article } from '@/types/models';

const route = useRoute();
const router = useRouter();

const article = ref<Article | null>(null);
const loading = ref(false);
const isFavorite = ref(false);

async function loadArticle() {
  loading.value = true;
  try {
    article.value = await articlesApi.getArticle(route.params.id as string);
    checkFavorite();
  } catch (e) {
    console.error('Failed to load article:', e);
  } finally {
    loading.value = false;
  }
}

async function checkFavorite() {
  if (!article.value) return;
  try {
    const result = await favoritesApi.isFavorite(article.value.id);
    isFavorite.value = result.isFavorite;
  } catch (e) {
    console.error('Failed to check favorite:', e);
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
  } catch (e) {
    console.error('Failed to toggle favorite:', e);
  }
}

function editArticle() {
  if (article.value) {
    router.push(`/articles/${article.value.id}/edit`);
  }
}

onMounted(() => {
  loadArticle();
});
</script>
