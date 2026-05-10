import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth')

  // Kalau tidak ada cookie
  if (!authCookie) {
    return NextResponse.redirect(
      new URL('/admin-login', request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin-private/:path*'],
}