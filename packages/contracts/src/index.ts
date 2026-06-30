import { z } from 'zod';

/**
 * Shared runtime contracts for Agent, Tool, Workflow, Run, event, approval, and artifact data.
 *
 * These schemas are the wire boundary between front-end apps, mock API, and future runtime adapters.
 */
export const isoDateTimeSchema = z.string().datetime();

export const riskLevelSchema = z.enum(['low', 'medium', 'high']);
export type RiskLevel = z.infer<typeof riskLevelSchema>;

export const agentDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  model: z.string().min(1),
  description: z.string().min(1),
  toolIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
});
export type AgentDefinition = z.infer<typeof agentDefinitionSchema>;

export const toolDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(['retrieval', 'code', 'browser', 'file', 'approval', 'api', 'custom']),
  description: z.string().min(1),
  inputSchema: z.record(z.string(), z.unknown()).default({}),
  risk: riskLevelSchema
});
export type ToolDefinition = z.infer<typeof toolDefinitionSchema>;

export const workflowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['input', 'agent', 'tool', 'approval', 'output']),
  label: z.string().min(1),
  agentId: z.string().optional(),
  toolId: z.string().optional(),
  description: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  })
});
export type WorkflowNode = z.infer<typeof workflowNodeSchema>;

export const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  label: z.string().optional()
});
export type WorkflowEdge = z.infer<typeof workflowEdgeSchema>;

export const workflowDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  nodes: z.array(workflowNodeSchema).min(1),
  edges: z.array(workflowEdgeSchema),
  entryNodeId: z.string().min(1)
});
export type WorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

export const runStatusSchema = z.enum(['queued', 'running', 'waiting_approval', 'completed', 'failed', 'canceled']);
export type RunStatus = z.infer<typeof runStatusSchema>;

export const runSchema = z.object({
  id: z.string().min(1),
  workflowId: z.string().min(1),
  status: runStatusSchema,
  input: z.string().min(1),
  startedAt: isoDateTimeSchema,
  endedAt: isoDateTimeSchema.optional()
});
export type Run = z.infer<typeof runSchema>;

export const traceSpanSchema = z.object({
  id: z.string().min(1),
  runId: z.string().min(1),
  parentId: z.string().optional(),
  nodeId: z.string().optional(),
  name: z.string().min(1),
  startedAt: isoDateTimeSchema,
  endedAt: isoDateTimeSchema.optional(),
  status: z.enum(['running', 'completed', 'failed'])
});
export type TraceSpan = z.infer<typeof traceSpanSchema>;

export const humanApprovalSchema = z.object({
  id: z.string().min(1),
  runId: z.string().min(1),
  nodeId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']),
  createdAt: isoDateTimeSchema,
  decidedAt: isoDateTimeSchema.optional(),
  note: z.string().optional()
});
export type HumanApproval = z.infer<typeof humanApprovalSchema>;

export const artifactSchema = z.object({
  id: z.string().min(1),
  runId: z.string().min(1),
  type: z.enum(['markdown', 'json', 'table', 'file']),
  title: z.string().min(1),
  content: z.string().min(1),
  createdAt: isoDateTimeSchema
});
export type Artifact = z.infer<typeof artifactSchema>;

export const runEventSchema = z.object({
  id: z.string().min(1),
  runId: z.string().min(1),
  sequence: z.number().int().positive(),
  type: z.enum([
    'run_started',
    'node_started',
    'tool_call',
    'tool_result',
    'human_approval',
    'human_decision',
    'run_completed',
    'run_failed',
    'run_canceled',
    'artifact'
  ]),
  status: z.enum(['queued', 'running', 'waiting', 'completed', 'failed', 'canceled']),
  nodeId: z.string().optional(),
  message: z.string().min(1),
  timestamp: isoDateTimeSchema,
  toolCall: z
    .object({
      toolId: z.string().min(1),
      input: z.record(z.string(), z.unknown()).default({})
    })
    .optional(),
  approvalId: z.string().optional(),
  artifactId: z.string().optional()
});
export type RunEvent = z.infer<typeof runEventSchema>;

export const createRunRequestSchema = z.object({
  workflowId: z.string().min(1),
  input: z.string().min(1)
});
export type CreateRunRequest = z.infer<typeof createRunRequestSchema>;

export const humanDecisionRequestSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  note: z.string().optional()
});
export type HumanDecisionRequest = z.infer<typeof humanDecisionRequestSchema>;

export const runtimeSnapshotSchema = z.object({
  agents: z.array(agentDefinitionSchema),
  tools: z.array(toolDefinitionSchema),
  workflows: z.array(workflowDefinitionSchema)
});
export type RuntimeSnapshot = z.infer<typeof runtimeSnapshotSchema>;
