import {
  runEventSchema,
  type Artifact,
  type HumanApproval,
  type Run,
  type RunEvent,
  type RuntimeSnapshot,
  type WorkflowDefinition
} from '@agent-flow/contracts';
import { fetchRuntimeSnapshot, resolveApiUrl, startRun, submitApproval } from '@/shared/api/client';
import { normalizeApiError } from '@/shared/api/errors';

/**
 * Runtime boundary consumed by feature components instead of backend SDKs.
 */
export interface RuntimeAdapter {
  /**
   * Loads catalog data required to render workflow, agent, and tool surfaces.
   */
  listWorkflows(): Promise<RuntimeSnapshot>;

  /**
   * Starts a run and returns the first state snapshot needed by the session view.
   */
  startRun(
    workflow: WorkflowDefinition,
    input: string
  ): Promise<{ run: Run; events: RunEvent[]; approval: HumanApproval | null }>;

  /**
   * Subscribes to ordered run events and returns a disposer for component cleanup.
   */
  streamRunEvents(runId: string, onEvent: (event: RunEvent) => void, onError?: (error: unknown) => void): () => void;

  /**
   * Resolves a human approval gate and returns the finalized runtime output.
   */
  submitHumanDecision(
    runId: string,
    approvalId: string,
    decision: 'approved' | 'rejected'
  ): Promise<{ run: Run; events: RunEvent[]; artifacts: Artifact[] }>;
}

/**
 * Default runtime adapter backed by the local Fastify mock API.
 */
export class MockRuntimeAdapter implements RuntimeAdapter {
  async listWorkflows() {
    return fetchRuntimeSnapshot();
  }

  async startRun(workflow: WorkflowDefinition, input: string) {
    return startRun(workflow, input);
  }

  streamRunEvents(runId: string, onEvent: (event: RunEvent) => void, onError?: (error: unknown) => void) {
    const source = new EventSource(resolveApiUrl(`/api/runs/${runId}/events/stream`));

    source.addEventListener('run-event', (message) => {
      try {
        onEvent(runEventSchema.parse(JSON.parse((message as MessageEvent).data)));
      } catch (error) {
        // Reason: once an event violates the contract, later events can no longer be trusted in order.
        onError?.(normalizeApiError(error));
        source.close();
      }
    });

    source.onerror = () => {
      onError?.(normalizeApiError(new Error('运行事件流连接失败。')));
      source.close();
    };

    return () => source.close();
  }

  async submitHumanDecision(runId: string, approvalId: string, decision: 'approved' | 'rejected') {
    return submitApproval(runId, approvalId, decision);
  }
}
