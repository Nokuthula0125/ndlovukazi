import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (token, user) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        set({ token, user })
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization']
        set({ token: null, user: null })
      },

      updateUser: (user) => set({ user }),

      initAuth: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      },
    }),
    {
      name: 'ndlovukazi-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
