import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

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

      // 1️⃣ Try login
      let { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      // 2️⃣ If user doesn't exist → SIGNUP
      if (error && error.message.includes('Invalid login')) {
        const res = await supabase.auth.signUp({
          email,
          password,
        })

        if (res.error) {
          throw res.error
        }

        setInfo('Check your email to verify your account')
        return
      }

      // 3️⃣ Handle other errors
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before logging in')
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
    if (!email) return setError('Enter your email first')

    await supabase.auth.resetPasswordForEmail(email)
    setInfo('Password reset email sent')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white px-4">
      <div className="w-full max-w-md space-y-6">

        <h1 className="text-4xl text-center font-bold text-brand-purple">
          SyncStream
        </h1>

        {/* Email */}
        <input
          placeholder="Email"
          className="w-full p-3 rounded bg-white/10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-white/10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Main Button */}
        <button
          onClick={handleAuth}
          disabled={loadingAuth}
          className="w-full bg-brand-purple p-3 rounded"
        >
          {loadingAuth ? 'Processing...' : 'Continue'}
        </button>

        {/* Forgot */}
        <button
          onClick={handleForgotPassword}
          className="text-sm text-gray-400"
        >
          Forgot password?
        </button>

        <div className="text-center text-gray-400">OR</div>

        {/* Google */}
        <button
          onClick={signInWithGoogle}
          className="w-full bg-white text-black p-3 rounded"
        >
          Continue with Google
        </button>

        {/* Messages */}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {info && <p className="text-green-400 text-sm">{info}</p>}
      </div>
    </div>
  )
}