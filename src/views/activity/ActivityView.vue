<template>
  <MainLayout>
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Activity Feed</h1>
        <div class="card">
          <div class="space-y-4">
            <div v-for="i in 3" :key="i" class="flex items-start gap-4 py-3 border-b last:border-0">
              <div class="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div class="flex-1">
                <p class="text-gray-900">
                  <span class="font-medium">User Name</span>
                  <span class="text-gray-600"> created an article</span>
                  <span class="font-medium text-primary-600"> Article Title</span>
                </p>
                <p class="text-sm text-gray-500">{{ new Date().toLocaleDateString() }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';
</script>
