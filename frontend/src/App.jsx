import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'

// Pages (create these empty components first)
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import HomePage from './pages/HomePage'
import RoomsPage from './pages/RoomsPage'
import MessagesPage from './pages/MessagesPage'
import SearchPage from './pages/SearchPage'
import ProfilePage from './pages/ProfilePage'
import AppShell from './components/AppShell'

function ProtectedRoute({children}){
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to ='/login' replace />
  if (!user.username) return <Navigate to='/onboarding' replace />
  return children
}

export default function App(){
  const{ initAuth, theme } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [])

  //Apply dark/light mode class to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme == 'dark')
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        <Route path ='/login' element={<LoginPage />} />
        <Route path ='/onboarding' element={<OnboardingPage />} />
        <Route path ='/' element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path='rooms' element={<RoomsPage />} />
          <Route path='messages' element={<MessagesPage />} />
          <Route path='search' element={<SearchPage />} />
          <Route path='profile/:username' element={<ProfilePage />} />
        </Route> 
      </Routes>
    </BrowserRouter>
  )
}