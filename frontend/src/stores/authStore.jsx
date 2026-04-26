// frontend/src/stores/authStore.js
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const API_URL =
  import.meta.env.VITE_API_URL || 'https://sync-stream-u6em.onrender.com'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  theme: 'dark',

  initAuth: async () => {
    set({ loading: true })

    // ✅ Step 1: Get existing session FIRST
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.access_token) {
      console.log('Existing session:', session.user.email)
      await get().syncWithBackend(session.access_token)
    }

    // ✅ Step 2: Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email)

        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.access_token) {
          await get().syncWithBackend(session.access_token)
        }

        if (event === 'SIGNED_OUT') {
          set({ user: null, token: null, loading: false })
        }
      }
    )

    // ✅ Clean OAuth code from URL
    if (window.location.search.includes('code=')) {
      window.history.replaceState(null, '', window.location.pathname)
    }

    // ✅ Stop loading ONLY if no session
    if (!session) {
      set({ loading: false })
    }

    // ✅ Return cleanup (important if used inside React)
    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, // ✅ <-- FIXED COMMA HERE

  syncWithBackend: async (supabaseToken) => {
    console.log('Calling backend with token:', supabaseToken)

    try {
      const response = await fetch(`${API_URL}/auth/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: supabaseToken }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Backend sync failed: ${response.status} — ${errorText}`
        )
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
      },
    })

    if (error) throw error
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, token: null })
  },

  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    }))
  },
}))