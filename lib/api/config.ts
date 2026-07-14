// /**
//  * Central API configuration.
//  *
//  * When API_BASE_URL is set (server-side only, never exposed to the client),
//  * the Next.js route handlers proxy requests to the real AbujaMeds backend.
//  * When it is not set, the proxy serves realistic mock data so the UI is fully
//  * functional in preview without leaking any secrets to the browser.
//  */
// export const API_BASE_URL = process.env.API_BASE_URL?.replace(/\/$/, '') ?? ''

// export const USE_MOCK = !API_BASE_URL

// export const ACCESS_COOKIE = 'am_access'
// export const REFRESH_COOKIE = 'am_refresh'
// export const ROLE_COOKIE = 'am_role'

// // Access token lifetime (seconds) for the httpOnly cookie.
// export const ACCESS_MAX_AGE = 60 * 30 // 30 min
// export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// export const API_VERSION_PREFIX = '/api/v1'


/**
 * Central API configuration.
 *
 * When API_BASE_URL is set (server-side only, never exposed to the client),
 * the Next.js route handlers proxy requests to the real AbujaMeds backend.
 * When it is not set, the proxy serves realistic mock data so the UI is fully
 * functional in preview without leaking any secrets to the browser.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? ''

export const USE_MOCK = !API_BASE_URL

export const ACCESS_COOKIE = 'am_access'
export const REFRESH_COOKIE = 'am_refresh'
export const ROLE_COOKIE = 'am_role'

// Access token lifetime (seconds) for the httpOnly cookie.
export const ACCESS_MAX_AGE = 60 * 30 // 30 min
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export const API_VERSION_PREFIX = '/api/v1'

// App & Service Constants (Client & Server accessible)
export const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || "AbujaMeds",
  env: process.env.NEXT_PUBLIC_APP_ENV || "development",
  apiClientUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  locationIqKey: process.env.NEXT_PUBLIC_LOCATIONIQ_API_KEY || "",
  bypassAuth: process.env.NEXT_PUBLIC_BYPASS_AUTH === "true",
} as const

export type AppConfig = typeof config