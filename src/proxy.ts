import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes that don't need auth
  const publicRoutes = ['/login', '/signup', '/']
  const isPublicRoute = publicRoutes.includes(pathname)
  const isApiRoute = pathname.startsWith('/api/')
  const isStaticRoute = pathname.startsWith('/_next/') || pathname.startsWith('/favicon')
  const isProductRoute = pathname.startsWith('/product/') || pathname.startsWith('/search') || pathname.startsWith('/category/')

  // Allow static files and API routes
  if (isStaticRoute) return supabaseResponse
  
  // Allow public routes and product browsing without auth
  if (isPublicRoute || isProductRoute) return supabaseResponse

  // If no user and trying to access protected route
  if (!user && !isApiRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route protection
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Seller routes require SELLER or ADMIN role
    if (pathname.startsWith('/seller') && role !== 'SELLER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Admin routes require ADMIN role
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Delivery routes require DELIVERY_PARTNER or ADMIN role
    if (pathname.startsWith('/delivery') && role !== 'DELIVERY_PARTNER' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
