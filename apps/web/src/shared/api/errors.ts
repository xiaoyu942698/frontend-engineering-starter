import axios from 'axios';
import { z } from 'zod';

/**
 * Standard error categories used by request interceptors and UI states.
 */
export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

/**
 * Normalized API error shape passed from infrastructure to feature UI.
 */
export interface AppApiError extends Error {
  code: ApiErrorCode | string;
  status?: number;
  details?: unknown;
}

const ApiErrorPayloadSchema = z
  .object({
    code: z.string().optional(),
    message: z.string().optional(),
    details: z.unknown().optional()
  })
  .passthrough();

function resolveCodeFromStatus(status?: number): ApiErrorCode {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 400 || status === 422) return 'VALIDATION_ERROR';
  return status ? 'UNKNOWN' : 'NETWORK_ERROR';
}

function createApiError(
  message: string,
  code: ApiErrorCode | string,
  status?: number,
  details?: unknown,
  cause?: unknown
) {
  const error = new Error(message, { cause }) as AppApiError;
  error.name = 'AppApiError';
  error.code = code;
  error.status = status;
  error.details = details;
  return error;
}

/**
 * Checks whether an unknown error already follows the normalized shape.
 */
export function isAppApiError(error: unknown): error is AppApiError {
  return error instanceof Error && error.name === 'AppApiError' && 'code' in error;
}

/**
 * Converts transport, validation, and runtime errors into AppApiError.
 */
export function normalizeApiError(error: unknown): AppApiError {
  if (isAppApiError(error)) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const payload = ApiErrorPayloadSchema.safeParse(error.response?.data);
    const message =
      payload.success && payload.data.message
        ? payload.data.message
        : typeof error.response?.data === 'string'
          ? error.response.data
          : error.message || '请求失败';
    const code = payload.success && payload.data.code ? payload.data.code : resolveCodeFromStatus(status);

    return createApiError(message, code, status, payload.success ? payload.data.details : error.response?.data, error);
  }

  if (error instanceof Error) {
    return createApiError(error.message || '未知错误', 'UNKNOWN', undefined, undefined, error);
  }

  return createApiError('未知错误', 'UNKNOWN', undefined, error, error);
}

/**
 * Extracts the user-facing message for an unknown request error.
 */
export function getApiErrorMessage(error: unknown) {
  return normalizeApiError(error).message;
}
