<template>
  <MainLayout>
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Projects</h1>
          <button @click="showCreateModal = true" class="btn-primary flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Project
          </button>
        </div>

        <!-- Projects grid -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="card animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        <div v-else-if="projects.length === 0" class="card text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p class="text-gray-600 mb-4">Create your first project to get started</p>
          <button @click="showCreateModal = true" class="btn-primary">
            Create Project
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="project in projects"
            :key="project.id"
            class="card cursor-pointer hover:shadow-lg transition-shadow"
            @click="goToProject(project.id)"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                :style="{ backgroundColor: project.color }"
              >
                {{ project.name[0].toUpperCase() }}
              </div>
              <h2 class="text-lg font-semibold">{{ project.name }}</h2>
            </div>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ project.description }}</p>
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>{{ project.members?.length || 0 }} members</span>
              <span>{{ new Date(project.createdAt).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Project Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showCreateModal = false"
    >
      <div class="card w-full max-w-md mx-4" @click.stop>
        <h2 class="text-xl font-bold mb-4">Create Project</h2>
        <form @submit.prevent="handleCreate">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                v-model="newProject.name"
                type="text"
                class="input-field"
                placeholder="My Project"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="newProject.description"
                class="input-field"
                rows="3"
                placeholder="Project description..."
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                v-model="newProject.color"
                type="color"
                class="w-full h-10 rounded border border-gray-300"
              />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" @click="showCreateModal = false" class="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" class="btn-primary flex-1" :disabled="creating">
              {{ creating ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import { projectsApi } from '@/api/projects.api';
import type { Project } from '@/types/models';

const router = useRouter();

const projects = ref<Project[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const creating = ref(false);

const newProject = reactive({
  name: '',
  description: '',
  color: '#3B82F6',
});

async function loadProjects() {
  loading.value = true;
  try {
    const response = await projectsApi.getProjects();
    projects.value = response.data;
  } catch (e) {
    console.error('Failed to load projects:', e);
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  creating.value = true;
  try {
    await projectsApi.createProject(newProject);
    showCreateModal.value = false;
    newProject.name = '';
    newProject.description = '';
    newProject.color = '#3B82F6';
    loadProjects();
  } catch (e: any) {
    console.error('Failed to create project:', e);
  } finally {
    creating.value = false;
  }
}

function goToProject(id: string) {
  router.push(`/projects/${id}`);
}

onMounted(() => {
  loadProjects();
});
</script>
