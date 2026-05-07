import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import CommentsModal from './CommentsModal'
import { toast } from 'sonner'

export default function PostCard({
  post,
  open,
  onClose,
  onCommentAdded,
  onCommentDeleted,
}) {
  const navigate = useNavigate()

  const { token, user } = useAuthStore()

  const [liked, setLiked] = useState(post.is_liked)

  const [likesCount, setLikesCount] = useState(
    post.likes_count || 0
  )

  const [commentsCount, setCommentsCount] =
    useState(post.comments_count || 0)

  const [commentsOpen, setCommentsOpen] =
    useState(false)

  const [deleting, setDeleting] = useState(false)

  const isOwnPost = user?.id === post.user_id

  const handleLike = async () => {
    const previousLiked = liked
    const previousCount = likesCount

    try {
      const nextLiked = !previousLiked

      setLiked(nextLiked)

      setLikesCount((prev) =>
        nextLiked ? prev + 1 : prev - 1
      )

      const method = previousLiked
        ? 'DELETE'
        : 'POST'

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${post.id}/like`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) {
        throw new Error()
      }

    } catch (err) {
      console.error(err)

      setLiked(previousLiked)
      setLikesCount(previousCount)

      toast.error('Failed to update like')
    }
  }

  const handleDelete = async () => {
    const confirmDelete = confirm(
      'Delete this post?'
    )

    if (!confirmDelete) return

    try {
      setDeleting(true)

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${post.id}`,
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

      if (onDelete) {
        onDelete(post.id)
        toast.success('Post deleted')
      }

    } catch (err) {
      console.error(err)
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div
        className="rounded-3xl overflow-hidden mb-6
        bg-gray-100 dark:bg-white/5
        border border-gray-200 dark:border-white/10"
      >

        {/* HEADER */}
        <div className="p-4 flex items-center justify-between">

          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() =>
              navigate(`/profile/${post.user?.username}`)
            }
          >

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

          {/* DELETE */}
          {isOwnPost && (
            <button
              disabled={deleting}
              onClick={handleDelete}
              className="text-red-500 text-sm"
            >
              {deleting ? '...' : 'Delete'}
            </button>
          )}

        </div>

        {/* IMAGE */}
        {post.image_url && (
          <img
            src={post.image_url}
            className="w-full max-h-[600px] object-cover"
          />
        )}

        {/* CONTENT */}
        <div className="p-4">

          <p className="whitespace-pre-wrap">
            {post.content}
          </p>

          {/* ACTIONS */}
          <div className="flex gap-6 mt-5">

            <button
              onClick={handleLike}
              className={`font-medium ${
                liked
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}
            >
              ❤️ {likesCount}
            </button>

            <button
              onClick={() => setCommentsOpen(true)}
              className="text-gray-500 font-medium"
            >
              💬 {commentsCount}
            </button>

          </div>

        </div>

      </div>

      <CommentsModal
        post={post}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        onCommentAdded={() =>
          setCommentsCount((prev) => prev + 1)
        }
        onCommentDeleted={() =>
          setCommentsCount((prev) => prev - 1)
        }
      />
    </>
  )
}