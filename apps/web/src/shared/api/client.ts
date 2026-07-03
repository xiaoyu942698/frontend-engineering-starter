import axios, { type AxiosRequestConfig } from 'axios';
import { z } from 'zod';
import type { AgentDefinition, RuntimeSnapshot, WorkflowDefinition } from '@agent-flow/contracts';
import {
  artifactSchema,
  humanApprovalSchema,
  runEventSchema,
  runSchema,
  runtimeSnapshotSchema
} from '@agent-flow/contracts';
import { useAuthStore } from '@/stores/auth-store';
import { appEnv } from '@/shared/config/env';
import { normalizeApiError } from './errors';

const RunStartResultSchema = z.object({
  run: runSchema,
  events: z.array(runEventSchema),
  approval: humanApprovalSchema.nullable()
});

const HumanDecisionResultSchema = z.object({
  run: runSchema,
  events: z.array(runEventSchema),
  artifacts: z.array(artifactSchema).default([])
});

/**
 * Project-wide Axios instance; feature code should use the typed helpers below instead of importing Axios directly.
 */
export const apiClient = axios.create({
  baseURL: appEnv.apiBaseUrl,
  timeout: appEnv.requestTimeoutMs
});

apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  authStore.hydrate();

  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }

  return config;
});

apiClient.interceptors.response.use(undefined, (error) => {
  const normalizedError = normalizeApiError(error);

  // Reason: stale credentials must be removed before the next guard or directive reads auth state.
  if (normalizedError.status === 401) {
    useAuthStore().clearSession();
  }

  return Promise.reject(normalizedError);
});

/**
 * Sends an HTTP request through the project Axios instance.
 */
export async function request<TData>(config: AxiosRequestConfig) {
  const response = await apiClient.request<TData>(config);
  return response.data;
}

/**
 * Resolves API-relative paths for HTTP and SSE clients.
 */
export function resolveApiUrl(path: string) {
  if (!appEnv.apiBaseUrl) return path;

  try {
    return new URL(path, appEnv.apiBaseUrl).toString();
  } catch {
    const baseUrl = appEnv.apiBaseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${normalizedPath}`;
  }
}

/**
 * Loads the runtime resource snapshot and validates it at the boundary.
 */
export async function fetchRuntimeSnapshot(): Promise<RuntimeSnapshot> {
  const data = await request<unknown>({ method: 'GET', url: '/api/runtime/snapshot' });
  return runtimeSnapshotSchema.parse(data);
}

/**
 * Creates a mock run for the selected workflow.
 */
export async function startRun(workflow: WorkflowDefinition, input: string) {
  const data = await request<unknown>({
    method: 'POST',
    url: '/api/runs',
    data: {
      workflowId: workflow.id,
      input
    }
  });
  return RunStartResultSchema.parse(data);
}

/**
 * Submits a human approval decision and validates returned run artifacts.
 */
export async function submitApproval(runId: string, approvalId: string, decision: 'approved' | 'rejected') {
  const data = await request<unknown>({
    method: 'POST',
    url: `/api/runs/${runId}/approvals/${approvalId}`,
    data: {
      decision,
      note: decision === 'approved' ? '前端模板审批通过。' : '前端模板审批拒绝。'
    }
  });
  return HumanDecisionResultSchema.parse(data);
}

/**
 * Runtime snapshot enriched with strongly typed Agent records.
 */
export type StudioSnapshot = RuntimeSnapshot & {
  agents: AgentDefinition[];
};
