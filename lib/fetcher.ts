export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/** SWR fetcher — always same-origin, credentials included for httpOnly cookies. */
export async function fetcher(url: string) {
  // 1. Snatch the auth token from storage (update key name based on your auth architecture)
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // 2. Inject the bearer token into the headers if it exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error(`API Network Error: ${response.status}`)
  }

  return response.json()
}
// Use this for POST/PUT/DELETE requests (Mutations)
export const poster = async (url: string, data: any) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Include your Authorization header here if needed
      // 'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('An error occurred while submitting the report.');
  }

  return res.json();
};

/** Mutation helper for POST/PUT/PATCH/DELETE against same-origin routes. */
export async function apiMutate<T = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(
      (data && (data.error || data.message)) || 'Request failed',
      res.status,
    )
  }
  return data as T
}

/** Build a query string from a record, skipping empty values. */
export function qs(params: Record<string, any>): string {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      query.append(key, String(val))
    }
  })
  const s = query.toString()
  return s ? `?${s}` : ""
}
