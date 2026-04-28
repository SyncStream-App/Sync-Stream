import { Outlet, NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function AppShell() {
  const { signOut, toggleTheme, user } = useAuthStore()

  const navItem =
    "block px-3 py-2 rounded-lg transition hover:bg-white/10"

  const activeItem =
    "bg-brand-purple text-white"

  return (
    <div className="min-h-screen flex bg-brand-dark text-white">

      {/* 🔹 Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col justify-between bg-black/40 border-r border-white/10 p-5">

        {/* Top */}
        <div>
          <h1 className="text-2xl font-bold text-brand-purple mb-8">
            SyncStream
          </h1>

          <nav className="space-y-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeItem : ''}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/rooms"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeItem : ''}`
              }
            >
              Rooms
            </NavLink>

            <NavLink
              to="/messages"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeItem : ''}`
              }
            >
              Messages
            </NavLink>

            <NavLink
              to="/search"
              className={({ isActive }) =>
                `${navItem} ${isActive ? activeItem : ''}`
              }
            >
              Search
            </NavLink>

            {user?.username && (
              <NavLink
                to={`/profile/${user.username}`}
                className={({ isActive }) =>
                  `${navItem} ${isActive ? activeItem : ''}`
                }
              >
                Profile
              </NavLink>
            )}
          </nav>
        </div>

        {/* Bottom */}
        <div className="space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full bg-white/10 hover:bg-white/20 p-2 rounded-lg text-sm"
          >
            Toggle Theme
          </button>

          <button
            onClick={signOut}
            className="w-full bg-red-500 hover:bg-red-600 p-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* 🔹 Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>

      {/* 🔻 Bottom Nav (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-black/90 border-t border-white/10 flex justify-around py-2">

        <NavLink to="/" className="text-sm">Home</NavLink>
        <NavLink to="/rooms" className="text-sm">Rooms</NavLink>
        <NavLink to="/messages" className="text-sm">Chat</NavLink>
        <NavLink to="/search" className="text-sm">Search</NavLink>

      </div>
    </div>
  )
}