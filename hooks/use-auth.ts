'use client'

import useSWR from 'swr'
import { apiMutate, fetcher } from '@/lib/fetcher'
import type { User, UserRole } from '@/lib/api/types'

interface MeResponse {
  user: User | null
}

export function useAuth() {
  const { data, isLoading, mutate } = useSWR<MeResponse>('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  async function login(identifier: string, password: string) {
    const res = await apiMutate<{ user: User }>('/api/auth/login', 'POST', {
      identifier,
      password,
    })
    await mutate({ user: res.user }, { revalidate: false })
    return res.user
  }

  async function register(payload: {
    fullName: string
    phone: string
    email?: string
    username?: string
    password: string
    role: UserRole
  }) {
    const res = await apiMutate<{ user: User; requiresOtp: boolean }>(
      '/api/auth/register',
      'POST',
      payload,
    )
    await mutate({ user: res.user }, { revalidate: false })
    return res
  }

  async function logout() {
    await apiMutate('/api/auth/logout', 'POST')
    await mutate({ user: null }, { revalidate: false })
    window.location.href = '/';
  }

  return {
    user: data?.user ?? null,
    isAuthenticated: Boolean(data?.user),
    isLoading,
    login,
    register,
    logout,
    refresh: mutate,
  }
}
