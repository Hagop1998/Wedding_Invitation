import { useEffect, useState } from 'react'
import Hero from './components/Hero'
import Invitation from './components/Invitation'
import Schedule from './components/Schedule'
import RsvpForm from './components/RsvpForm'
import Gift from './components/Gift'
import Footer from './components/Footer'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function useAdminRoute() {
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === '#/admin')

  useEffect(() => {
    function onHashChange() {
      setIsAdmin(window.location.hash === '#/admin')
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return isAdmin
}

function App() {
  const isAdmin = useAdminRoute()

  if (isAdmin) {
    return <AdminDashboard />
  }

  return (
    <main className="site">
      <Hero />
      <Invitation />
      <Schedule />
      <RsvpForm />
      <Gift />
      <Footer />
    </main>
  )
}

export default App
