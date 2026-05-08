import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import * as authApi from '../api/auth'
import { clearSessionToken, getSessionToken, setSessionToken } from '../lib/session'
import { roomsCacheKey } from '../constants/storage'
import type { User } from '../types/api'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getSessionToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    authApi
      .getMe()
      .then(setUser)
      .catch(() => {
        clearSessionToken()
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const result = await authApi.login({ email, password })
    setSessionToken(result.token)
    if (result.user) {
      setUser(result.user)
      return
    }
    const me = await authApi.getMe()
    setUser(me)
  }

  async function register(name: string, email: string, password: string) {
    const result = await authApi.register({ name, email, password })
    setSessionToken(result.token)
    if (result.user) {
      setUser(result.user)
      return
    }
    const me = await authApi.getMe()
    setUser(me)
  }

  function logout() {
    const currentUser = user
    clearSessionToken()
    setUser(null)
    if (currentUser) {
      localStorage.removeItem(roomsCacheKey(currentUser.id))
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [isLoading, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }
  return context
}
