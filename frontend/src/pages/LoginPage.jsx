import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const { signInWithGoogle, user, loading } = useAuthStore()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      navigate(user.username ? '/' : '/onboarding', { replace: true })
    }
  }, [user, loading])

  const handleEmailLogin = async () => {
    setError('')
    setIsLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('Invalid login')) {
        setError('Invalid email or password')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email before logging in')
      } else {
        setError(error.message)
      }
    }

    setIsLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) return setError('Enter your email first')

    await supabase.auth.resetPasswordForEmail(email)
    setError('Password reset email sent')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">
      <div className="w-full max-w-md space-y-6">

        <h1 className="text-3xl text-center font-bold text-brand-purple">
          SyncStream
        </h1>

        {/* Email Login */}
        <input
          placeholder="Email"
          className="w-full p-3 rounded bg-white/10"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full p-3 rounded bg-white/10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleEmailLogin}
          className="w-full bg-brand-purple p-3 rounded"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

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

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  )
}