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

  // ✅ Set user manually (used in onboarding)
  setUser: (user) => set({ user }),

  initAuth: async () => {
    set({ loading: true })

    // ✅ INIT THEME FIRST (VERY IMPORTANT)
    const savedTheme = localStorage.getItem('theme') || 'dark'
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    set({ theme: savedTheme })
    
    try {
      // ✅ Step 1: Get existing session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.access_token) {
        console.log('Existing session:', session.user.email)
        await get().syncWithBackend(session.access_token)
      } else {
        set({ loading: false })
      }

      // ✅ Step 2: Listen for auth changes
      const { data: listener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth event:', event, session?.user?.email)

          if (
            (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') &&
            session?.access_token
          ) {
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

      // ✅ Cleanup listener (important in React useEffect)
      return () => {
        listener?.subscription?.unsubscribe()
      }
    } catch (err) {
      console.error('initAuth error:', err)
      set({ user: null, token: null, loading: false })
    }
  },

  syncWithBackend: async (supabaseToken) => {
    try {
      console.log('Calling backend with token:', supabaseToken)

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
      console.log("✅ BACKEND JWT:", data.access_token)   // ADD THIS
      console.log("👤 USER FROM BACKEND:", data.user)   
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
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Signout error:', err)
    }

    set({
      user: null,
      token: null,
      loading: false,
    })
  },

  toggleTheme: () => {
    const current = get().theme
    const next = current === 'dark' ? 'light' : 'dark'

    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')

    set({ theme: next })
  },
}))