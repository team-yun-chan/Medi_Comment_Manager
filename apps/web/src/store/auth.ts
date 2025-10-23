import { create } from 'zustand'
import { authApi } from '@/lib/api'

interface User {
  id: string
  email: string
  name?: string
  role: string
  accounts: Array<{
    provider: string
    expiresAt: string | null
  }>
  youtubeChannels: Array<{
    id: string
    channelId: string
    title: string
  }>
  instagramPages: Array<{
    id: string
    fbPageId: string
    name: string
    username?: string
    igId?: string
  }>
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  
  setToken: (token: string) => void
  login: (token: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,
  isAuthenticated: false,

  setToken: (token: string) => {
    localStorage.setItem('token', token)
    set({ token, isAuthenticated: true })
  },

  login: async (token: string) => {
    try {
      localStorage.setItem('token', token)
      set({ token, isLoading: true })
      
      const { data } = await authApi.getMe()
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch (error) {
      console.error('Login error:', error)
      localStorage.removeItem('token')
      set({ token: null, user: null, isAuthenticated: false, isLoading: false })
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  fetchUser: async () => {
    const token = get().token
    if (!token) return

    try {
      set({ isLoading: true })
      const { data } = await authApi.getMe()
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch (error) {
      console.error('Fetch user error:', error)
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))
