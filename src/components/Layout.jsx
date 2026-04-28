import { Outlet, Navigate } from 'react-router-dom'
import Nav from './Nav.jsx'

export default function Layout() {
  const userAuth = sessionStorage.getItem('user_auth') === 'true'
  const adminAuth = sessionStorage.getItem('admin_auth') === 'true'
  const gestorAuth = sessionStorage.getItem('gestor_auth') === 'true'

  if (!userAuth && !adminAuth && !gestorAuth) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Nav />
      <main>
        <Outlet />
      </main>
    </>
  )
}
