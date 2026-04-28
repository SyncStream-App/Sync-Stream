import { Outlet, Link } from 'react-router-dom'

export default function AppShell() {
  return (
    <div className="flex h-screen text-white">
      <div className="w-64 bg-black p-4">
        <h1 className="text-xl">SyncStream</h1>

        <nav className="space-y-4 mt-6">
          <Link to="/">Home</Link>
          <Link to="/rooms">Rooms</Link>
          <Link to="/messages">Messages</Link>
          <Link to="/search">Search</Link>
        </nav>
      </div>

      <div className="flex-1 p-6 bg-gray-900">
        <Outlet />
      </div>
    </div>
  )
}