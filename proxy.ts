import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const response = NextResponse.next();

  // 1. Inject Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 2. CSRF Protection for state-mutating requests (POST, PUT, PATCH, DELETE)
  const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  if (isMutatingMethod) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return new NextResponse(
            JSON.stringify({ error: 'CSRF Validation Failed: Invalid Request Origin' }),
            {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }
      } catch (err) {
        return new NextResponse(
          JSON.stringify({ error: 'CSRF Validation Failed: Malformed Origin Header' }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }
  }

  // 3. Rate Limiting on Auth Endpoints
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/api/auth'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && isMutatingMethod) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    const rateLimitKey = `auth:${pathname}:${ip}`;

    // Max 10 mutating requests per 15 minutes per IP
    const limitResult = checkRateLimit(rateLimitKey, 10, 15 * 60 * 1000);

    if (!limitResult.success) {
      const retryAfterSeconds = Math.ceil(limitResult.resetMs / 1000);
      return new NextResponse(
        JSON.stringify({
          error: `Too many authentication attempts. Please try again in ${retryAfterSeconds} seconds.`,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSeconds),
            'X-RateLimit-Limit': String(limitResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(limitResult.resetMs),
          },
        }
      );
    }

    response.headers.set('X-RateLimit-Limit', String(limitResult.limit));
    response.headers.set('X-RateLimit-Remaining', String(limitResult.remaining));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files (_next/static, _next/image, favicon.ico, images)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
