import { type NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL, API_VERSION_PREFIX } from '@/lib/api/config'
import { getAccessToken } from '@/lib/api/server'
import { clearAuthCookies } from '@/lib/api/cookies'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/me
 * Retrieves current active authenticated profile details from upstream.
 */
export async function GET() {
  const token = await getAccessToken()
  
  // Graceful handling for guest or unauthenticated layout shells
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 })
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}${API_VERSION_PREFIX}/auth/me`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      cache: 'no-store',
    })

    if (upstream.status === 401) {
      const errorResponse = NextResponse.json({ user: null }, { status: 200 })
      clearAuthCookies(errorResponse)
      return errorResponse
    }

    if (!upstream.ok) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const data = await upstream.json().catch(() => ({}))
    return NextResponse.json({ user: data.user ?? data })

  } catch (err) {
    console.error('Upstream connection error during profile verification:', err)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

/**
 * PATCH /api/auth/me
 * Updates structural metadata profiles like username or email upstream.
 */
export async function PATCH(req: NextRequest) {
  const token = await getAccessToken()
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let payload: { username?: string; email?: string }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Malformed payload data structure' }, { status: 400 })
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}${API_VERSION_PREFIX}/auth/me`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    })

    const data = await upstream.json().catch(() => ({}))

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data?.error ?? data?.message ?? 'Profile update rejected' },
        { status: upstream.status }
      )
    }

    return NextResponse.json({ 
      ok: true, 
      user: data.user ?? data 
    })

  } catch (err) {
    console.error('Connection down-link failure during profile update lifecycle:', err)
    return NextResponse.json({ error: 'Upstream server gateway unreachable' }, { status: 502 })
  }
}