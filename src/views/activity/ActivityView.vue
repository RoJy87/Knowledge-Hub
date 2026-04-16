<template>
  <MainLayout>
    <section class="page-shell space-y-8">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('activity.eyebrow') }}</p>
          <h1 class="page-title">{{ t('activity.title') }}</h1>
          <p class="page-description">{{ t('activity.description') }}</p>
        </div>
      </header>

      <section class="surface-card p-6">
        <div v-if="loading" class="grid gap-4">
          <article v-for="i in 4" :key="i" class="surface-panel p-5">
            <div class="h-5 w-2/3 animate-pulse rounded bg-slate-200"></div>
            <div class="mt-3 h-4 w-full animate-pulse rounded bg-slate-200"></div>
          </article>
        </div>
        <p v-else-if="items.length === 0" class="text-sm leading-6 text-slate-500">
          {{ t('activity.empty') }}
        </p>
        <ActivityFeedList v-else :items="items" />
      </section>
    </section>
  </MainLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import MainLayout from '@/components/layout/MainLayout.vue';
import ActivityFeedList from '@/components/common/ActivityFeedList.vue';
import { activityApi } from '@/api/activity.api';
import type { Activity } from '@/types/models';
import { describeActivity } from '@/utils/presentation';
import { useLocale } from '@/composables/useLocale';

const loading = ref(false);
const events = ref<Activity[]>([]);
const { t } = useLocale();

const items = computed(() =>
  events.value.map((event) => ({
    key: event.id,
    ...describeActivity(event),
  })),
);

async function loadActivity() {
  loading.value = true;
  try {
    const response = await activityApi.getActivity(1, 12);
    events.value = response.data;
  } catch (error) {
    console.error('Failed to load activity:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(loadActivity);
</script>
