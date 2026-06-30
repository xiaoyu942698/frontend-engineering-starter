import { createApp } from './app';

const port = Number(process.env.AGENT_FLOW_API_PORT || 8787);
const host = process.env.AGENT_FLOW_API_HOST || '127.0.0.1';

const app = createApp();
await app.listen({ host, port });
