# Runtime Adapters

## Default Adapter

`MockRuntimeAdapter` is the default. It talks to `apps/mock-api`, starts mock runs, streams events, and submits approval decisions.

## Adapter Interface

```ts
interface RuntimeAdapter {
  listWorkflows(): Promise<RuntimeSnapshot>;
  startRun(workflow: WorkflowDefinition, input: string): Promise<RunStartResult>;
  streamRunEvents(runId: string, onEvent: (event: RunEvent) => void, onError?: (error: unknown) => void): () => void;
  submitHumanDecision(runId: string, approvalId: string, decision: 'approved' | 'rejected'): Promise<RunDecisionResult>;
}
```

`streamRunEvents` must parse incoming SSE payloads through `runEventSchema` before calling `onEvent`. Parse failures and connection failures should call `onError` with a normalized application error, then close the stream.

## Mapping Guidance

- LangGraph: map graph nodes to `WorkflowNode`, stream steps to `RunEvent`, pauses to `HumanApproval`.
- CrewAI: map crew roles to `AgentDefinition`, tasks to workflow nodes, flow execution updates to `RunEvent`.
- Mastra: map TypeScript workflows, tools, memory, and evals through the same adapter.
- OpenAI Agents SDK: map handoffs, tool calls, guardrails, and traces to `RunEvent` and `TraceSpan`.
- Google ADK: map sessions, events, tools, and graph workflows to shared contracts.

The web app should not import SDK-specific types directly. Adapter modules own those translations.
