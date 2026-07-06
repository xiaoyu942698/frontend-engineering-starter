import type { Directive } from 'vue';
import { useAuthStore } from '@/stores/auth-store';
import { hasRequiredPermissions, type PermissionMode } from './permissions';

type PermissionDirectiveValue =
  | string
  | readonly string[]
  | {
      permissions: string | readonly string[];
      mode?: PermissionMode;
    };

function isPermissionConfig(
  value: PermissionDirectiveValue
): value is { permissions: string | readonly string[]; mode?: PermissionMode } {
  return typeof value === 'object' && !Array.isArray(value);
}

function normalizeValue(value: PermissionDirectiveValue) {
  if (typeof value === 'string') return { permissions: [value], mode: 'all' as PermissionMode };
  if (!isPermissionConfig(value)) return { permissions: value, mode: 'all' as PermissionMode };

  return {
    permissions: typeof value.permissions === 'string' ? [value.permissions] : value.permissions,
    mode: value.mode ?? ('all' as PermissionMode)
  };
}

/**
 * Vue directive for hiding controls when the current auth context lacks permissions.
 */
export const permissionDirective: Directive<HTMLElement, PermissionDirectiveValue> = {
  mounted(el, binding) {
    applyPermission(el, binding.value);
  },
  updated(el, binding) {
    applyPermission(el, binding.value);
  }
};

function applyPermission(el: HTMLElement, value: PermissionDirectiveValue) {
  const authStore = useAuthStore();
  authStore.hydrate();

  const rule = normalizeValue(value);
  const allowed = hasRequiredPermissions(authStore.permissions, rule.permissions, rule.mode);
  el.hidden = !allowed;
  el.setAttribute('aria-hidden', String(!allowed));
}
