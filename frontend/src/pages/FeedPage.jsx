import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import PostCard from '../components/PostCard'
import PostComposer from '../components/PostComposer'

export default function FeedPage() {
  const { token } = useAuthStore()
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/posts/feed`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()
    setPosts(data)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <PostComposer onPost={(p) => setPosts([p, ...posts])} />

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}