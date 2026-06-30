import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { RunEvent, WorkflowDefinition } from '@agent-flow/contracts';
import { apiClient } from '@/shared/api/client';
import { MockRuntimeAdapter } from './adapter';

const workflow: WorkflowDefinition = {
  id: 'workflow-release',
  name: '发布检查',
  description: '检查发布流程',
  entryNodeId: 'input',
  nodes: [{ id: 'input', type: 'input', label: '输入', position: { x: 0, y: 0 } }],
  edges: []
};

const run = {
  id: 'run-1',
  workflowId: workflow.id,
  status: 'waiting_approval' as const,
  input: '检查模板',
  startedAt: '2026-06-30T00:00:00.000Z'
};

const runEvent: RunEvent = {
  id: 'event-1',
  runId: run.id,
  sequence: 1,
  type: 'run_started',
  status: 'running',
  nodeId: 'input',
  message: '开始运行',
  timestamp: '2026-06-30T00:00:00.000Z'
};

class FakeEventSource {
  static instances: FakeEventSource[] = [];

  onerror: (() => void) | null = null;
  closed = false;
  url: string;
  private listeners = new Map<string, (message: { data: string }) => void>();

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (message: { data: string }) => void) {
    this.listeners.set(type, listener);
  }

  close() {
    this.closed = true;
  }

  emitRunEvent(payload: unknown) {
    this.listeners.get('run-event')?.({ data: JSON.stringify(payload) });
  }

  fail() {
    this.onerror?.();
  }
}

/**
 * The fake source keeps SSE parsing deterministic without opening sockets.
 */
beforeEach(() => {
  setActivePinia(createPinia());
  FakeEventSource.instances = [];
  vi.stubGlobal('EventSource', FakeEventSource);
  apiClient.defaults.adapter = undefined;
});

describe('MockRuntimeAdapter', () => {
  it('delegates runtime requests through the API boundary', async () => {
    const adapter = new MockRuntimeAdapter();
    apiClient.defaults.adapter = async (config) => {
      const url = String(config.url);
      const data =
        url === '/api/runtime/snapshot'
          ? { agents: [], tools: [], workflows: [workflow] }
          : url === '/api/runs'
            ? { run, events: [runEvent], approval: null }
            : {
                run: { ...run, status: 'completed', endedAt: '2026-06-30T00:01:00.000Z' },
                events: [runEvent],
                artifacts: []
              };

      return { data, status: 200, statusText: 'OK', headers: {}, config, request: {} };
    };

    await expect(adapter.listWorkflows()).resolves.toMatchObject({ workflows: [workflow] });
    await expect(adapter.startRun(workflow, '检查模板')).resolves.toMatchObject({ run, events: [runEvent] });
    await expect(adapter.submitHumanDecision(run.id, 'approval-1', 'approved')).resolves.toMatchObject({
      artifacts: []
    });
  });

  it('parses stream events and closes invalid streams', () => {
    const adapter = new MockRuntimeAdapter();
    const onEvent = vi.fn();
    const onError = vi.fn();

    const stop = adapter.streamRunEvents(run.id, onEvent, onError);
    const source = FakeEventSource.instances[0] as FakeEventSource;
    source.emitRunEvent(runEvent);
    source.emitRunEvent({ broken: true });

    expect(source.url).toBe(`/api/runs/${run.id}/events/stream`);
    expect(onEvent).toHaveBeenCalledWith(runEvent);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(source.closed).toBe(true);

    stop();
    expect(source.closed).toBe(true);
  });

  it('normalizes stream connection failures', () => {
    const adapter = new MockRuntimeAdapter();
    const onError = vi.fn();

    adapter.streamRunEvents(run.id, vi.fn(), onError);
    const source = FakeEventSource.instances[0] as FakeEventSource;
    source.fail();

    expect(onError.mock.calls[0]?.[0]).toMatchObject({
      code: 'UNKNOWN',
      message: '运行事件流连接失败。'
    });
    expect(source.closed).toBe(true);
  });
});
