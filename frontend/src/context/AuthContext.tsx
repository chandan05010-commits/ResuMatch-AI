import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import type { User, AuthTokens, LoginCredentials, RegisterData } from '../types'
import { authApi } from '../services/api'

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!tokens

  const loadStoredAuth = useCallback(async () => {
    const storedTokens = localStorage.getItem('tokens')
    const storedUser = localStorage.getItem('user')

    if (storedTokens) {
      try {
        const parsedTokens = JSON.parse(storedTokens) as AuthTokens
        setTokens(parsedTokens)

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as User
          setUser(parsedUser)
        } else {
          const response = await authApi.me()
          const userData = response.data

          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        }
      } catch {
        localStorage.removeItem('tokens')
        localStorage.removeItem('user')
      }
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadStoredAuth()
  }, [loadStoredAuth])

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.me()
      const userData = response.data

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch {
      setUser(null)
      setTokens(null)
      localStorage.removeItem('tokens')
      localStorage.removeItem('user')
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials)

    const {
      access_token,
      refresh_token,
      token_type,
    } = response.data

    const newTokens: AuthTokens = {
      access_token,
      refresh_token,
      token_type,
    }

    // Save tokens first so /me can use Authorization header
    setTokens(newTokens)
    localStorage.setItem('tokens', JSON.stringify(newTokens))

    // Backend login response does not contain user
    const userResponse = await authApi.me()
    const userData = userResponse.data

    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data)

    const {
      access_token,
      refresh_token,
      token_type,
    } = response.data

    const newTokens: AuthTokens = {
      access_token,
      refresh_token,
      token_type,
    }

    // Save tokens first so /me can use Authorization header
    setTokens(newTokens)
    localStorage.setItem('tokens', JSON.stringify(newTokens))

    // Get actual user from backend
    const userResponse = await authApi.me()
    const userData = userResponse.data

    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      const storedTokens = localStorage.getItem('tokens')

      if (storedTokens) {
        const parsedTokens = JSON.parse(storedTokens) as AuthTokens

        await authApi.logout()
      }
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null)
      setTokens(null)
      localStorage.removeItem('tokens')
      localStorage.removeItem('user')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}