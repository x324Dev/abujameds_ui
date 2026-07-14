// import { NextResponse } from 'next/server'
// import { clearAuthCookies } from '@/lib/api/cookies'

// export const dynamic = 'force-dynamic'

// export async function POST() {
//   const res = NextResponse.json({ ok: true })
//   clearAuthCookies(res)
//   return res
// }


import { NextResponse } from 'next/server'
import { clearAuthCookies } from '@/lib/api/cookies'

export const dynamic = 'force-dynamic'

export async function POST() {
  const res = NextResponse.json({ ok: true, message: 'Logged out successfully' })
  // Clear httpOnly cookies safely
  clearAuthCookies(res)
  return res
}