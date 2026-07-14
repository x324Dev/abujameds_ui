import 'server-only'
import { cookies } from 'next/headers'
import { ACCESS_COOKIE, ROLE_COOKIE } from './config'
import type { UserRole } from './types'

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(ACCESS_COOKIE)?.value
}

export async function getSessionRole(): Promise<UserRole | undefined> {
  const store = await cookies()
  return store.get(ROLE_COOKIE)?.value as UserRole | undefined
}

/** Path prefixes (after /api/v1/) that require authentication + allowed roles. */
export const PROTECTED_ROUTES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: 'pharmacy', roles: ['pharmacy_admin', 'superadmin'] },
  { prefix: 'institutional', roles: ['institutional', 'superadmin'] },
  { prefix: 'orders', roles: ['patient', 'pharmacy_admin', 'superadmin'] },
  { prefix: 'auth/me', roles: ['patient', 'pharmacy_admin', 'institutional', 'superadmin'] },
]

export function routeGuard(path: string): { prefix: string; roles: UserRole[] } | null {
  const clean = path.replace(/^\/+/, '')
  return (
    PROTECTED_ROUTES.find(
      (r) => clean === r.prefix || clean.startsWith(`${r.prefix}/`),
    ) ?? null
  )
}
