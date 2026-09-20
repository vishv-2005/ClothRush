import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole, Profile } from '@/lib/types'

/**
 * Get the currently authenticated user or null
 */
export async function getUser(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

/**
 * Get the currently authenticated user - redirects to login if not authenticated
 */
export async function requireAuth(redirectTo?: string): Promise<Profile> {
  const user = await getUser()
  if (!user) {
    redirect(redirectTo || '/login')
  }
  return user
}

/**
 * Require a specific role - redirects if unauthorized
 */
export async function requireRole(
  role: UserRole | UserRole[],
  redirectTo?: string
): Promise<Profile> {
  const user = await requireAuth()
  const roles = Array.isArray(role) ? role : [role]
  
  if (!roles.includes(user.role)) {
    redirect(redirectTo || '/unauthorized')
  }
  return user
}

/**
 * Get the user's role without redirecting
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getUser()
  return user?.role ?? null
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const userRole = await getUserRole()
  return userRole === role
}

/**
 * Get the role-appropriate dashboard URL
 */
export function getDashboardUrl(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'SELLER':
      return '/seller'
    case 'DELIVERY_PARTNER':
      return '/delivery'
    case 'CUSTOMER':
    default:
      return '/'
  }
}
