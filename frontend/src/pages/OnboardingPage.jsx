import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function OnboardingPage() {
  const { token, user, setUser } = useAuthStore()

  const [username, setUsername] = useState('')
  const [available, setAvailable] = useState(null)
  const [avatar, setAvatar] = useState(null)

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (username.length >= 3) {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/users/check-username?username=${username}`
        )
        const data = await res.json()
        setAvailable(data.available)
      }
    }, 400)

    return () => clearTimeout(delay)
  }, [username])

  const handleSubmit = async () => {
    let avatar_url = null

    if (avatar) {
      const formData = new FormData()
      formData.append('file', avatar)

      const res = await fetch(`${import.meta.env.VITE_API_URL}/media/avatar`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      avatar_url = data.url
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, avatar_url }),
    })

    const data = await res.json()

    setUser({ ...(user || {}), ...(data.user || {}), is_onboarded: true })
  }

  return (
    <div className="p-6 text-white">
      <h1>Setup Profile</h1>

      <input
        placeholder="Username"
        value={username}
        onChange={(e)=>setUsername(e.target.value)}
      />

      {available === true && <p className="text-green-400">Available</p>}
      {available === false && <p className="text-red-400">Taken</p>}

      <input type="file" onChange={(e)=>setAvatar(e.target.files[0])} />

      <button onClick={handleSubmit}>Finish</button>
    </div>
  )
}