import { describe, expect, it } from 'vitest';
import {
  agentDefinitionSchema,
  artifactSchema,
  humanApprovalSchema,
  runEventSchema,
  toolDefinitionSchema,
  workflowDefinitionSchema
} from './index';

describe('agent-flow contracts', () => {
  it('validates agent, tool, workflow, run event, approval, and artifact payloads', () => {
    expect(
      agentDefinitionSchema.parse({
        id: 'agent-research',
        name: '研究分析 Agent',
        role: 'researcher',
        model: 'mock-fast',
        description: '负责检索输入、提取事实并输出结构化摘要。',
        toolIds: ['tool-search'],
        tags: ['research']
      }).id
    ).toBe('agent-research');

    expect(
      toolDefinitionSchema.parse({
        id: 'tool-search',
        name: '知识库检索',
        kind: 'retrieval',
        description: '从项目知识库中检索相关材料。',
        inputSchema: { query: 'string' },
        risk: 'low'
      }).kind
    ).toBe('retrieval');

    expect(
      workflowDefinitionSchema.parse({
        id: 'workflow-release',
        name: '发布检查流程',
        description: '多 Agent 协作完成发布前检查。',
        nodes: [
          { id: 'start', type: 'input', label: '输入需求', position: { x: 0, y: 0 } },
          { id: 'agent', type: 'agent', label: '研究分析 Agent', agentId: 'agent-research', position: { x: 220, y: 0 } }
        ],
        edges: [{ id: 'edge-start-agent', source: 'start', target: 'agent' }],
        entryNodeId: 'start'
      }).nodes
    ).toHaveLength(2);

    expect(
      runEventSchema.parse({
        id: 'event-1',
        runId: 'run-1',
        sequence: 1,
        type: 'tool_call',
        status: 'running',
        nodeId: 'agent',
        message: '正在调用知识库检索。',
        timestamp: '2026-06-05T00:00:00.000Z',
        toolCall: { toolId: 'tool-search', input: { query: 'release' } }
      }).type
    ).toBe('tool_call');

    expect(
      humanApprovalSchema.parse({
        id: 'approval-1',
        runId: 'run-1',
        nodeId: 'approval',
        title: '确认发布',
        description: '是否允许继续执行发布检查？',
        status: 'pending',
        createdAt: '2026-06-05T00:00:00.000Z'
      }).status
    ).toBe('pending');

    expect(
      artifactSchema.parse({
        id: 'artifact-1',
        runId: 'run-1',
        type: 'markdown',
        title: '执行摘要',
        content: '# Summary',
        createdAt: '2026-06-05T00:00:00.000Z'
      }).type
    ).toBe('markdown');
  });
});
