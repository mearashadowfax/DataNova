import type { APIRoute } from 'astro';

const getRobotsTxt = () => `
User-agent: *
Allow: /
`;

export const GET: APIRoute = () => {
  return new Response(getRobotsTxt());
};