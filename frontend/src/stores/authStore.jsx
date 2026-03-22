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

    // Single listener — covers all auth events
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email)

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        await get().syncWithBackend(session.access_token)
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, token: null, loading: false })
      }
    })
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
        console.log('Exchanging OAuth code for session...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Code exchange failed:', error.message)
      set({ loading: false })
      return
    }

    // Clean the ?code= from the URL bar
    window.history.replaceState(null, '', window.location.pathname)

    // syncWithBackend is called by onAuthStateChange SIGNED_IN event above
    // but call it here too as a fallback in case the event already fired
    if (data.session) {
      await get().syncWithBackend(data.session.access_token)
    }
    return
  }

  // No code in URL — check for existing session normally (page refresh etc.)
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    await get().syncWithBackend(session.access_token)
  } else {
    set({ loading: false })
  }
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
      set({ loading: false })
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