import { describe, expect, it } from 'vitest';
import {
  cancelRun,
  createMockRun,
  getPendingApproval,
  getRun,
  getRunEvents,
  listArtifacts,
  listRuns,
  submitHumanDecision,
  updateRunStatus
} from '../src/runtime';

describe('mock runtime', () => {
  it('creates a run with ordered events and resolves human approval', () => {
    const run = createMockRun('workflow-release', '请执行发布检查');

    expect(run.status).toBe('waiting_approval');
    expect(getRun(run.id)?.id).toBe(run.id);

    const events = getRunEvents(run.id);
    expect(events.map((event) => event.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(events.some((event) => event.type === 'human_approval')).toBe(true);
    expect(getPendingApproval(run.id)?.runId).toBe(run.id);

    const approved = submitHumanDecision(run.id, 'approved', '继续执行');
    expect(approved?.status).toBe('completed');
    expect(getRunEvents(run.id).at(-1)?.type).toBe('artifact');
    expect(listArtifacts(run.id)).toHaveLength(1);
    expect(getPendingApproval(run.id)).toBeNull();
    expect(listRuns().some((item) => item.id === run.id)).toBe(true);
  });

  it('rejects approvals and records a failed terminal event', () => {
    const run = createMockRun('workflow-risk', '拒绝高风险命令');
    const rejected = submitHumanDecision(run.id, 'rejected', '风险过高');

    expect(rejected?.status).toBe('failed');
    expect(rejected?.endedAt).toBeDefined();
    expect(listArtifacts(run.id)).toEqual([]);
    expect(getRunEvents(run.id).at(-1)?.type).toBe('run_failed');
  });

  it('cancels runs and returns empty state for missing runs', () => {
    const run = createMockRun('workflow-cancel', '取消当前任务');
    const canceled = cancelRun(run.id);

    expect(canceled?.status).toBe('canceled');
    expect(getRunEvents(run.id).at(-1)?.type).toBe('run_canceled');
    expect(getRun('missing-run')).toBeNull();
    expect(getRunEvents('missing-run')).toEqual([]);
    expect(listArtifacts('missing-run')).toEqual([]);
    expect(cancelRun('missing-run')).toBeNull();
    expect(updateRunStatus('missing-run', 'completed')).toBeNull();
  });

  it('updates non-terminal and terminal statuses', () => {
    const run = createMockRun('workflow-status', '更新状态');

    const running = updateRunStatus(run.id, 'running');
    expect(running?.status).toBe('running');
    expect(running?.endedAt).toBeUndefined();

    const completed = updateRunStatus(run.id, 'completed');
    expect(completed?.status).toBe('completed');
    expect(completed?.endedAt).toBeDefined();
  });
});
