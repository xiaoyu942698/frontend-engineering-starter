import { describe, expect, it } from 'vitest';
import { normalizeApiError } from './errors';

describe('normalizeApiError', () => {
  it('normalizes axios-like response payloads', () => {
    const error = normalizeApiError({
      isAxiosError: true,
      message: 'Request failed',
      response: {
        status: 403,
        data: {
          code: 'FORBIDDEN',
          message: '没有操作权限'
        }
      }
    });

    expect(error.code).toBe('FORBIDDEN');
    expect(error.status).toBe(403);
    expect(error.message).toBe('没有操作权限');
  });

  it('normalizes non-http errors', () => {
    const error = normalizeApiError(new Error('配置错误'));

    expect(error.code).toBe('UNKNOWN');
    expect(error.message).toBe('配置错误');
  });
});
