import Fastify from 'fastify';
import { createRunRequestSchema, humanDecisionRequestSchema } from '@agent-flow/contracts';
import { agents, tools, workflows } from './fixtures';
import {
  cancelRun,
  createMockRun,
  getPendingApproval,
  getRun,
  getRunEvents,
  listArtifacts,
  listRuns,
  submitHumanDecision
} from './runtime';

/**
 * Builds the Fastify mock API used by the starter web app and integration tests.
 */
export function createApp() {
  const app = Fastify({ logger: true });

  app.addHook('onRequest', async (_request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
  });

  app.options('/*', async () => ({ ok: true }));

  app.get('/api/runtime/snapshot', async () => ({ agents, tools, workflows }));
  app.get('/api/agents', async () => ({ agents }));
  app.get('/api/tools', async () => ({ tools }));
  app.get('/api/workflows', async () => ({ workflows }));
  app.get('/api/runs', async () => ({ runs: listRuns() }));

  app.post('/api/runs', async (request, reply) => {
    const payload = createRunRequestSchema.parse(request.body);
    const run = createMockRun(payload.workflowId, payload.input);
    return reply.code(201).send({ run, events: getRunEvents(run.id), approval: getPendingApproval(run.id) });
  });

  app.get('/api/runs/:runId', async (request, reply) => {
    const { runId } = request.params as { runId: string };
    const run = getRun(runId);
    if (!run) return reply.code(404).send({ code: 'RUN_NOT_FOUND', message: 'Run not found.' });
    return { run, events: getRunEvents(runId), approval: getPendingApproval(runId), artifacts: listArtifacts(runId) };
  });

  app.get('/api/runs/:runId/events', async (request) => {
    const { runId } = request.params as { runId: string };
    return { events: getRunEvents(runId) };
  });

  app.get('/api/runs/:runId/events/stream', async (request, reply) => {
    const { runId } = request.params as { runId: string };
    const run = getRun(runId);
    if (!run) return reply.code(404).send({ code: 'RUN_NOT_FOUND', message: 'Run not found.' });

    // Reason: the mock runtime uses SSE so adapters exercise the same streaming contract as a real backend.
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    const streamEvents = getRunEvents(runId);
    let index = 0;
    const timer = setInterval(() => {
      const next = streamEvents[index];
      if (!next) {
        clearInterval(timer);
        reply.raw.end();
        return;
      }
      reply.raw.write(`event: run-event\n`);
      reply.raw.write(`data: ${JSON.stringify(next)}\n\n`);
      index += 1;
    }, 250);

    request.raw.on('close', () => clearInterval(timer));
  });

  app.post('/api/runs/:runId/cancel', async (request, reply) => {
    const { runId } = request.params as { runId: string };
    const run = cancelRun(runId);
    if (!run) return reply.code(404).send({ code: 'RUN_NOT_FOUND', message: 'Run not found.' });
    return { run, events: getRunEvents(runId) };
  });

  app.post('/api/runs/:runId/approvals/:approvalId', async (request, reply) => {
    const { runId, approvalId } = request.params as { runId: string; approvalId: string };
    const decision = humanDecisionRequestSchema.parse(request.body);
    const approval = getPendingApproval(runId);
    if (!approval || approval.id !== approvalId) {
      return reply.code(404).send({ code: 'APPROVAL_NOT_FOUND', message: 'Pending approval not found.' });
    }
    const run = submitHumanDecision(runId, decision.decision, decision.note);
    return { run, events: getRunEvents(runId), artifacts: listArtifacts(runId) };
  });

  return app;
}
