import 'vue-router';
import type { PermissionMode } from '@/shared/auth/permissions';

declare module 'vue-router' {
  /**
   * Route metadata consumed by title management, layout selection, and access guards.
   */
  interface RouteMeta {
    /**
     * Browser title suffix for the current route.
     */
    title?: string;

    /**
     * Whether the route requires an authenticated user.
     */
    requiresAuth?: boolean;

    /**
     * Whether authenticated users should be redirected away from the route.
     */
    guestOnly?: boolean;

    /**
     * Permission codes required for route access.
     */
    permissions?: readonly string[];

    /**
     * Permission matching strategy for the route.
     */
    permissionMode?: PermissionMode;

    /**
     * Shell layout variant selected by app-level route wrappers.
     */
    layout?: 'shell' | 'blank';
  }
}
