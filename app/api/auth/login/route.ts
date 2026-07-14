// import { type NextRequest, NextResponse } from 'next/server'
// import { API_BASE_URL, API_VERSION_PREFIX, USE_MOCK } from '@/lib/api/config'
// import { setAuthCookies } from '@/lib/api/cookies'
// import { findDemoUser } from '@/lib/api/mock'

// export const dynamic = 'force-dynamic'

// export async function POST(req: NextRequest) {
//   let payload: { identifier?: string; password?: string }
//   try {
//     payload = await req.json()
//   } catch {
//     return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
//   }

//   const identifier = (payload.identifier ?? '').trim()
//   const password = payload.password ?? ''
//   if (!identifier || !password) {
//     return NextResponse.json(
//       { error: 'Identifier and password are required' },
//       { status: 400 },
//     )
//   }

//   if (USE_MOCK) {
//     const user = findDemoUser(identifier)
//     if (!user || password !== user.password) {
//       return NextResponse.json(
//         { error: 'Invalid credentials. Try a demo account below.' },
//         { status: 401 },
//       )
//     }
//     const { password: _pw, ...safe } = user
//     const res = NextResponse.json({ user: safe })
//     setAuthCookies(res, {
//       access: `mock.${user.id}.${Date.now()}`,
//       refresh: `mockr.${user.id}`,
//       role: user.role,
//     })
//     return res
//   }

//   // Real backend
//   const upstream = await fetch(`${API_BASE_URL}${API_VERSION_PREFIX}/auth/login`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ identifier, password }),
//     cache: 'no-store',
//   })
//   const data = await upstream.json().catch(() => ({}))
//   if (!upstream.ok) {
//     return NextResponse.json(
//       { error: data?.error ?? data?.message ?? 'Login failed' },
//       { status: upstream.status },
//     )
//   }

//   const access = data.access_token ?? data.accessToken ?? data.token
//   const refresh = data.refresh_token ?? data.refreshToken
//   const role = data.user?.role ?? data.role
//   if (!access || !role) {
//     return NextResponse.json({ error: 'Malformed auth response' }, { status: 502 })
//   }
//   const res = NextResponse.json({ user: data.user ?? null })
//   setAuthCookies(res, { access, refresh, role })
//   return res
// }


import { type NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL, API_VERSION_PREFIX } from '@/lib/api/config'
import { setAuthCookies } from '@/lib/api/cookies'
import type { UserRole } from '@/lib/api/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Fail-fast if the production backend destination is misconfigured
  if (!API_BASE_URL) {
    console.error('CRITICAL: API_BASE_URL environment variable is missing.')
    return NextResponse.json(
      { error: 'Server misconfigured: Missing upstream base URL.' },
      { status: 500 }
    )
  }

  let payload: { identifier?: string; password?: string }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed or invalid JSON payload' }, { status: 400 })
  }

  const identifier = (payload.identifier ?? '').trim()
  const password = payload.password ?? ''

  if (!identifier || !password) {
    return NextResponse.json(
      { error: 'Identifier (phone, email, or username) and password are required' },
      { status: 400 },
    )
  }

  try {
    // Dispatch request to the live upstream production backend
    const upstream = await fetch(`${API_BASE_URL}${API_VERSION_PREFIX}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
      cache: 'no-store',
    })

    const data = await upstream.json().catch(() => ({}))

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.error ?? data?.message ?? 'Invalid credentials' },
        { status: upstream.status },
      )
    }

    // Adapt to flexible production JWT payload keys securely
    const access = data.access ?? data.access_token ?? data.accessToken ?? data.token
    const refresh = data.refresh ?? data.refresh_token ?? data.refreshToken
    const role = data.user?.role ?? data.role

    if (!access || !role) {
      console.error('Production upstream response is missing core token/role claims:', data)
      return NextResponse.json({ error: 'Malformed authentication response from server' }, { status: 502 })
    }

    // Prepare response containing safe user details for client-side state
    const res = NextResponse.json({ 
      ok: true,
      user: data.user ?? null 
    })

    // Bake secure, httpOnly cookies into the response headers
    setAuthCookies(res, { 
      access, 
      refresh, 
      role: role as UserRole 
    })

    return res

  } catch (err) {
    console.error('Connection down-link failure during login lifecycle:', err)
    return NextResponse.json({ error: 'Authentication gateway temporarily unreachable' }, { status: 502 })
  }
}