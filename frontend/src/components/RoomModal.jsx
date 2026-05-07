import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

export default function CreateRoomModal({
  open,
  onClose,
  onCreated,
}) {
  const { token } = useAuthStore()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    genre: '',
    cover_image: '',
    is_private: false,
  })

  if (!open) return null

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target

    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('Room name required')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/rooms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      )

      if (!res.ok) {
        throw new Error()
      }

      const data = await res.json()

      toast.success('Room created')

      onCreated?.(data)

      onClose()

      setForm({
        name: '',
        description: '',
        genre: '',
        cover_image: '',
        is_private: false,
      })

    } catch (err) {
      console.error(err)
      toast.error('Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50
      bg-black/70 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="w-full max-w-2xl rounded-3xl
        bg-white dark:bg-brand-dark
        border border-gray-200 dark:border-white/10"
      >

        {/* HEADER */}
        <div
          className="flex items-center justify-between
          p-5 border-b border-gray-200 dark:border-white/10"
        >
          <h2 className="text-2xl font-bold">
            Create Room
          </h2>

          <button onClick={onClose}>
            <X size={28} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-5"
        >

          <div>
            <label className="font-medium">
              Room Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Anime Fans"
              className="w-full mt-2 p-3 rounded-2xl
              bg-gray-100 dark:bg-white/10"
            />
          </div>

          <div>
            <label className="font-medium">
              Description
            </label>

            <textarea
              rows={4}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Talk about anime..."
              className="w-full mt-2 p-3 rounded-2xl
              bg-gray-100 dark:bg-white/10"
            />
          </div>

          <div>
            <label className="font-medium">
              Genre
            </label>

            <input
              type="text"
              name="genre"
              value={form.genre}
              onChange={handleChange}
              placeholder="K-pop / Gaming / Movies"
              className="w-full mt-2 p-3 rounded-2xl
              bg-gray-100 dark:bg-white/10"
            />
          </div>

          <div>
            <label className="font-medium">
              Cover Image URL
            </label>

            <input
              type="text"
              name="cover_image"
              value={form.cover_image}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full mt-2 p-3 rounded-2xl
              bg-gray-100 dark:bg-white/10"
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_private"
              checked={form.is_private}
              onChange={handleChange}
            />

            <span>Private Room</span>
          </label>

          <button
            disabled={loading}
            className="w-full py-3 rounded-2xl
            bg-brand-purple text-white font-semibold"
          >
            {loading
              ? 'Creating...'
              : 'Create Room'}
          </button>

        </form>

      </div>
    </div>
  )
}