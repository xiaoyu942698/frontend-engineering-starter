import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { RuntimeSnapshot, WorkflowDefinition } from '@agent-flow/contracts';
import { useAuthStore } from '@/stores/auth-store';
import { apiClient, fetchRuntimeSnapshot, request, resolveApiUrl, startRun, submitApproval } from './client';

const workflow: WorkflowDefinition = {
  id: 'workflow-release',
  name: '发布检查',
  description: '检查发布流程',
  entryNodeId: 'input',
  nodes: [{ id: 'input', type: 'input', label: '输入', position: { x: 0, y: 0 } }],
  edges: []
};

const snapshot: RuntimeSnapshot = {
  agents: [
    {
      id: 'agent-reviewer',
      name: 'Reviewer',
      role: 'review',
      model: 'mock',
      description: '检查模板',
      toolIds: [],
      tags: []
    }
  ],
  tools: [
    {
      id: 'tool-search',
      name: 'Search',
      kind: 'retrieval',
      description: '检索上下文',
      inputSchema: {},
      risk: 'low'
    }
  ],
  workflows: [workflow]
};

const run = {
  id: 'run-1',
  workflowId: workflow.id,
  status: 'waiting_approval' as const,
  input: '检查模板',
  startedAt: '2026-06-30T00:00:00.000Z'
};

const approval = {
  id: 'approval-1',
  runId: run.id,
  nodeId: 'approval',
  title: '审批',
  description: '确认继续',
  status: 'pending' as const,
  createdAt: '2026-06-30T00:00:00.000Z'
};

const event = {
  id: 'event-1',
  runId: run.id,
  sequence: 1,
  type: 'run_started' as const,
  status: 'running' as const,
  nodeId: 'input',
  message: '开始运行',
  timestamp: '2026-06-30T00:00:00.000Z'
};

/**
 * These tests protect the shared HTTP boundary rather than feature behavior.
 */
beforeEach(() => {
  setActivePinia(createPinia());
  window.localStorage.clear();
  apiClient.defaults.adapter = undefined;
});

describe('api client', () => {
  it('injects auth and validates runtime responses', async () => {
    const seenHeaders: string[] = [];
    apiClient.defaults.adapter = (async (config) => {
      seenHeaders.push(String(config.headers?.Authorization ?? ''));
      const url = String(config.url);
      const data =
        url === '/api/runtime/snapshot'
          ? snapshot
          : url === '/api/runs'
            ? { run, events: [event], approval }
            : {
                run: { ...run, status: 'completed', endedAt: '2026-06-30T00:01:00.000Z' },
                events: [event],
                artifacts: []
              };

      return {
        data,
        status: url === '/api/runs' ? 201 : 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {}
      };
    }) as typeof apiClient.defaults.adapter;

    useAuthStore().setSession({
      accessToken: 'access-token',
      user: { id: 'u1', name: '用户', role: 'admin', permissions: ['*'] }
    });

    await expect(fetchRuntimeSnapshot()).resolves.toEqual(snapshot);
    await expect(startRun(workflow, '检查模板')).resolves.toMatchObject({ run, events: [event], approval });
    await expect(submitApproval(run.id, approval.id, 'approved')).resolves.toMatchObject({ artifacts: [] });
    expect(seenHeaders).toContain('Bearer access-token');
  });

  it('clears stored auth when a request returns unauthorized', async () => {
    const authStore = useAuthStore();
    authStore.setSession({
      accessToken: 'expired-token',
      user: { id: 'u1', name: '用户', role: 'admin', permissions: ['*'] }
    });
    apiClient.defaults.adapter = (async () => {
      throw {
        isAxiosError: true,
        message: 'Unauthorized',
        response: { status: 401, data: { code: 'UNAUTHORIZED', message: '登录已过期' } }
      };
    }) as typeof apiClient.defaults.adapter;

    await expect(request({ method: 'GET', url: '/api/protected' })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      status: 401,
      message: '登录已过期'
    });
    expect(authStore.isAuthenticated).toBe(false);
    expect(window.localStorage.getItem('agent-flow.auth')).toBeNull();
  });

  it('resolves relative API paths without a configured base URL', () => {
    expect(resolveApiUrl('/api/runtime/snapshot')).toBe('/api/runtime/snapshot');
  });
});
