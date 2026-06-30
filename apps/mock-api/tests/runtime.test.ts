import { describe, expect, it } from 'vitest';
import { createMockRun, getRunEvents, submitHumanDecision } from '../src/runtime';

describe('mock runtime', () => {
  it('creates a run with ordered events and resolves human approval', () => {
    const run = createMockRun('workflow-release', '请执行发布检查');

    expect(run.status).toBe('waiting_approval');

    const events = getRunEvents(run.id);
    expect(events.map((event) => event.sequence)).toEqual([1, 2, 3, 4, 5]);
    expect(events.some((event) => event.type === 'human_approval')).toBe(true);

    const approved = submitHumanDecision(run.id, 'approved', '继续执行');
    expect(approved?.status).toBe('completed');
    expect(getRunEvents(run.id).at(-1)?.type).toBe('artifact');
  });
});
