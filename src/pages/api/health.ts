import type { APIRoute } from 'astro';
import { jsonResponse } from '@/utils/api';
import { db } from '@/db/client';
import { feedback } from '@/db/schema';

export const GET: APIRoute = async () => {
  try {
    await db.select().from(feedback).limit(1);
    return jsonResponse({ ok: true, database: 'up' });
  } catch (error) {
    console.error('Health check failed:', error);
    return jsonResponse({ ok: false, database: 'down' }, 503);
  }
};
