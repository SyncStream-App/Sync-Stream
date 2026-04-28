import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'

export default function OnboardingPage() {
  const { token, user, setUser } = useAuthStore()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [available, setAvailable] = useState(null)

  const [avatar, setAvatar] = useState(null)
  const [preview, setPreview] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 🔍 Username availability check (debounced)
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (username.length >= 3) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/users/check-username?username=${username}`
          )
          const data = await res.json()
          setAvailable(data.available)
        } catch {
          setAvailable(null)
        }
      } else {
        setAvailable(null)
      }
    }, 400)

    return () => clearTimeout(delay)
  }, [username])

  // ☁️ Upload to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append(
      'upload_preset',
      import.meta.env.VITE_CLOUDINARY_AVATAR_PRESET
    )

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const data = await res.json()
    return data.secure_url
  }

  // 📸 File validation + preview
  const handleAvatar = (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return setError('Only image files allowed')
    }

    if (file.size > 5 * 1024 * 1024) {
      return setError('Max size is 5MB')
    }

    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  // ✅ Submit
  const handleSubmit = async () => {
    setError('')

    if (!username || username.length < 3) {
      return setError('Username must be at least 3 characters')
    }

    if (available === false) {
      return setError('Username is already taken')
    }

    try {
      setLoading(true)

      let avatar_url = null

      if (avatar) {
        avatar_url = await uploadToCloudinary(avatar)
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          bio,
          avatar_url,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await res.json()

      setUser({
        ...(user || {}),
        ...(data.user || {}),
        is_onboarded: true,
      })

      navigate('/')
    } catch (err) {
      console.error(err)
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ⏭️ Skip onboarding
  const handleSkip = async () => {
    const defaultUsername = `user_${user?.id?.slice(0, 6)}`

    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: defaultUsername,
      }),
    })

    const data = await res.json()

    setUser({
      ...(user || {}),
      ...(data.user || {}),
      is_onboarded: true,
    })

    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white px-4">
      <div className="w-full max-w-md space-y-5">

        <h1 className="text-2xl font-bold text-center text-brand-purple">
          Complete your profile
        </h1>

        {/* Username */}
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded bg-white/10"
        />

        {available === true && (
          <p className="text-green-400 text-sm">Username available</p>
        )}
        {available === false && (
          <p className="text-red-400 text-sm">Username taken</p>
        )}

        {/* Bio */}
        <textarea
          placeholder="Bio (optional)"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 rounded bg-white/10"
        />

        {/* Avatar */}
        <input
          type="file"
          onChange={(e) => handleAvatar(e.target.files[0])}
        />

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="w-20 h-20 rounded-full"
          />
        )}

        {/* Error */}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Buttons */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-brand-purple p-3 rounded"
        >
          {loading ? 'Saving...' : 'Finish'}
        </button>

        <button
          onClick={handleSkip}
          className="w-full text-gray-400 text-sm"
        >
          Skip for now
        </button>

      </div>
    </div>
  )
}