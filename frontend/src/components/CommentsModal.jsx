import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

export default function CommentsModal({
  post,
  open,
  onClose,
  onCommentAdded,
  onCommentDeleted,
}) {
  const { token, user } = useAuthStore()

  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && post?.id) {
      fetchComments()
    }
  }, [open, post])

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${post.id}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error()
      }

      const data = await res.json()

      setComments(data || [])

    } catch (err) {
      console.error(err)

      toast.error('Failed to load comments')
    }
  }

  const handleComment = async () => {
    if (!content.trim()) return

    try {
      setLoading(true)

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${post.id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
          }),
        }
      )

      if (!res.ok) {
        throw new Error()
      }

      const data = await res.json()

      // optimistic UI update
      setComments((prev) => [...prev, data])

      // update count in PostCard
      onCommentAdded?.()

      setContent('')

      toast.success('Comment added')

    } catch (err) {
      console.error(err)

      toast.error('Failed to comment')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error()
      }

      // optimistic remove
      setComments((prev) =>
        prev.filter((c) => c.id !== commentId)
      )

      // update count in PostCard
      onCommentDeleted?.()

      toast.success('Comment deleted')

    } catch (err) {
      console.error(err)

      toast.error('Delete failed')
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden
        bg-white dark:bg-brand-dark
        border border-gray-200 dark:border-white/10"
      >

        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/10">

          <h2 className="text-2xl font-bold">
            Comments
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ✕
          </button>

        </div>

        {/* POST */}
        <div className="p-5 border-b border-gray-200 dark:border-white/10">

          <div className="flex items-center gap-3 mb-3">

            <img
              src={
                post.user?.avatar_url ||
                `https://ui-avatars.com/api/?name=${post.user?.username}`
              }
              className="w-12 h-12 rounded-full object-cover"
            />

            <div>

              <p className="font-semibold">
                {post.user?.username}
              </p>

              <p className="text-xs text-gray-500">
                {new Date(post.created_at).toLocaleString()}
              </p>

            </div>

          </div>

          <p className="whitespace-pre-wrap">
            {post.content}
          </p>

          {post.image_url && (
            <img
              src={post.image_url}
              className="w-full mt-4 rounded-2xl max-h-[400px] object-cover"
            />
          )}

        </div>

        {/* COMMENTS */}
        <div className="max-h-[400px] overflow-y-auto p-5 space-y-5">

          {comments.length === 0 && (
            <p className="text-gray-500 text-center">
              No comments yet
            </p>
          )}

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3"
            >

              <img
                src={
                  comment.user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${comment.user?.username}`
                }
                className="w-10 h-10 rounded-full object-cover"
              />

              <div className="flex-1">

                <div
                  className="rounded-2xl p-3
                  bg-gray-100 dark:bg-white/5"
                >

                  <div className="flex items-center justify-between">

                    <p className="font-semibold">
                      {comment.user?.username}
                    </p>

                    {comment.user_id === user?.id && (
                      <button
                        onClick={() =>
                          handleDelete(comment.id)
                        }
                        className="text-red-500 text-sm"
                      >
                        Delete
                      </button>
                    )}

                  </div>

                  <p className="mt-1 whitespace-pre-wrap">
                    {comment.content}
                  </p>

                </div>

                <p className="text-xs text-gray-500 mt-1 ml-2">
                  {new Date(comment.created_at).toLocaleString()}
                </p>

              </div>

            </div>
          ))}

        </div>

        {/* INPUT */}
        <div className="p-5 border-t border-gray-200 dark:border-white/10">

          <div className="flex gap-3">

            <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                    handleComment()
                    }
                }}
                placeholder="Write a comment..."
                className="flex-1 p-3 rounded-xl
                bg-gray-100 dark:bg-white/10"
            />

            <button
              disabled={loading}
              onClick={handleComment}
              className="px-5 rounded-xl bg-brand-purple text-white disabled:opacity-50"
            >
              {loading ? '...' : 'Send'}
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}