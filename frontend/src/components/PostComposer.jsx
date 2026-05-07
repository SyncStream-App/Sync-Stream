import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

export default function PostComposer({ onPost }) {
  const { token, user } = useAuthStore()

  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)

  const [posting, setPosting] = useState(false)

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

  const handlePost = async () => {
    if (!content.trim() && !image) {
      return
    }

    try {
      setPosting(true)

      let image_url = null

      if (image) {
        image_url = await uploadToCloudinary(image)
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            image_url,
          }),
        }
      )

      if (!res.ok) {
        throw new Error()
      }

      const data = await res.json()

      onPost(data)

      setContent('')
      setImage(null)
      setPreview(null)

      toast.success('Post created successfully')

    } catch (err) {
      console.error(err)
      toast.error('Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div
      className="rounded-3xl p-5 mb-6
      bg-gray-100 dark:bg-white/5
      border border-gray-200 dark:border-white/10"
    >

      {/* TOP */}
      <div className="flex gap-4">

        <img
          src={
            user?.avatar_url ||
            `https://ui-avatars.com/api/?name=${user?.username}`
          }
          className="w-12 h-12 rounded-full object-cover"
        />

        <div className="flex-1">

          <textarea
            rows={4}
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
            placeholder="What's happening?"
            className="w-full resize-none bg-transparent
            outline-none text-lg"
          />

          {/* IMAGE PREVIEW */}
          {preview && (
            <div className="relative mt-4">

              <img
                src={preview}
                className="rounded-2xl max-h-[400px] object-cover"
              />

              <button
                onClick={() => {
                  setImage(null)
                  setPreview(null)
                }}
                className="absolute top-3 right-3
                bg-black/60 text-white
                w-8 h-8 rounded-full"
              >
                ✕
              </button>

            </div>
          )}

        </div>

      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-between mt-5">

        <label
          className="cursor-pointer px-4 py-2 rounded-xl
          bg-gray-200 dark:bg-white/10"
        >
          📷 Add Image

          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              handleImage(e.target.files[0])
            }
          />
        </label>

        <button
          disabled={posting}
          onClick={handlePost}
          className="px-6 py-2 rounded-xl
          bg-brand-purple text-white
          disabled:opacity-50"
        >
          {posting ? 'Posting...' : 'Post'}
        </button>

      </div>

    </div>
  )
}