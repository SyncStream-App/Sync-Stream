import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function StoryViewer({
  story,
  onClose,
}) {
  const { token } = useAuthStore()

  useEffect(() => {
    if (!story) return

    markSeen()

    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [story])

  const markSeen = async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/stories/${story.id}/view`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    } catch (err) {
      console.error(err)
    }
  }

  if (!story) return null

  return (
    <div
      className="fixed inset-0 z-[100]
      bg-black flex items-center justify-center"
    >

      <button
        onClick={onClose}
        className="absolute top-5 right-5
        text-white text-3xl"
      >
        ✕
      </button>

      <div
        className="relative w-full max-w-md
        h-[80vh] rounded-3xl overflow-hidden"
        style={{
          background: story.background_color,
        }}
      >

        {/* IMAGE */}
        {story.image_url ? (
          <img
            src={story.image_url}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full
            flex items-center justify-center p-10"
          >

            <p
              className="text-white text-3xl
              font-bold text-center"
            >
              {story.text_content}
            </p>

          </div>
        )}

        {/* USER */}
        <div
          className="absolute top-5 left-5
          flex items-center gap-3"
        >

          <img
            src={
              story.user?.avatar_url ||
              `https://ui-avatars.com/api/?name=${story.user?.username}`
            }
            className="w-12 h-12 rounded-full object-cover"
          />

          <div className="text-white">
            <p className="font-semibold">
              {story.user?.username}
            </p>

            <p className="text-sm opacity-80">
              {story.views_count || 0} views
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}