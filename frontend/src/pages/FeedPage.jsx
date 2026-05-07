import { useEffect, useRef, useState } from 'react'

import { useAuthStore } from '../stores/authStore'

import StoryBar from '../components/StoryBar'
import PostCard from '../components/PostCard'
import PostComposer from '../components/PostComposer'
import SuggestedUsers from '../components/SuggestedUsers'

export default function FeedPage() {
  const { token } = useAuthStore()

  const [posts, setPosts] = useState([])

  const [page, setPage] = useState(1)

  const [loading, setLoading] = useState(false)

  const [hasMore, setHasMore] = useState(true)

  const observerRef = useRef()

  useEffect(() => {
    fetchFeed(1, true)
  }, [])

  useEffect(() => {
    if (page === 1) return

    fetchFeed(page)
  }, [page])

  const fetchFeed = async (
    pageNumber = 1,
    replace = false
  ) => {
    try {
      setLoading(true)

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/feed?page=${pageNumber}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      if (data.length < 10) {
        setHasMore(false)
      }

      if (replace) {
        setPosts(data)
      } else {
        setPosts((prev) => {
          const existingIds = new Set(
            prev.map((p) => p.id)
          )

          const filtered = data.filter(
            (p) => !existingIds.has(p.id)
          )

          return [...prev, ...filtered]
          })
      }

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const lastPostRef = (node) => {
    if (loading) return

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current =
      new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore
        ) {
          setPage((prev) => prev + 1)
        }
      })

    if (node) {
      observerRef.current.observe(node)
    }
  }

  const handleDeletePost = (postId) => {
    setPosts((prev) =>
      prev.filter((p) => p.id !== postId)
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">

      <StoryBar />

      <SuggestedUsers />

      <PostComposer
        onPost={(newPost) =>
          setPosts((prev) => [
            newPost,
            ...prev,
          ])
        }
      />

      {posts.length === 0 && !loading ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">
            Your feed is empty
          </h2>

          <p className="text-gray-500 mt-2">
            Follow people to see posts
          </p>
        </div>
      ) : (
        posts.map((post, index) => {
          const isLast =
            index === posts.length - 1

          return (
            <div
              key={post.id}
              ref={
                isLast
                  ? lastPostRef
                  : null
              }
            >
              <PostCard
                post={post}
                onDelete={handleDeletePost}
              />
            </div>
          )
        })
      )}

      {loading && (
        <div className="flex justify-center py-6">
          <div
            className="w-10 h-10 rounded-full
            border-2 border-brand-purple
            border-t-transparent animate-spin"
          />
        </div>
      )}

    </div>
  )
}