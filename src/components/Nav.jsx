import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Nav() {
  const [sections, setSections] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('sections')
      .select('id, title, emoji, slug, order_index')
      .eq('visible', true)
      .order('order_index')
      .then(({ data }) => data && setSections(data))
  }, [])

  return (
    <nav className="nav-bar">
      <span className="nav-logo">UNIGRAN</span>
      {sections.map(s => (
        <NavLink
          key={s.id}
          to={s.slug === 'inicio' ? '/' : `/${s.slug}`}
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          end={s.slug === 'inicio'}
        >
          <span className="nav-emoji">{s.emoji}</span>
          <span>{s.title}</span>
        </NavLink>
      ))}
      <button className="nav-admin-btn" onClick={() => navigate('/admin/login')}>
        ⚙ Admin
      </button>
    </nav>
  )
}
