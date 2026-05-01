import { useAuthStore } from '../stores/authStore'

export default function HomePage() {
  const { user } = useAuthStore()

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold">Welcome 👋</h1>

      <p className="text-gray-400 mt-2">
        {user?.username || user?.email}
      </p>
    </div>
  )
}