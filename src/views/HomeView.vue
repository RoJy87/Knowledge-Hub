<template>
  <MainLayout>
    <div class="p-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Welcome to Knowledge Hub</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Quick actions -->
          <div class="card">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 class="text-xl font-semibold">Create Article</h2>
            </div>
            <p class="text-gray-600 mb-4">Share your knowledge with the team</p>
            <router-link to="/articles/create" class="btn-primary inline-block">
              New Article
            </router-link>
          </div>

          <div class="card">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h2 class="text-xl font-semibold">Browse Projects</h2>
            </div>
            <p class="text-gray-600 mb-4">Explore team projects</p>
            <router-link to="/projects" class="btn-primary inline-block">
              View Projects
            </router-link>
          </div>

          <div class="card">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 class="text-xl font-semibold">Activity Feed</h2>
            </div>
            <p class="text-gray-600 mb-4">See what's happening</p>
            <router-link to="/activity" class="btn-primary inline-block">
              View Activity
            </router-link>
          </div>
        </div>

        <!-- Recent articles -->
        <div class="mt-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Recent Articles</h2>
          <div class="card">
            <p class="text-gray-600 text-center py-8">
              No articles yet. Be the first to create one!
            </p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue';
</script>
