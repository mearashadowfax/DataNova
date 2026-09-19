import type { APIRoute } from 'astro';
import { getFeedbackStore } from '@/feedback/store';

export const GET: APIRoute = async () => {
  try {
    await getFeedbackStore().ping();
    return Response.json({ ok: true, database: 'up' });
  } catch (error) {
    console.error('Health check failed:', error);
    return Response.json({ ok: false, database: 'down' }, { status: 503 });
  }
};
