// frontend/src/stores/authStore.js
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'https://sync-stream-u6em.onrender.com'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  theme: 'dark',

  initAuth: async () => {
    set({ loading: true })

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email)

      if (event === 'SIGNED_IN' && session) {
        await get().syncWithBackend(session.access_token)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        await get().syncWithBackend(session.access_token)
      } else if (event === 'INITIAL_SESSION' && session) {
        await get().syncWithBackend(session.access_token)
      } else if (event === 'INITIAL_SESSION' && !session) {
        set({ loading: false })
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, token: null, loading: false })
      }
    })

    // Clean ?code= from URL bar — Supabase exchanges it internally, we just clean up
    if (window.location.search.includes('code=')) {
      window.history.replaceState(null, '', window.location.pathname)
    }

    // INITIAL_SESSION event handles everything — no manual getSession needed
  },

  syncWithBackend: async (supabaseToken) => {
    try {
      const response = await fetch(`${API_URL}/auth/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: supabaseToken }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Backend sync failed: ${response.status} — ${errorText}`)
      }

      const data = await response.json()

      set({
        user: data.user,
        token: data.access_token,
        loading: false,
      })
    } catch (error) {
      console.error('Auth sync error:', error)
      set({ user: null, token: null, loading: false })
    }
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: false,
      }
    })
    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, token: null })
  },

  toggleTheme: () => {
    set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' }))
  },
}))