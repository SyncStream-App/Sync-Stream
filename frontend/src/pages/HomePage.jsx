import { useAuthStore } from '../stores/authStore'

export default function HomePage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome 👋
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {user?.username || user?.email}
        </p>
      </div>

      {/* Card */}
      <div className="p-5 rounded-2xl border
        bg-gray-100 border-gray-200
        dark:bg-white/5 dark:border-white/10">

        <h2 className="text-lg font-semibold mb-2">
          🚀 Get Started
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create or join a room to start watching videos together in real-time.
        </p>
      </div>

    </div>
  )
}