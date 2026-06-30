import type {
  AgentDefinition,
  HumanApproval,
  RunEvent,
  RuntimeSnapshot,
  WorkflowDefinition
} from '@agent-flow/contracts';

export const fallbackSnapshot: RuntimeSnapshot = {
  agents: [
    {
      id: 'agent-planner',
      name: '任务规划 Agent',
      role: 'planner',
      model: 'mock-reasoning',
      description: '拆解目标、识别依赖和审批点。',
      toolIds: ['tool-context-pack'],
      tags: ['planning']
    },
    {
      id: 'agent-research',
      name: '研究分析 Agent',
      role: 'researcher',
      model: 'mock-fast',
      description: '检索上下文并形成事实摘要。',
      toolIds: ['tool-search'],
      tags: ['research']
    }
  ],
  tools: [
    {
      id: 'tool-search',
      name: '知识库检索',
      kind: 'retrieval',
      description: '从项目知识库检索摘要。',
      inputSchema: { query: 'string' },
      risk: 'low'
    },
    {
      id: 'tool-ci-check',
      name: '验证命令',
      kind: 'code',
      description: '执行测试、构建和类型检查。',
      inputSchema: { command: 'string' },
      risk: 'high'
    }
  ],
  workflows: [
    {
      id: 'workflow-release',
      name: '发布检查编排',
      description: '规划、检索、审批、验证和归档。',
      entryNodeId: 'input',
      nodes: [
        { id: 'input', type: 'input', label: '输入任务', position: { x: 20, y: 80 } },
        {
          id: 'planner',
          type: 'agent',
          label: '任务规划 Agent',
          agentId: 'agent-planner',
          position: { x: 190, y: 40 }
        },
        {
          id: 'research',
          type: 'agent',
          label: '研究分析 Agent',
          agentId: 'agent-research',
          position: { x: 20, y: 200 }
        },
        { id: 'approval', type: 'approval', label: '人工审批', position: { x: 190, y: 200 } },
        { id: 'output', type: 'output', label: '执行结果', position: { x: 190, y: 320 } }
      ],
      edges: [
        { id: 'edge-input-planner', source: 'input', target: 'planner' },
        { id: 'edge-planner-research', source: 'planner', target: 'research' },
        { id: 'edge-research-approval', source: 'research', target: 'approval' },
        { id: 'edge-approval-output', source: 'approval', target: 'output' }
      ]
    }
  ]
};

export const fallbackEvents: RunEvent[] = [
  {
    id: 'event-preview-1',
    runId: 'preview',
    sequence: 1,
    type: 'run_started',
    status: 'running',
    nodeId: 'input',
    message: '准备运行发布检查编排。',
    timestamp: '2026-06-05T00:00:00.000Z'
  },
  {
    id: 'event-preview-2',
    runId: 'preview',
    sequence: 2,
    type: 'tool_call',
    status: 'running',
    nodeId: 'research',
    message: '研究分析 Agent 将调用知识库检索。',
    timestamp: '2026-06-05T00:00:01.000Z',
    toolCall: { toolId: 'tool-search', input: { query: 'release' } }
  }
];

export const fallbackApproval: HumanApproval = {
  id: 'approval-preview',
  runId: 'preview',
  nodeId: 'approval',
  title: '人工审批',
  description: '高风险验证命令执行前需要确认。',
  status: 'pending',
  createdAt: '2026-06-05T00:00:02.000Z'
};

export function findAgent(snapshot: RuntimeSnapshot, id?: string): AgentDefinition | null {
  return snapshot.agents.find((agent) => agent.id === id) ?? null;
}

export function getFirstWorkflow(snapshot: RuntimeSnapshot): WorkflowDefinition {
  return snapshot.workflows[0] ?? fallbackSnapshot.workflows[0]!;
}
