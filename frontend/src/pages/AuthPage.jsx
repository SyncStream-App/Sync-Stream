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
  const [mode, setMode] = useState('login') // 🔥 login | signup
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // 🔹 Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(user.username ? '/' : '/onboarding', { replace: true })
    }
  }, [user, loading])

  // 🔹 Auth Handler
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

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('Invalid email or password')
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please verify your email first')
          } else {
            setError(error.message)
          }
        }
      }

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          if (error.message.includes('already registered')) {
            setError('Account already exists')
          } else {
            setError(error.message)
          }
        } else {
          setInfo('Check your email to verify your account')
        }
      }

    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoadingAuth(false)
    }
  }

  // 🔹 Forgot Password
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

        {/* 🔹 Tabs */}
        <div className="flex rounded-lg overflow-hidden border">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm ${
              mode === 'login'
                ? 'bg-brand-purple text-white'
                : 'bg-transparent'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-sm ${
              mode === 'signup'
                ? 'bg-brand-purple text-white'
                : 'bg-transparent'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* 🔹 Email */}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg
            bg-white border border-gray-300
            dark:bg-white/10 dark:border-white/10"
        />

        {/* 🔹 Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg
            bg-white border border-gray-300
            dark:bg-white/10 dark:border-white/10"
        />

        {/* 🔹 Forgot Password */}
        {mode === 'login' && (
          <div className="text-right">
            <button
              onClick={handleForgotPassword}
              className="text-xs text-brand-purple hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* 🔹 Submit */}
        <button
          onClick={handleAuth}
          disabled={loadingAuth}
          className="w-full bg-brand-purple text-white p-3 rounded-lg hover:opacity-90"
        >
          {loadingAuth
            ? 'Processing...'
            : mode === 'login'
              ? 'Login'
              : 'Create Account'}
        </button>

        {/* 🔹 Divider */}
        <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
          OR
        </div>

        {/* 🔹 Google */}
        <button
          onClick={signInWithGoogle}
          className="w-full bg-white text-black p-3 rounded-lg border hover:bg-gray-50"
        >
          Continue with Google
        </button>

        {/* 🔹 Feedback */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {info && <p className="text-green-500 text-sm">{info}</p>}
      </div>
    </div>
  )
}