<template>
  <MainLayout>
    <div class="p-8">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        <div class="card">
          <div class="flex items-center gap-6 mb-8">
            <div class="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {{ userInitials }}
            </div>
            <div>
              <h2 class="text-2xl font-bold">{{ userName }}</h2>
              <p class="text-gray-600">{{ authStore.user?.email }}</p>
              <span class="inline-block mt-2 px-2 py-1 bg-gray-100 rounded text-sm">
                {{ authStore.user?.role }}
              </span>
            </div>
          </div>

          <div class="border-t pt-6">
            <h3 class="text-lg font-bold mb-4">Account Settings</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  v-model="profile.firstName"
                  type="text"
                  class="input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  v-model="profile.lastName"
                  type="text"
                  class="input-field"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  v-model="profile.bio"
                  class="input-field"
                  rows="3"
                ></textarea>
              </div>
              <button @click="saveProfile" class="btn-primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>

          <div class="border-t pt-6 mt-6">
            <button @click="handleLogout" class="text-red-600 hover:underline">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '@/components/layout/MainLayout.vue';
import { useAuthStore } from '@/stores/auth.store';
import { useUiStore } from '@/stores/ui.store';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUiStore();

const saving = ref(false);

const profile = reactive({
  firstName: '',
  lastName: '',
  bio: '',
});

const userInitials = computed(() => {
  if (!authStore.user) return '?';
  return `${authStore.user.firstName[0]}${authStore.user.lastName[0]}`.toUpperCase();
});

const userName = computed(() => {
  if (!authStore.user) return 'Guest';
  return `${authStore.user.firstName} ${authStore.user.lastName}`;
});

async function saveProfile() {
  saving.value = true;
  try {
    // TODO: Implement profile update API
    uiStore.addToast('Profile updated successfully!', 'success');
  } catch (e) {
    uiStore.addToast('Failed to update profile', 'error');
  } finally {
    saving.value = false;
  }
}

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

onMounted(() => {
  if (authStore.user) {
    profile.firstName = authStore.user.firstName;
    profile.lastName = authStore.user.lastName;
    profile.bio = authStore.user.bio || '';
  }
});
</script>
