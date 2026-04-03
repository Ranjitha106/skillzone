import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the token in cookies (or headers if you've set them)
  // Note: localStorage isn't available in Middleware, so for absolute security
  // you would use Cookies. For now, we will do a "Soft Protect" on the client side.
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/session/:path*'],
};