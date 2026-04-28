import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export default function SignUpPage() {
  const { signInWithGoogle } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')

  const handleSignup = async () => {
    setMsg('')

    if (password !== confirm) {
      return setMsg('Passwords do not match')
    }

    if (password.length < 8) {
      return setMsg('Password must be at least 8 characters')
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setMsg('An account with this email already exists')
      } else {
        setMsg(error.message)
      }
    } else {
      setMsg('Check your email to verify your account')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">
      <div className="w-full max-w-md space-y-5">

        <h1 className="text-2xl text-center font-bold text-brand-purple">
          Create Account
        </h1>

        {/* Email Signup */}
        <input
          placeholder="Email"
          className="w-full p-3 rounded bg-white/10"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full p-3 rounded bg-white/10"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          placeholder="Confirm Password"
          type="password"
          className="w-full p-3 rounded bg-white/10"
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full bg-brand-purple p-3 rounded"
        >
          Sign Up
        </button>

        <div className="text-center text-gray-400">OR</div>

        {/* Google Signup */}
        <button
          onClick={signInWithGoogle}
          className="w-full bg-white text-black p-3 rounded"
        >
          Continue with Google
        </button>

        {msg && <p className="text-sm text-center text-gray-300">{msg}</p>}
      </div>
    </div>
  )
}