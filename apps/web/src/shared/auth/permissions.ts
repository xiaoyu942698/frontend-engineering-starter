/**
 * Controls whether all listed permissions or any listed permission is enough.
 */
export type PermissionMode = 'all' | 'any';

/**
 * Route or action access requirements.
 */
export interface AccessRequirement {
  requiresAuth?: boolean;
  permissions?: readonly string[];
  permissionMode?: PermissionMode;
}

/**
 * Current user access context used by guards and directives.
 */
export interface AccessContext {
  isAuthenticated: boolean;
  permissions: readonly string[];
}

function hasWildcard(permissions: readonly string[]) {
  return permissions.includes('*');
}

/**
 * Checks required permissions while honoring wildcard access.
 */
export function hasRequiredPermissions(
  userPermissions: readonly string[],
  requiredPermissions: readonly string[] = [],
  mode: PermissionMode = 'all'
) {
  if (requiredPermissions.length === 0) return true;
  if (hasWildcard(userPermissions)) return true;

  const matchesRequiredPermission = (permission: string) => userPermissions.includes(permission);
  return mode === 'any'
    ? requiredPermissions.some(matchesRequiredPermission)
    : requiredPermissions.every(matchesRequiredPermission);
}

/**
 * Evaluates authentication and permission requirements together.
 */
export function canAccess(requirement: AccessRequirement, context: AccessContext) {
  if (requirement.requiresAuth && !context.isAuthenticated) return false;
  return hasRequiredPermissions(context.permissions, requirement.permissions, requirement.permissionMode);
}
