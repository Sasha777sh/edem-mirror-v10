import 'dotenv/config';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { store } from './storage/fileStorage.js';
import { LivingCore } from './core/livingCore.js';

const app = Fastify({ logger: false });

// Serve static UI from /public (path is resolved relative to this file)
const publicRoot = path.resolve(fileURLToPath(new URL('../public', import.meta.url)));
await app.register(fastifyStatic, { root: publicRoot, prefix: '/' });

// Explicitly serve index.html on root
app.get('/', async (_req, reply) => {
  // @ts-ignore - sendFile is added by @fastify/static
  return reply.sendFile('index.html');
});

app.get('/health', async () => ({ status: 'ok', service: 'edem-living-agent', ts: new Date().toISOString() }));

app.post('/api/respond', async (req, reply) => {
  const schema = z.object({ userId: z.string().min(1), message: z.string().min(1) });
  const body = schema.parse((req as any).body);

  const existing = store.getAgent(body.userId);
  const core = new LivingCore(existing ?? undefined);
  const result = await core.respond(body.userId, body.message);

  store.putAgent(core.snapshot(body.userId));
  return reply.send(result);
});

app.put('/api/archetype', async (req, reply) => {
  const schema = z.object({ userId: z.string().min(1), archetype: z.string().min(1) });
  const body = schema.parse((req as any).body);

  const existing = store.getAgent(body.userId);
  const core = new LivingCore(existing ?? undefined);
  core.setArchetype(body.archetype);
  store.putAgent(core.snapshot(body.userId));
  return reply.send({ ok: true });
});

app.get('/api/silence', async (_req, reply) => {
  const variants = [
    '...\n\nЯ здесь.\n\nПросто дыши.\n\n...',
    '...\n\nТишина тоже ответ.\n\nСлушай своё дыхание.\n\n...',
    '...\n\nНе нужно слов.\n\nБудь.\n\n...'
  ];
  return reply.send({ response: variants[Math.floor(Math.random() * variants.length)] });
});

const port = Number(process.env.PORT || 3100);
app
  .listen({ port })
  .then(() => console.log(`edem-living-agent listening on http://localhost:${port}`))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
