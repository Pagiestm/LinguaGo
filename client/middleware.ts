import { rewrite } from '@vercel/functions/middleware';

export const config = { matcher: '/api/:path*' };

export default function middleware(request: Request): Response {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) return Response.json({ message: 'API_URL non définie' }, { status: 502 });

  const { pathname, search } = new URL(request.url);
  return rewrite(new URL(pathname.replace(/^\/api/, '') + search, apiUrl));
}
