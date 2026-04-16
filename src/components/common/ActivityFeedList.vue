<template>
  <div class="grid gap-3">
    <article v-for="item in items" :key="item.key" class="surface-panel p-4">
      <h3 class="text-sm font-semibold text-slate-900">{{ item.title }}</h3>
      <p class="mt-2 text-sm leading-6 text-slate-600">{{ item.description }}</p>
      <p class="mt-3 text-xs font-medium text-slate-400">{{ item.time }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{
    key: string;
    title: string;
    description: string;
    time: string;
  }>;
}>();
</script>
