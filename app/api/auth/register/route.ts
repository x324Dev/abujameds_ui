// import { type NextRequest, NextResponse } from 'next/server'
// import { API_BASE_URL, API_VERSION_PREFIX, USE_MOCK } from '@/lib/api/config'
// import { setAuthCookies } from '@/lib/api/cookies'
// import type { User, UserRole } from '@/lib/api/types'

// export const dynamic = 'force-dynamic'

// export async function POST(req: NextRequest) {
//   let payload: {
//     fullName?: string
//     phone?: string
//     email?: string
//     username?: string
//     password?: string
//     role?: UserRole
//   }
//   try {
//     payload = await req.json()
//   } catch {
//     return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
//   }

//   const { fullName, phone, password } = payload
//   if (!fullName || !phone || !password) {
//     return NextResponse.json(
//       { error: 'Full name, phone, and password are required' },
//       { status: 400 },
//     )
//   }
//   if (!/^\+234\d{10}$/.test(phone)) {
//     return NextResponse.json(
//       { error: 'Phone must be a valid Nigerian number (+234...)' },
//       { status: 400 },
//     )
//   }
//   if (password.length < 8) {
//     return NextResponse.json(
//       { error: 'Password must be at least 8 characters' },
//       { status: 400 },
//     )
//   }

//   const role: UserRole = payload.role ?? 'patient'

//   if (USE_MOCK) {
//     const user: User = {
//       id: `u-${Date.now()}`,
//       fullName,
//       phone,
//       email: payload.email,
//       username: payload.username,
//       role,
//       phoneVerified: false,
//       createdAt: new Date().toISOString(),
//     }
//     const res = NextResponse.json({ user, requiresOtp: true })
//     setAuthCookies(res, {
//       access: `mock.${user.id}.${Date.now()}`,
//       refresh: `mockr.${user.id}`,
//       role,
//     })
//     return res
//   }

//   const upstream = await fetch(`${API_BASE_URL}${API_VERSION_PREFIX}/auth/register`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(payload),
//     cache: 'no-store',
//   })
//   const data = await upstream.json().catch(() => ({}))
//   if (!upstream.ok) {
//     return NextResponse.json(
//       { error: data?.error ?? data?.message ?? 'Registration failed' },
//       { status: upstream.status },
//     )
//   }
//   const access = data.access_token ?? data.accessToken ?? data.token
//   const refresh = data.refresh_token ?? data.refreshToken
//   const res = NextResponse.json({ user: data.user ?? null, requiresOtp: true })
//   if (access) setAuthCookies(res, { access, refresh, role: data.user?.role ?? role })
//   return res
// }

import { type NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL, API_VERSION_PREFIX } from '@/lib/api/config'
import { setAuthCookies } from '@/lib/api/cookies'
import type { UserRole } from '@/lib/api/types'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json({ error: 'Gateway misconfigured: Missing upstream base URL.' }, { status: 500 })
  }

  let payload: {
    fullName?: string
    phone?: string
    email?: string
    username?: string
    password?: string
    role?: UserRole
  }

  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed or invalid JSON payload' }, { status: 400 })
  }

  const { fullName, phone, password } = payload
  const role: UserRole = payload.role ?? 'patient'

  // Server-Side Guard Rails for Data Cleanliness
  if (!fullName?.trim() || !phone?.trim() || !password) {
    return NextResponse.json(
      { error: 'Full name, phone number, and password are required credentials' },
      { status: 400 },
    )
  }

  // Strict validation pattern for FCT/Nigerian global dialing structures
  if (!/^\+234\d{10}$/.test(phone.trim())) {
    return NextResponse.json(
      { error: 'Phone number format must be a valid international Nigerian sequence (+234...)' },
      { status: 400 },
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Security constraint: Password must contain at least 8 characters' },
      { status: 400 },
    )
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}${API_VERSION_PREFIX}/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        fullName: fullName.trim(),
        phone: phone.trim(),
        password,
        email: payload.email?.trim() || undefined,
        username: payload.username?.trim() || undefined,
        role
      }),
      cache: 'no-store',
    })

    const data = await upstream.json().catch(() => ({}))

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.error ?? data?.message ?? 'Account registration rejected by upstream backend.' },
        { status: upstream.status },
      )
    }

    // Capture standard token variants gracefully from live deployment frameworks
    const access = data.access ?? data.access_token ?? data.accessToken ?? data.token
    const refresh = data.refresh ?? data.refresh_token ?? data.refreshToken
    const verifiedRole = data.user?.role ?? role

    const res = NextResponse.json({ 
      ok: true,
      user: data.user ?? null, 
      requiresOtp: true 
    })

    // Securely cache identity tokens within cookie jar parameters on successful validation cycles
    if (access) {
      setAuthCookies(res, { 
        access, 
        refresh, 
        role: verifiedRole as UserRole 
      })
    }

    return res

  } catch (err) {
    console.error('Connection failure encountered during registration sequence gateway proxy:', err)
    return NextResponse.json({ error: 'Registration server gateway temporarily unreachable' }, { status: 502 })
  }
}