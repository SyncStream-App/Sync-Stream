import { useNavigate } from 'react-router-dom'
import { Lock, Globe } from 'lucide-react'

export default function RoomCard({
  room,
}) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() =>
        navigate(`/rooms/${room.id}`)
      }
      className="rounded-3xl overflow-hidden cursor-pointer
      bg-gray-100 dark:bg-white/5
      border border-gray-200 dark:border-white/10"
    >

      <img
        src={
          room.cover_image ||
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'
        }
        className="w-full h-48 object-cover"
      />

      <div className="p-5">

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {room.name}
          </h2>

          {room.is_private ? (
            <Lock size={18} />
          ) : (
            <Globe size={18} />
          )}
        </div>

        <p
          className="mt-2 text-sm text-gray-500
          line-clamp-2"
        >
          {room.description}
        </p>

        <div className="mt-4 flex items-center justify-between">

          <span
            className="px-3 py-1 rounded-full text-sm
            bg-brand-purple/20 text-brand-purple"
          >
            {room.genre}
          </span>

          <span className="text-sm text-gray-500">
            {room.members_count || 0} members
          </span>

        </div>

      </div>
    </div>
  )
}