import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function ProfilePage() {
  const { username } = useParams()
  const { token, user, setUser } = useAuthStore()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ username: '', bio: '' })

  const [available, setAvailable] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [preview, setPreview] = useState(null)

  const isOwnProfile = user?.username === username

  // 🔹 Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (!res.ok) throw new Error()

        const data = await res.json()

        setProfile(data.user)
        setForm({
          username: data.user.username || '',
          bio: data.user.bio || '',
        })

      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (username) fetchProfile()
  }, [username])

  // 🔹 Username availability
  useEffect(() => {
    if (!isEditing) return

    const delay = setTimeout(async () => {
      if (form.username.length >= 3) {
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/users/check-username?username=${form.username}`
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
  }, [form.username, isEditing])

  // 🔹 ESC close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsEditing(false)
    }

    if (isEditing) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isEditing])

  // 🔹 Upload
  const uploadToCloudinary = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append(
      'upload_preset',
      import.meta.env.VITE_CLOUDINARY_AVATAR_PRESET
    )

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )

    const data = await res.json()
    return data.secure_url
  }

  // 🔹 Avatar handler
  const handleAvatar = (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return alert('Only image allowed')
    }

    if (file.size > 5 * 1024 * 1024) {
      return alert('Max 5MB')
    }

    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  // 🔹 Update
  const handleUpdate = async () => {
    if (available === false) {
      return alert('Username already taken')
    }

    try {
      let avatar_url = profile.avatar_url

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
          username: form.username,
          bio: form.bio,
          avatar_url,
        }),
      })

      if (!res.ok) throw new Error()

      const data = await res.json()

      setProfile(data.user)
      setUser(data.user)

      setIsEditing(false)
      setAvatar(null)
      setPreview(null)

    } catch {
      alert('Update failed')
    }
  }

  // 🔹 Loading
  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return <p className="text-center text-red-400 mt-10">User not found</p>
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* PROFILE */}
      <div className="p-6 rounded-2xl
        bg-gray-100 dark:bg-white/5
        border border-gray-200 dark:border-white/10">

        <div className="flex justify-between items-center">

          <div className="flex gap-5 items-center">
            <img
              src={profile.avatar_url || 'https://via.placeholder.com/100'}
              className="w-24 h-24 rounded-full object-cover"
            />

            <div>
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile.email}
              </p>
              <p className="mt-2">{profile.bio || 'No bio'}</p>
            </div>
          </div>

          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-brand-purple text-white rounded-lg"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* MODAL */}
      {isEditing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="bg-white dark:bg-black p-6 rounded-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >

            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

            <input
              type="file"
              onChange={(e) => handleAvatar(e.target.files[0])}
              className="mb-3"
            />

            {(preview || profile.avatar_url) && (
              <img
                src={preview || profile.avatar_url}
                className="w-20 h-20 rounded-full mb-3"
              />
            )}

            <input
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              className="w-full p-2 mb-2 rounded bg-gray-200 dark:bg-white/10"
            />

            {available === true && (
              <p className="text-green-400 text-sm">Available</p>
            )}
            {available === false && (
              <p className="text-red-400 text-sm">Taken</p>
            )}

            <textarea
              value={form.bio}
              onChange={(e) =>
                setForm({ ...form, bio: e.target.value })
              }
              className="w-full p-2 mb-4 rounded bg-gray-200 dark:bg-white/10"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)}>
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="bg-brand-purple text-white px-3 py-2 rounded"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}