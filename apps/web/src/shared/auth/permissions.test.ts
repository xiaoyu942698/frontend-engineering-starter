import { describe, expect, it } from 'vitest';
import { canAccess, hasRequiredPermissions } from './permissions';

describe('permissions', () => {
  it('supports all, any, and wildcard checks', () => {
    expect(hasRequiredPermissions(['workflow:read', 'run:approve'], ['workflow:read', 'run:approve'])).toBe(true);
    expect(hasRequiredPermissions(['workflow:read'], ['workflow:read', 'run:approve'])).toBe(false);
    expect(hasRequiredPermissions(['workflow:read'], ['workflow:write', 'workflow:read'], 'any')).toBe(true);
    expect(hasRequiredPermissions(['*'], ['admin:manage'])).toBe(true);
  });

  it('rejects protected access without authentication', () => {
    expect(
      canAccess(
        { requiresAuth: true, permissions: ['workflow:read'] },
        { isAuthenticated: false, permissions: ['workflow:read'] }
      )
    ).toBe(false);
  });
});
