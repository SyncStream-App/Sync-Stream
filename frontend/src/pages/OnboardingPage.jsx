import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const { token, user, setUser } = useAuthStore()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [available, setAvailable] = useState(null)

  const [avatar, setAvatar] = useState(null)
  const [preview, setPreview] = useState(null)

  const [loading, setLoading] = useState(false)


  // =========================
  // REDIRECT IF ALREADY ONBOARDED
  // =========================
  useEffect(() => {
    if (user?.username) {
      navigate('/', { replace: true })
    }
  }, [user])

  // =========================
  // USERNAME AVAILABILITY CHECK
  // =========================
  useEffect(() => {
    const delay = setTimeout(async () => {
      const cleanUsername = username.trim().toLowerCase()

      if (cleanUsername.length >= 3) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/users/check-username?username=${cleanUsername}`
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

  // =========================
  // CLOUDINARY UPLOAD
  // =========================
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

    if (!res.ok) {
      throw new Error('Upload failed')
    }

    const data = await res.json()

    return data.secure_url
  }

  // =========================
  // HANDLE AVATAR
  // =========================
  const handleAvatar = (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return toast.error('Only image files allowed')
    }

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Max size is 5MB')
    }

    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async () => {

    const cleanUsername = username.trim().toLowerCase()

    if (!cleanUsername || cleanUsername.length < 3) {
      return toast.error('Username must be at least 3 characters')
    }

    if (!cleanUsername.replace(/_/g, '').match(/^[a-zA-Z0-9]+$/)) {
      return toast.error(
        'Username can only contain letters, numbers, and underscores'
      )
    }

    if (available === false) {
      return toast.error('Username is already taken')
    }

    try {
      setLoading(true)

      let avatar_url = null

      if (avatar) {
        avatar_url = await uploadToCloudinary(avatar)
      }

      const payload = {
        username: cleanUsername,
        bio,
      }

      if (avatar_url) {
        payload.avatar_url = avatar_url
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/me`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to update profile')
      }

      const data = await res.json()

      // IMPORTANT FIX
      setUser({
        ...user,
        ...data.user,
      })

      toast.success('Profile setup completed')

      navigate('/', {
        replace: true,
      })

    } catch (err) {
      console.error(err)

      toast.error(
        err.message || 'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4
      bg-white text-black
      dark:bg-brand-dark dark:text-white"
    >

      <div
        className="w-full max-w-md p-6 rounded-2xl border space-y-5
        bg-gray-100 border-gray-200
        dark:bg-white/5 dark:border-white/10"
      >

        <h1 className="text-3xl font-bold text-center text-brand-purple">
          Complete your profile
        </h1>

        <p className="text-center text-sm text-gray-500">
          Set up your SyncStream identity
        </p>

        {/* AVATAR */}
        <div className="flex flex-col items-center gap-4">

          <div className="relative">

            <img
              src={
                preview ||
                `https://ui-avatars.com/api/?name=${username || 'User'}`
              }
              className="w-24 h-24 rounded-full object-cover border-4 border-brand-purple"
            />

          </div>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleAvatar(e.target.files[0])}
            className="text-sm"
          />

        </div>

        {/* USERNAME */}
        <div>

          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg
              bg-white border border-gray-300
              dark:bg-white/10 dark:border-white/10"
          />

          {available === true && (
            <p className="text-green-500 text-sm mt-2">
              Username available
            </p>
          )}

          {available === false && (
            <p className="text-red-500 text-sm mt-2">
              Username already taken
            </p>
          )}

        </div>

        {/* BIO */}
        <textarea
          placeholder="Bio (optional)"
          value={bio}
          rows={4}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-3 rounded-lg
            bg-white border border-gray-300
            dark:bg-white/10 dark:border-white/10"
        />

        {/* ERROR */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-brand-purple hover:opacity-90 transition text-white p-3 rounded-lg font-semibold"
        >
          {loading ? 'Saving...' : 'Finish Setup'}
        </button>

      </div>
    </div>
  )
}