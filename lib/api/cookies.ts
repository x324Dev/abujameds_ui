import 'server-only'
import type { NextResponse } from 'next/server'
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE,
  ROLE_COOKIE,
} from './config'
import type { UserRole } from './types'

const baseOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export function setAuthCookies(
  res: NextResponse,
  tokens: { access: string; refresh?: string; role: UserRole },
) {
  res.cookies.set(ACCESS_COOKIE, tokens.access, {
    ...baseOptions,
    maxAge: ACCESS_MAX_AGE,
  })
  if (tokens.refresh) {
    res.cookies.set(REFRESH_COOKIE, tokens.refresh, {
      ...baseOptions,
      maxAge: REFRESH_MAX_AGE,
    })
  }
  // Role cookie is httpOnly too — the client reads role via /api/auth/me.
  res.cookies.set(ROLE_COOKIE, tokens.role, {
    ...baseOptions,
    maxAge: REFRESH_MAX_AGE,
  })
}

export function clearAuthCookies(res: NextResponse) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE]) {
    res.cookies.set(name, '', { ...baseOptions, maxAge: 0 })
  }
}
