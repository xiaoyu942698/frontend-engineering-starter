import { describe, expect, it } from 'vitest';
import { getApiErrorMessage, isAppApiError, normalizeApiError } from './errors';

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
    expect(isAppApiError(error)).toBe(true);
    expect(getApiErrorMessage(error)).toBe('配置错误');
  });

  it('derives fallback codes and details from axios-like errors', () => {
    const validationError = normalizeApiError({
      isAxiosError: true,
      message: 'Validation failed',
      response: {
        status: 422,
        data: {
          message: '参数错误',
          details: { field: 'name' }
        }
      }
    });

    expect(validationError.code).toBe('VALIDATION_ERROR');
    expect(validationError.details).toEqual({ field: 'name' });

    const textError = normalizeApiError({
      isAxiosError: true,
      message: '',
      response: {
        status: 404,
        data: '资源不存在'
      }
    });

    expect(textError.code).toBe('NOT_FOUND');
    expect(textError.message).toBe('资源不存在');
  });

  it('normalizes unknown values', () => {
    const error = normalizeApiError({ reason: 'unknown' });

    expect(error.code).toBe('UNKNOWN');
    expect(error.details).toEqual({ reason: 'unknown' });
  });
});
