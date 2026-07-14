import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api/config'
import { routeGuard, getAccessToken, getSessionRole } from '@/lib/api/server'
import { setAuthCookies, clearAuthCookies } from '@/lib/api/cookies'
import type { UserRole } from '@/lib/api/types'

async function handleProxy(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  // Fail-fast if the environment is misconfigured
  if (!API_BASE_URL) {
    console.error('CRITICAL: API_BASE_URL environment variable is missing.')
    return NextResponse.json(
      { error: 'Gateway misconfigured: Missing upstream base URL.' },
      { status: 500 }
    )
  }

  const method = req.method
  const { searchParams } = new URL(req.url)
  
  // Extract clean subpath segments (e.g., /api/v1/pharmacy/profile -> "pharmacy/profile")
  const resolvedParams = await params
  const pathSegments = resolvedParams.path || []
  const subpath = pathSegments.join('/')

  // 1. Enforce Server-Side Route Guards
  const guard = routeGuard(subpath)
  const token = await getAccessToken()
  const currentRole = await getSessionRole()

  if (guard) {
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (currentRole && !guard.roles.includes(currentRole)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 })
    }
  }

  // 2. Build Upstream Destination URL
  const queryStr = searchParams.toString()
  const downstreamUrl = `${API_BASE_URL}/api/v1/${subpath}${queryStr ? `?${queryStr}` : ''}`

  // 3. Prepare and Clean Headers
  const proxyHeaders = new Headers()
  if (token) {
    proxyHeaders.set('Authorization', `Bearer ${token}`)
  }
  
  const contentHeader = req.headers.get('content-type')
  if (contentHeader) {
    proxyHeaders.set('content-type', contentHeader)
  }

  // Pass along accept headers if present
  const acceptHeader = req.headers.get('accept')
  if (acceptHeader) {
    proxyHeaders.set('accept', acceptHeader)
  }

  try {
    // Read body payload as an ArrayBuffer to preserve exact binary integrity 
    // (Works seamlessly for JSON, URLEncoded, or Multipart/Form-Data payloads)
    const hasBody = !['GET', 'HEAD'].includes(method)
    const bodyBuffer = hasBody ? await req.arrayBuffer() : undefined

    // 4. Dispatch Live Request to Upstream Production Backend
    const upstreamResponse = await fetch(downstreamUrl, {
      method,
      headers: proxyHeaders,
      body: bodyBuffer,
    })

    // 5. Parse Content Safely
    const contentType = upstreamResponse.headers.get('content-type') || ''
    let dataPayload: any = null

    if (contentType.includes('application/json')) {
      dataPayload = await upstreamResponse.json()
    } else {
      dataPayload = { message: await upstreamResponse.text() }
    }

    const finalResponse = NextResponse.json(dataPayload, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    })

    // 6. Intercept Auth Cycles to Manage HTTP-Only Cookies
    if (upstreamResponse.ok && dataPayload) {
      const isAuthCycle = ['auth/login', 'auth/register', 'auth/refresh'].includes(subpath)
      
      if (isAuthCycle) {
        const outAccessToken = dataPayload.access || dataPayload.accessToken
        const outRefreshToken = dataPayload.refresh || dataPayload.refreshToken
        const outRole = dataPayload.user?.role || dataPayload.role

        if (outAccessToken && outRole) {
          setAuthCookies(finalResponse, {
            access: outAccessToken,
            refresh: outRefreshToken,
            role: outRole as UserRole,
          })
        }
      }
    }

    // 7. Clear Client State on Explicit Logout or Invalidated Token
    if (subpath === 'auth/logout' || upstreamResponse.status === 401) {
      clearAuthCookies(finalResponse)
    }

    return finalResponse

  } catch (err) {
    console.error(`Production Gateway connection down-link failure on [${method}] ${subpath}:`, err)
    return NextResponse.json({ error: 'Bad Gateway: Back-end API unreachable.' }, { status: 502 })
  }
}

export {
  handleProxy as GET,
  handleProxy as POST,
  handleProxy as PUT,
  handleProxy as PATCH,
  handleProxy as DELETE
}