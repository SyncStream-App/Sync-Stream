import { Outlet, NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function AppShell() {
  const { signOut, toggleTheme, user, theme } = useAuthStore()

  const base =
    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200"

  const active =
    "bg-brand-purple text-white shadow-lg"

  const inactive =
    "text-gray-300 hover:bg-white/10 hover:text-white"

  return (
    <div className="min-h-screen flex bg-brand-dark text-white">

      {/* 🔹 SIDEBAR (DESKTOP ONLY) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between 
                        bg-gradient-to-b from-black/40 to-black/20 
                        backdrop-blur-xl border-r border-white/10 p-5">

        {/* 🔝 TOP */}
        <div>
          <h1 className="text-2xl font-bold text-brand-purple mb-8 tracking-wide">
            SyncStream
          </h1>

          <nav className="space-y-2">

            <NavLink to="/" end
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }>
              🏠 Home
            </NavLink>

            <NavLink to="/rooms"
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }>
              🎬 Rooms
            </NavLink>

            <NavLink to="/messages"
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }>
              💬 Messages
            </NavLink>

            <NavLink to="/search"
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }>
              🔍 Search
            </NavLink>

            {user?.username && (
              <NavLink to={`/profile/${user.username}`}
                className={({ isActive }) =>
                  `${base} ${isActive ? active : inactive}`
                }>
                👤 Profile
              </NavLink>
            )}
          </nav>
        </div>

        {/* 🔻 BOTTOM */}
        <div className="space-y-3">

          {/* User Info */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
            <img
              src={user?.avatar_url || 'https://via.placeholder.com/40'}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="text-sm">
              <p className="font-medium">
                {user?.username || 'New User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="w-full bg-white/10 hover:bg-white/20 p-2 rounded-lg text-sm"
          >
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>

          {/* Logout */}
          <button
            onClick={signOut}
            className="w-full bg-red-500/80 hover:bg-red-600 p-2 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* 🔹 MAIN */}
      <main className="flex-1 pb-16 lg:pb-0 p-4 md:p-6">
        <Outlet />
      </main>

      {/* 🔻 MOBILE NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 
                      bg-black/80 backdrop-blur-xl 
                      border-t border-white/10 flex justify-around py-2">

        <NavLink to="/" end
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? 'text-brand-purple' : 'text-gray-400'
            }`
          }>
          🏠
          Home
        </NavLink>

        <NavLink to="/rooms"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? 'text-brand-purple' : 'text-gray-400'
            }`
          }>
          🎬
          Rooms
        </NavLink>

        <NavLink to="/messages"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? 'text-brand-purple' : 'text-gray-400'
            }`
          }>
          💬
          Chat
        </NavLink>

        <NavLink to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? 'text-brand-purple' : 'text-gray-400'
            }`
          }>
          🔍
          Search
        </NavLink>
      </div>
    </div>
  )
}