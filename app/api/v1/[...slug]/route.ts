import { type NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL, API_VERSION_PREFIX } from '@/lib/api/config'
import { getAccessToken, getSessionRole, routeGuard } from '@/lib/api/server'
import { setAuthCookies, clearAuthCookies } from '@/lib/api/cookies'
import type { UserRole } from '@/lib/api/types'

export const dynamic = 'force-dynamic'

async function handleProxy(req: NextRequest, method: string) {
  // 1. Upstream Health Check
  if (!API_BASE_URL) {
    console.error('CRITICAL: API_BASE_URL environment variable is missing.')
    return NextResponse.json(
      { error: 'Gateway misconfigured: Missing upstream base URL.' },
      { status: 500 }
    )
  }

  const { pathname, search } = req.nextUrl
  
  // Cleanly extract the subpath (e.g., "pharmacy/inventory/")
  // This regex replacement naturally preserves any original trailing slash
  const subpath = pathname.replace(/^\/api\/v1\/?/, '')

  // Normalize subpath for route map lookups (removes trailing slash for matching consistency)
  const normalizedLookupPath = subpath.replace(/\/$/, '')

  // 2. Server-Side Guard Rails & Context Permissions Check
  const guard = routeGuard(normalizedLookupPath)
  const token = await getAccessToken()
  const currentRole = await getSessionRole()

  if (guard) {
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (!currentRole || !guard.roles.includes(currentRole)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 })
    }
  }

  // 3. Assemble Target Destination Address
  // If subpath has a trailing slash, it correctly maintains it before URL params append
  const downstreamUrl = `${API_BASE_URL}${API_VERSION_PREFIX}/${subpath}${search}`

  // 4. Assemble and Normalize Safe Request Headers
  const proxyHeaders = new Headers()
  if (token) {
    proxyHeaders.set('Authorization', `Bearer ${token}`)
  }
  
  // Forward core headers alongside multi-part boundary string details
  const contentHeader = req.headers.get('content-type')
  if (contentHeader) {
    proxyHeaders.set('content-type', contentHeader)
  }

  const acceptHeader = req.headers.get('accept')
  if (acceptHeader) {
    proxyHeaders.set('accept', acceptHeader)
  }

  try {
    // Read payload body as a raw binary array buffer
    // This supports JSON and file/CSV uploads without fracturing stream packages
    const hasBody = !['GET', 'HEAD', 'DELETE'].includes(method)
    const bodyBuffer = hasBody ? await req.arrayBuffer().catch(() => undefined) : undefined

    // 5. Live Transmission Pipeline Execution
    const upstreamResponse = await fetch(downstreamUrl, {
      method,
      headers: proxyHeaders,
      body: bodyBuffer,
      cache: 'no-store',
    })

    // 6. Process and Parse Responses Safely
    const contentType = upstreamResponse.headers.get('content-type') || ''
    let dataPayload: any = null

    if (contentType.includes('application/json')) {
      dataPayload = await upstreamResponse.json().catch(() => ({}))
    } else {
      const textData = await upstreamResponse.text().catch(() => '')
      dataPayload = { data: textData }
    }

    const finalResponse = NextResponse.json(dataPayload, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
    })

    // 7. Inline Cookie Interception Lifecycle Management
    if (upstreamResponse.ok && dataPayload) {
      const isAuthCycle = ['auth/login', 'auth/register', 'auth/refresh'].includes(normalizedLookupPath)
      
      if (isAuthCycle) {
        const outAccessToken = dataPayload.access || dataPayload.access_token || dataPayload.accessToken || dataPayload.token
        const outRefreshToken = dataPayload.refresh || dataPayload.refresh_token || dataPayload.refreshToken
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

    // 8. Session Termination Checklist
    if (normalizedLookupPath === 'auth/logout' || upstreamResponse.status === 401) {
      clearAuthCookies(finalResponse)
    }

    return finalResponse

  } catch (err) {
    console.error(`Production Proxy linkage break on [${method}] to ${subpath}:`, err)
    return NextResponse.json(
      { error: 'Bad Gateway: Upstream API server unreachable or timed out.' }, 
      { status: 502 }
    )
  }
}

// Export Method Proxies Explicitly
export async function GET(req: NextRequest) { return handleProxy(req, 'GET') }
export async function POST(req: NextRequest) { return handleProxy(req, 'POST') }
export async function PUT(req: NextRequest) { return handleProxy(req, 'PUT') }
export async function DELETE(req: NextRequest) { return handleProxy(req, 'DELETE') }