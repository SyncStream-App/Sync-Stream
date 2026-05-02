import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
export default function AuthPage() {
  const { signInWithGoogle, user, loading } = useAuthStore()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (!loading && user) {
      navigate(user.username ? '/' : '/onboarding', { replace: true })
    }
  }, [user, loading])

  const handleAuth = async () => {
    setError('')
    setInfo('')

    if (!email || !password) {
      return setError('Email and password required')
    }

    if (password.length < 8) {
      return setError('Password must be at least 8 characters')
    }

    try {
      setLoadingAuth(true)

      let { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error && error.message.includes('Invalid login')) {
        const res = await supabase.auth.signUp({ email, password })

        if (res.error) throw res.error

        setInfo('Check your email to verify your account')
        return
      }

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Verify your email first')
        } else {
          setError(error.message)
        }
      }

    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoadingAuth(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      return toast.error('Enter your email first')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password reset email sent')
    }
  } 

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-white text-black
      dark:bg-brand-dark dark:text-white">

      <div className="w-full max-w-md p-6 rounded-2xl border space-y-5
        bg-gray-100 border-gray-200
        dark:bg-white/5 dark:border-white/10">

        <h1 className="text-3xl text-center font-bold text-brand-purple">
          SyncStream
        </h1>

        <input
          placeholder="Email"
          className="w-full p-3 rounded-lg
            bg-white border border-gray-300
            dark:bg-white/10 dark:border-white/10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg
            bg-white border border-gray-300
            dark:bg-white/10 dark:border-white/10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleAuth}
          disabled={loadingAuth}
          className="w-full bg-brand-purple text-white p-3 rounded-lg"
        >
          {loadingAuth ? 'Processing...' : 'Continue'}
        </button>

        <div className="text-center text-gray-500 dark:text-gray-400">
          OR
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-white text-black p-3 rounded-lg border"
        >
          Continue with Google
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {info && <p className="text-green-500 text-sm">{info}</p>}
      </div>
    </div>
  )
}