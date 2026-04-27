import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function OnboardingPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const { token, user, setUser } = useAuthStore()

  const handleSubmit = async () => {
    setError('')
    console.log("TOKEN BEING SENT:", token)
    // ✅ Basic validation
    if (!username.trim()) {
      return setError('Username is required')
    }

    if (username.length < 3) {
      return setError('Username must be at least 3 characters')
    }

    if (!token) {
      return setError('Authentication error. Please login again.')
    }

    try {
      setLoading(true)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to update user')
      }

      const data = await res.json()

      // ✅ Safe state update
      setUser({
        ...(user || {}),
        ...(data.user || {}),
        is_onboarded: true,
      })

      // ✅ Redirect after success
      navigate('/')
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Choose Username</h1>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        style={{
          padding: '0.5rem',
          marginTop: '1rem',
          display: 'block',
        }}
      />

      {error && (
        <p style={{ color: 'red', marginTop: '0.5rem' }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Saving...' : 'Continue'}
      </button>
    </div>
  )
}