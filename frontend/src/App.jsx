// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import LoginPage      from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import HomePage       from './pages/HomePage'
import RoomsPage      from './pages/RoomsPage'
import MessagesPage   from './pages/MessagesPage'
import SearchPage     from './pages/SearchPage'
import ProfilePage    from './pages/ProfilePage'
import AppShell       from './components/AppShell'

function ProtectedRoute({ children }) {
  const user    = useAuthStore(s => s.user)
  const loading = useAuthStore(s => s.loading)

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-purple border-t-transparent
                          rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Signing you in...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to='/login' replace />
  if (!user.username) return <Navigate to='/onboarding' replace />
  return children
}

export default function App() {
  const { initAuth, theme } = useAuthStore()

  useEffect(() => { initAuth() }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path='/login'      element={<LoginPage />} />
        <Route path='/onboarding' element={<OnboardingPage />} />
        <Route path='/' element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index                    element={<HomePage />} />
          <Route path='rooms'             element={<RoomsPage />} />
          <Route path='messages'          element={<MessagesPage />} />
          <Route path='search'            element={<SearchPage />} />
          <Route path='profile/:username' element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}