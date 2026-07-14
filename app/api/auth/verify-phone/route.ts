// import { type NextRequest, NextResponse } from 'next/server'
// import { API_BASE_URL, API_VERSION_PREFIX, USE_MOCK } from '@/lib/api/config'

// export const dynamic = 'force-dynamic'

// export async function POST(req: NextRequest) {
//   const body = await req.json().catch(() => ({}))
//   const code = (body?.code ?? body?.otp ?? '') as string

//   if (USE_MOCK) {
//     if (code !== '123456') {
//       return NextResponse.json({ error: 'Invalid OTP. Use 123456 in demo mode.' }, { status: 400 })
//     }
//     return NextResponse.json({ ok: true, phoneVerified: true })
//   }

//   const upstream = await fetch(`${API_BASE_URL}${API_VERSION_PREFIX}/auth/verify-phone`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(body),
//     cache: 'no-store',
//   })
//   const data = await upstream.json().catch(() => ({}))
//   return NextResponse.json(data, { status: upstream.status })
// }

import { type NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL, API_VERSION_PREFIX } from '@/lib/api/config'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!API_BASE_URL) {
    console.error('CRITICAL: API_BASE_URL environment variable is missing.')
    return NextResponse.json(
      { error: 'Gateway misconfigured: Missing upstream base URL.' },
      { status: 500 }
    )
  }

  const body = await req.json().catch(() => ({}))

  try {
    const upstream = await fetch(`${API_BASE_URL}${API_VERSION_PREFIX}/auth/verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    const data = await upstream.json().catch(() => ({}))
    return NextResponse.json(data, { status: upstream.status })

  } catch (err) {
    console.error('Connection failure during downstream verify-phone dispatch:', err)
    return NextResponse.json({ error: 'Authentication gateway temporarily unreachable' }, { status: 502 })
  }
}