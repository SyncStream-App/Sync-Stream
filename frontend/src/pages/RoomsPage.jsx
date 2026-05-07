import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'sonner'

export default function RoomPage() {
  const { id } = useParams()
  const { token, user } = useAuthStore()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState(false)
  const [members, setMembers] = useState([])

  useEffect(() => {
    fetchRoom()
    fetchMembers()
  }, [id])

  // ------------------------
  // FETCH ROOM
  // ------------------------
  const fetchRoom = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/rooms/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()
      setRoom(data)

    } catch (err) {
      console.error(err)
      toast.error('Failed to load room')
    } finally {
      setLoading(false)
    }
  }

  // ------------------------
  // FETCH MEMBERS
  // ------------------------
  const fetchMembers = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/rooms/${id}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()
      setMembers(data)

      const isMember = data.some(
        (m) => m.user_id === user.id
      )

      setJoined(isMember)

    } catch (err) {
      console.error(err)
    }
  }

  // ------------------------
  // JOIN ROOM
  // ------------------------
  const handleJoin = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/rooms/${id}/join`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error()

      toast.success('Joined room')
      setJoined(true)
      fetchMembers()

    } catch (err) {
      console.error(err)
      toast.error('Failed to join')
    }
  }

  // ------------------------
  // LEAVE ROOM
  // ------------------------
  const handleLeave = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/rooms/${id}/leave`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!res.ok) throw new Error()

      toast.success('Left room')
      setJoined(false)
      fetchMembers()

    } catch (err) {
      console.error(err)
      toast.error('Failed to leave')
    }
  }

  // ------------------------
  // UI STATES
  // ------------------------
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="text-center py-20">
        Room not found
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* LEFT: ROOM INFO */}
      <div className="lg:col-span-2">

        <div className="rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10">

          <img
            src={room.cover_image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'}
            className="w-full h-64 object-cover"
          />

          <div className="p-6">

            <div className="flex items-start justify-between">

              <div>
                <h1 className="text-4xl font-bold">
                  {room.name}
                </h1>

                <p className="text-gray-500 mt-2">
                  {room.description}
                </p>

                <div className="mt-4 flex gap-3 flex-wrap">

                  <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-500">
                    {room.genre}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-gray-200 dark:bg-white/10">
                    {members.length} members
                  </span>

                </div>
              </div>

              {/* JOIN / LEAVE */}
              {joined ? (
                <button
                  onClick={handleLeave}
                  className="px-5 py-2 rounded-xl bg-red-500 text-white"
                >
                  Leave
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white"
                >
                  Join
                </button>
              )}

            </div>

          </div>

        </div>

        {/* CHAT PLACEHOLDER (NEXT SPRINT) */}
        <div className="mt-6 rounded-3xl p-5 border border-gray-200 dark:border-white/10">
          <h2 className="text-xl font-bold mb-3">
            Room Chat
          </h2>

          <div className="text-gray-500">
            🚧 WebSocket Chat coming in Sprint 3 next step
          </div>
        </div>

      </div>

      {/* RIGHT: MEMBERS */}
      <div className="rounded-3xl p-5 border border-gray-200 dark:border-white/10">

        <h2 className="text-xl font-bold mb-4">
          Members
        </h2>

        <div className="space-y-4">

          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3"
            >
              <img
                src={
                  m.user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${m.user?.username}`
                }
                className="w-10 h-10 rounded-full"
              />

              <div>
                <p className="font-medium">
                  {m.user?.username}
                </p>

                <p className="text-xs text-gray-500">
                  {m.role}
                </p>
              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}