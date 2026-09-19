import type { APIRoute } from 'astro';
import { pingDb } from '@/db/client';

export const GET: APIRoute = async () => {
  try {
    await pingDb();
    return Response.json({ ok: true, database: 'up' });
  } catch (error) {
    console.error('Health check failed:', error);
    return Response.json({ ok: false, database: 'down' }, { status: 503 });
  }
};
