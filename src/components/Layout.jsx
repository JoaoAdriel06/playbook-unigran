import { Outlet, Navigate } from 'react-router-dom'
import Nav from './Nav.jsx'

export default function Layout() {
  const userAuth = sessionStorage.getItem('user_auth') === 'true'
  const adminAuth = sessionStorage.getItem('admin_auth') === 'true'

  if (!userAuth && !adminAuth) {
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
