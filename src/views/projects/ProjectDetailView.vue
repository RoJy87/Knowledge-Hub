<template>
  <MainLayout>
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <div v-if="loading" class="animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div class="card">
            <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        <div v-else-if="project" class="space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                :style="{ backgroundColor: project.color }"
              >
                {{ project.name[0].toUpperCase() }}
              </div>
              <div>
                <h1 class="text-3xl font-bold">{{ project.name }}</h1>
                <p class="text-gray-600">{{ project.description }}</p>
              </div>
            </div>
            <button @click="showEditModal = true" class="btn-secondary">
              Edit Project
            </button>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4">
            <div class="card text-center">
              <div class="text-2xl font-bold text-primary-600">{{ project.members?.length || 0 }}</div>
              <div class="text-sm text-gray-600">Members</div>
            </div>
            <div class="card text-center">
              <div class="text-2xl font-bold text-green-600">0</div>
              <div class="text-sm text-gray-600">Articles</div>
            </div>
            <div class="card text-center">
              <div class="text-2xl font-bold text-purple-600">0</div>
              <div class="text-sm text-gray-600">Comments</div>
            </div>
          </div>

          <!-- Articles list -->
          <div class="card">
            <h2 class="text-xl font-bold mb-4">Articles</h2>
            <p class="text-gray-600 text-center py-8">No articles in this project yet</p>
          </div>

          <!-- Members -->
          <div class="card">
            <h2 class="text-xl font-bold mb-4">Members</h2>
            <div v-if="project.members && project.members.length > 0" class="space-y-3">
              <div
                v-for="member in project.members"
                :key="member.id"
                class="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                    {{ member.user?.firstName[0] }}{{ member.user?.lastName[0] }}
                  </div>
                  <span>{{ member.user?.firstName }} {{ member.user?.lastName }}</span>
                </div>
                <span class="text-sm text-gray-500">{{ member.role }}</span>
              </div>
            </div>
            <p v-else class="text-gray-600 text-center py-4">No members yet</p>
          </div>
        </div>

        <div v-else class="card text-center py-12">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
          <router-link to="/projects" class="text-primary-600 hover:underline">
            Back to projects
          </router-link>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import { projectsApi } from '@/api/projects.api';
import type { Project } from '@/types/models';

const route = useRoute();
const project = ref<Project | null>(null);
const loading = ref(false);
const showEditModal = ref(false);

async function loadProject() {
  loading.value = true;
  try {
    project.value = await projectsApi.getProject(route.params.id as string);
  } catch (e) {
    console.error('Failed to load project:', e);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadProject();
});
</script>
