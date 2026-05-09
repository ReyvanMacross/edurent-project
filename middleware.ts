import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Cek jika akses ke /admin-private
  if (request.nextUrl.pathname.startsWith('/admin-private')) {
    // Cek cookie auth
    const authCookie = request.cookies.get('admin-auth')

    if (authCookie?.value !== 'authenticated') {
      // Redirect ke login page
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin-private/:path*',
}