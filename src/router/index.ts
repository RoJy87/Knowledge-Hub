import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guest: true },
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/projects/ProjectsListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:id',
    name: 'project-detail',
    component: () => import('@/views/projects/ProjectDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/articles',
    name: 'articles',
    component: () => import('@/views/articles/ArticlesListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/articles/:id',
    name: 'article-detail',
    component: () => import('@/views/articles/ArticleDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/articles/create',
    name: 'article-create',
    component: () => import('@/views/articles/ArticleCreateView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/favorites/FavoritesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/activity',
    name: 'activity',
    component: () => import('@/views/activity/ActivityView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/users/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth;
  const isGuest = to.meta.guest;

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' });
  } else if (isGuest && authStore.isAuthenticated) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;
