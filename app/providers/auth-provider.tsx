// src/providers/auth-provider.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'
import useSWR from 'swr'
import { apiMutate, fetcher } from '@/lib/fetcher'
import type { User, UserRole } from '@/lib/api/types'

interface MeResponse {
  user: User | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<User>
  register: (payload: {
    fullName: string
    phone: string
    email?: string
    username?: string
    password: string
    role: UserRole
  }) => Promise<{ user: User; requiresOtp: boolean }>
  logout: () => Promise<void>
  refresh: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
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
    window.location.href = '/'
  }

  const value = {
    user: data?.user ?? null,
    isAuthenticated: Boolean(data?.user),
    isLoading,
    login,
    register,
    logout,
    refresh: mutate,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Rewritten hook that transparently reads from the shared global context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be executed within an active global AuthProvider layout shell')
  }
  return context
}