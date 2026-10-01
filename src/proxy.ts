import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_COOKIE } from './i18n/config';

/**
 * Old links like /en/events → /events, remembering the language in a cookie
 * so shared links keep working after dropping locale prefixes.
 */
export function proxy(request: NextRequest) {
  const [, prefix, ...rest] = request.nextUrl.pathname.split('/');
  const url = request.nextUrl.clone();
  url.pathname = `/${rest.join('/')}`;
  const response = NextResponse.redirect(url, 308);
  response.cookies.set(LOCALE_COOKIE, prefix, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  return response;
}

export const config = {
  matcher: ['/es', '/en', '/es/:path*', '/en/:path*'],
};
