import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function PostComposer({ onPost }) {
  const { token } = useAuthStore()
  const [content, setContent] = useState('')

  const handlePost = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    })

    const data = await res.json()
    onPost(data)
    setContent('')
  }

  return (
    <div className="p-4 border rounded mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
      />
      <button onClick={handlePost}>Post</button>
    </div>
  )
}