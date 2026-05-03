import { Outlet, NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function AppShell() {
  const { signOut, toggleTheme, user, theme } = useAuthStore()

  const base =
    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"

  const active =
    "bg-brand-purple text-white shadow-lg"

  const inactive =
    "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"

  return (
    <div className="min-h-screen flex flex-col lg:flex-row 
      bg-white text-black 
      dark:bg-brand-dark dark:text-white">

      {/* 🔹 SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-64 flex-col justify-between
        bg-gray-100 dark:bg-black/40
        border-r border-gray-200 dark:border-white/10 p-5">

        {/* TOP */}
        <div>
          <h1 className="text-2xl font-bold text-brand-purple mb-8">
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

            <NavLink to="/feeds"
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }>
              💬 Feed
            </NavLink>

            <NavLink to="/search"
              className={({ isActive }) =>
                `${base} ${isActive ? active : inactive}`
              }>
              🔍 Search
            </NavLink>

            {user?.username ? (
              <NavLink to={`/profile/${user.username}`}
                className={({ isActive }) =>
                  `${base} ${isActive ? active : inactive}`
                }>
                👤 Profile
              </NavLink>
            ) : (
              <NavLink to="/onboarding"
                className={({ isActive }) =>
                  `${base} ${isActive ? active : inactive}`
                }>
                ⚡ Setup Profile
              </NavLink>
            )}
          </nav>
        </div>

        {/* BOTTOM */}
        <div className="space-y-3">

          {/* User */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-200 dark:bg-white/5">
            <img
              src={user?.avatar_url || 'https://via.placeholder.com/40'}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="text-sm">
              <p className="font-medium">
                {user?.username || 'New User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            className="w-full p-2 rounded-lg text-sm
              bg-gray-300 hover:bg-gray-400
              dark:bg-white/10 dark:hover:bg-white/20"
          >
            {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>

          {/* Logout */}
          <button
            onClick={signOut}
            className="w-full p-2 rounded-lg text-sm
              bg-red-500 hover:bg-red-600 text-white"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* 🔹 MAIN */}
      <main className="flex-1 pb-20 lg:pb-0 p-4 md:p-6">
        <Outlet />
      </main>

      {/* 🔻 MOBILE NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0
        bg-white dark:bg-black/90
        border-t border-gray-200 dark:border-white/10
        backdrop-blur-xl">

        <div className="flex justify-around py-2">

          <NavLink to="/" end
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? 'text-brand-purple' : 'text-gray-500 dark:text-gray-400'
              }`
            }>
            🏠
            <span>Home</span>
          </NavLink>

          <NavLink to="/rooms"
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? 'text-brand-purple' : 'text-gray-500 dark:text-gray-400'
              }`
            }>
            🎬
            <span>Rooms</span>
          </NavLink>

          <NavLink to="/messages"
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? 'text-brand-purple' : 'text-gray-500 dark:text-gray-400'
              }`
            }>
            💬
            <span>Chat</span>
          </NavLink>

          <NavLink to="/search"
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? 'text-brand-purple' : 'text-gray-500 dark:text-gray-400'
              }`
            }>
            🔍
            <span>Search</span>
          </NavLink>

          {/* ✅ PROFILE (dynamic) */}
          <NavLink
            to={user?.username ? `/profile/${user.username}` : '/onboarding'}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${
                isActive ? 'text-brand-purple' : 'text-gray-500 dark:text-gray-400'
              }`
            }
          >
            👤
            <span>Profile</span>
          </NavLink>

        </div>

        {/* SECOND ROW */}
        <div className="border-t border-gray-200 dark:border-white/10 py-2 flex justify-around text-xs">

          <button onClick={toggleTheme}>
            {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
          </button>

          <button onClick={signOut} className="text-red-500">
            🚪 Logout
          </button>

        </div>
      </div>
    </div>
  )
}