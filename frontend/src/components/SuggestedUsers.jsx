import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function SuggestedUsers() {
  const { token } = useAuthStore()

  const navigate = useNavigate()

  const [users, setUsers] = useState([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleFollow = async (userId) => {
    try {
        setUsers((prev) =>
        prev.filter((u) => u.id !== userId)
        )

        await fetch(
        `${import.meta.env.VITE_API_URL}/users/${userId}/follow`,
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

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/suggested`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await res.json()

      setUsers(data)
    } catch (err) {
      console.error(err)
    }
  }

  if (users.length === 0) return null

  return (
    <div
      className="rounded-3xl p-5 mb-6
      bg-gray-100 dark:bg-white/5
      border border-gray-200 dark:border-white/10"
    >
      <h2 className="font-bold text-xl mb-4">
        Suggested Users
      </h2>

      <div className="space-y-4">

        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between"
          >
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() =>
                navigate(`/profile/${user.username}`)
              }
            >
              <img
                src={
                  user.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user.username}`
                }
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <p className="font-semibold">
                  {user.username}
                </p>

                <p className="text-sm text-gray-500">
                  {user.bio || 'SyncStream user'}
                </p>

                <button
                    onClick={() => handleFollow(user.id)}
                    className="px-4 py-2 rounded-xl
                    bg-brand-purple text-white"
                >
                    Follow
                </button>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}