import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function OnboardingPage() {
  const [username, setUsername] = useState('')
  const { token, user, setUser } = useAuthStore()

  const handleSubmit = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    })

    const data = await res.json()

    setUser({
      ...user,
      ...data.user,
      is_onboarded: true,
    })
  }

  return (
    <div>
      <h1>Choose Username</h1>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleSubmit}>Continue</button>
    </div>
  )
}