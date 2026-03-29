import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import SectionPage from './pages/SectionPage.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import UserLogin from './pages/UserLogin.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<UserLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<SectionPage slug="inicio" />} />
          <Route path=":slug" element={<SectionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
