import type { AgentDefinition, ToolDefinition, WorkflowDefinition } from '@agent-flow/contracts';

export const agents: AgentDefinition[] = [
  {
    id: 'agent-planner',
    name: '任务规划 Agent',
    role: 'planner',
    model: 'mock-reasoning',
    description: '拆解目标、识别依赖和审批点，输出可执行流程。',
    toolIds: ['tool-context-pack'],
    tags: ['planning', 'workflow']
  },
  {
    id: 'agent-research',
    name: '研究分析 Agent',
    role: 'researcher',
    model: 'mock-fast',
    description: '检索上下文、提取事实并形成引用清单。',
    toolIds: ['tool-search'],
    tags: ['research', 'retrieval']
  },
  {
    id: 'agent-operator',
    name: '执行 Agent',
    role: 'operator',
    model: 'mock-tool',
    description: '根据审批结果执行工具调用并生成最终产物。',
    toolIds: ['tool-ci-check', 'tool-artifact'],
    tags: ['execution']
  }
];

export const tools: ToolDefinition[] = [
  {
    id: 'tool-context-pack',
    name: '上下文包生成',
    kind: 'file',
    description: '整理任务需要的文件、约束和验证方式。',
    inputSchema: { task: 'string' },
    risk: 'medium'
  },
  {
    id: 'tool-search',
    name: '知识库检索',
    kind: 'retrieval',
    description: '检索项目文档和历史决策，返回摘要而不是全文。',
    inputSchema: { query: 'string' },
    risk: 'low'
  },
  {
    id: 'tool-ci-check',
    name: '验证命令',
    kind: 'code',
    description: '执行类型检查、测试和构建验证。',
    inputSchema: { command: 'string' },
    risk: 'high'
  },
  {
    id: 'tool-artifact',
    name: '产物归档',
    kind: 'custom',
    description: '生成 Markdown、JSON 或表格结果。',
    inputSchema: { title: 'string' },
    risk: 'low'
  }
];

export const workflows: WorkflowDefinition[] = [
  {
    id: 'workflow-release',
    name: '发布检查编排',
    description: '规划、检索、审批、验证和归档的多 Agent 流程。',
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
      {
        id: 'approval',
        type: 'approval',
        label: '人工审批',
        description: '高风险工具调用前必须确认影响范围。',
        position: { x: 190, y: 200 }
      },
      {
        id: 'operator',
        type: 'agent',
        label: '执行 Agent',
        agentId: 'agent-operator',
        position: { x: 20, y: 320 }
      },
      { id: 'output', type: 'output', label: '执行结果', position: { x: 190, y: 320 } }
    ],
    edges: [
      { id: 'edge-input-planner', source: 'input', target: 'planner' },
      { id: 'edge-planner-research', source: 'planner', target: 'research' },
      { id: 'edge-research-approval', source: 'research', target: 'approval' },
      { id: 'edge-approval-operator', source: 'approval', target: 'operator' },
      { id: 'edge-operator-output', source: 'operator', target: 'output' }
    ]
  }
];
