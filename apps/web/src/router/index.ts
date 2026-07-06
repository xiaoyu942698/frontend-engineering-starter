import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth-store';
import { canAccess } from '@/shared/auth/permissions';

/**
 * Application router configured with route-level auth and permission metadata.
 */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'studio',
      component: () => import('@/features/studio/AgentStudio.vue'),
      meta: {
        title: 'Agent Studio',
        requiresAuth: false,
        permissions: ['workflow:read', 'run:read'],
        permissionMode: 'any'
      }
    },
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('@/app/ForbiddenView.vue'),
      meta: {
        title: '无权限',
        requiresAuth: false,
        layout: 'shell'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  authStore.hydrate();

  if (to.meta.title) {
    document.title = `${to.meta.title} · Agent Flow`;
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { path: '/' };
  }

  const allowed = canAccess(
    {
      requiresAuth: to.meta.requiresAuth,
      permissions: to.meta.permissions,
      permissionMode: to.meta.permissionMode
    },
    {
      isAuthenticated: authStore.isAuthenticated,
      permissions: authStore.permissions
    }
  );

  // Reason: permission denial keeps the original target for a later retry after auth changes.
  if (!allowed) {
    return {
      path: '/403',
      query: { redirect: to.fullPath }
    };
  }

  return true;
});
