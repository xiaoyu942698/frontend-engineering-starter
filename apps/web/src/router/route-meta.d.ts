import 'vue-router';
import type { PermissionMode } from '@/shared/auth/permissions';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    requiresAuth?: boolean;
    guestOnly?: boolean;
    permissions?: readonly string[];
    permissionMode?: PermissionMode;
    layout?: 'shell' | 'blank';
  }
}
