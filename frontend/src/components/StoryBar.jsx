import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import StoryViewer from './StoryViewer'
import StoryComposer from './StoryComposer'

export default function StoryBar() {
  const { token, user } = useAuthStore()

  const [stories, setStories] = useState([])

  const [selectedStory, setSelectedStory] =
    useState(null)

  const [composerOpen, setComposerOpen] =
    useState(false)

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/stories/feed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      setStories(data)

    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div
        className="rounded-3xl p-4 mb-6
        bg-gray-100 dark:bg-white/5
        border border-gray-200 dark:border-white/10"
      >

        <div className="flex gap-4 overflow-x-auto">

          {/* CREATE STORY */}
          <button
            onClick={() =>
              setComposerOpen(true)
            }
            className="flex flex-col items-center min-w-[80px]"
          >

            <div
              className="w-16 h-16 rounded-full
              bg-brand-purple text-white
              flex items-center justify-center
              text-3xl"
            >
              +
            </div>

            <p className="text-sm mt-2">
              Your Story
            </p>

          </button>

          {/* STORIES */}
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() =>
                setSelectedStory(story)
              }
              className="flex flex-col items-center min-w-[80px]"
            >

              <div
                className={`p-[3px] rounded-full ${
                  story.seen
                    ? 'bg-gray-400'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500'
                }`}
              >

                <img
                  src={
                    story.user?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${story.user?.username}`
                  }
                  className="w-16 h-16 rounded-full object-cover border-2 border-white"
                />

              </div>

              <p className="text-sm mt-2 truncate w-[70px]">
                {story.user?.username}
              </p>

            </button>
          ))}

        </div>

      </div>

      <StoryViewer
        story={selectedStory}
        onClose={() =>
          setSelectedStory(null)
        }
      />

      <StoryComposer
        open={composerOpen}
        onClose={() =>
          setComposerOpen(false)
        }
        onCreated={(newStory) =>
          setStories((prev) => [
            newStory,
            ...prev,
          ])
        }
      />
    </>
  )
}