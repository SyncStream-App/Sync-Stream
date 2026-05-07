import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

export default function StoryComposer({
  open,
  onClose,
  onCreated,
}) {
  const { token } = useAuthStore()

  const [text, setText] = useState('')
  const [image, setImage] = useState(null)

  const [preview, setPreview] = useState(null)

  const [backgroundColor, setBackgroundColor] =
    useState('#7c3aed')

  const [loading, setLoading] = useState(false)

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

  const handleImage = (file) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
        return toast.error('Only image files allowed')
    }

    if (file.size > 10 * 1024 * 1024) {
        return toast.error('Max image size is 10MB')
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
    }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      let image_url = null

      if (image) {
        image_url = await uploadToCloudinary(image)
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/stories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text_content: text,
            image_url,
            background_color: backgroundColor,
          }),
        }
      )

      const data = await res.json()

      onCreated(data)

      onClose()

      setText('')
      setImage(null)
      setPreview(null)

      toast.success('Story created successfully')

    } catch (err) {
      console.error(err)
      toast.error('Failed to create story')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100]
      bg-black/70 flex items-center justify-center p-4"
    >

      <div
        className="w-full max-w-md rounded-3xl p-6
        bg-white dark:bg-brand-dark"
      >

        <h2 className="text-2xl font-bold mb-5">
          Create Story
        </h2>

        <textarea
          rows={4}
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
          placeholder="Write something..."
          className="w-full p-3 rounded-2xl
          bg-gray-100 dark:bg-white/10"
        />

        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleImage(e.target.files[0])
            }
          />
        </div>

        {preview && (
          <img
            src={preview}
            className="mt-4 rounded-2xl max-h-[300px]"
          />
        )}

        <div className="mt-4">

          <p className="mb-2 text-sm">
            Background Color
          </p>

          <input
            type="color"
            value={backgroundColor}
            onChange={(e) =>
              setBackgroundColor(
                e.target.value
              )
            }
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl
            bg-gray-200 dark:bg-white/10"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl
            bg-brand-purple text-white"
          >
            {loading
              ? 'Posting...'
              : 'Post Story'}
          </button>

        </div>

      </div>

    </div>
  )
}