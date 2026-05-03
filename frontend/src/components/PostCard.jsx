export default function PostCard({ post }) {
  return (
    <div className="border p-4 rounded mb-3">
      <p>{post.content}</p>
      {post.image_url && <img src={post.image_url} />}
      <p className="text-sm text-gray-400">{post.created_at}</p>
    </div>
  )
}