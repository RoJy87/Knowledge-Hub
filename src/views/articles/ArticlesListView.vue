<template>
  <MainLayout>
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Articles</h1>
          <router-link to="/articles/create" class="btn-primary flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Article
          </router-link>
        </div>

        <!-- Filters -->
        <div class="card mb-6">
          <div class="flex gap-4">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search articles..."
              class="input-field flex-1"
              @input="debouncedLoadArticles"
            />
            <select v-model="filters.status" class="input-field flex-1" @change="debouncedLoadArticles">
              <option value="">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <!-- Articles list -->
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="card animate-pulse">
            <div class="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        <div v-else-if="articles.length === 0" class="card text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-9-1h4" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
          <p class="text-gray-600 mb-4">Create your first article to get started</p>
          <router-link to="/articles/create" class="btn-primary">
            Create Article
          </router-link>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="article in articles"
            :key="article.id"
            class="card cursor-pointer hover:shadow-lg transition-shadow"
            @click="goToArticle(article.id)"
          >
            <div class="flex items-start justify-between mb-3">
              <h2 class="text-xl font-semibold">{{ article.title }}</h2>
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
            <p class="text-gray-600 mb-4 line-clamp-2">{{ article.excerpt }}</p>
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span>{{ article.author.firstName }} {{ article.author.lastName }}</span>
              <span>•</span>
              <span>{{ new Date(article.createdAt).toLocaleDateString() }}</span>
              <span>•</span>
              <span>{{ article.viewCount }} views</span>
              <span>•</span>
              <span>{{ article.commentsCount }} comments</span>
            </div>
            <div v-if="article.tags.length > 0" class="flex gap-2 mt-3">
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
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import { articlesApi } from '@/api/articles.api';
import type { ArticleList } from '@/types/models';

const router = useRouter();

const articles = ref<ArticleList[]>([]);
const loading = ref(false);
const filters = reactive({
  search: '',
  status: '',
});

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedLoadArticles() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    loadArticles();
  }, 300);
}

async function loadArticles() {
  loading.value = true;
  try {
    const response = await articlesApi.getArticles(filters);
    articles.value = response.data;
  } catch (e) {
    console.error('Failed to load articles:', e);
  } finally {
    loading.value = false;
  }
}

function goToArticle(id: string) {
  router.push(`/articles/${id}`);
}

onMounted(() => {
  loadArticles();
});

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>
