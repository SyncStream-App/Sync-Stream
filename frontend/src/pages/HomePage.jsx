import { useAuthStore } from '../stores/authStore'

export default function HomePage() {
  const { user, signOut } = useAuthStore()

  return (
    <div style={{ padding: 20 }}>
      <h1>Logged In</h1>
      <p>Email: {user?.email}</p>

      <button onClick={signOut}>
        Logout
      </button>
    </div>
  )
}