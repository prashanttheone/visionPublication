import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value }: any) => {
            res = NextResponse.next();
            res.cookies.set(name, value);
          });
        },
      },
    }
  );

  // Refresh session and sync auth state
  const { data: { session } } = await supabase.auth.getSession();

  // Redirect unauthenticated users from admin routes to login
  if (!session && req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*',], 
};
