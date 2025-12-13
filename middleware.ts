import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const authToken = req.cookies.get('authToken')?.value;

  // Only check if token exists - don't verify JWT (that's for Node.js runtime)
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Token exists, allow request to proceed
  // API routes and server components will verify the actual JWT
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*',], 
};
