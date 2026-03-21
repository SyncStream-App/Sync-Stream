import {create} from 'zustand'
import {supabase} from '../lib/supabase'

export const
useAuthStore = create((set) => ({
    user: null,
    theme: 'dark',
    initAuth:
    async() => {
        const{data: {session}} = await
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user ?? null})
        })
    },
    setTheme: (theme) => {
        set({theme})
    },
    signOut: 
    async() => {
        await
        supabase.auth.signOut()
          set({ user: null})
    },
}))