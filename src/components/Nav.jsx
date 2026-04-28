import { useEffect, useState, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Nav() {
  const [sections, setSections] = useState([])
  const [checklistBlocks, setChecklistBlocks] = useState([])
  const [checklistComplete, setChecklistComplete] = useState(true)
  const [showLockedMsg, setShowLockedMsg] = useState(false)
  const navigate = useNavigate()

  const isAdmin = sessionStorage.getItem('admin_auth') === 'true'
  const isGestor = sessionStorage.getItem('gestor_auth') === 'true'
  const needsLock = !isAdmin && !isGestor

  const computeCompletion = useCallback((blocks) => {
    if (!blocks.length) { setChecklistComplete(true); return }
    let total = 0, done = 0
    for (const block of blocks) {
      const items = (block.content?.groups || []).flatMap(g => g.items || [])
      const stored = (() => {
        try { return JSON.parse(localStorage.getItem(`checklist_${block.id}`) || '{}') }
        catch { return {} }
      })()
      total += items.length
      done += items.filter(i => !!stored[i.id]).length
    }
    setChecklistComplete(total === 0 || done >= total)
  }, [])

  useEffect(() => {
    supabase
      .from('sections')
      .select('id, title, emoji, slug, order_index')
      .eq('visible', true)
      .order('order_index')
      .then(({ data }) => {
        if (!data) return
        setSections(data)

        if (!needsLock) return

        const checklistSection = data.find(s => s.slug === 'checklist-diario')
        if (!checklistSection) { setChecklistComplete(true); return }

        supabase
          .from('blocks')
          .select('id, content')
          .eq('section_id', checklistSection.id)
          .eq('type', 'checklist')
          .eq('visible', true)
          .then(({ data: blocks }) => {
            const b = blocks || []
            setChecklistBlocks(b)
            computeCompletion(b)
          })
      })
  }, [])

  useEffect(() => {
    if (!needsLock) return
    const handler = () => computeCompletion(checklistBlocks)
    window.addEventListener('checklist-update', handler)
    return () => window.removeEventListener('checklist-update', handler)
  }, [checklistBlocks, computeCompletion, needsLock])

  const handleLockedClick = () => {
    setShowLockedMsg(true)
    setTimeout(() => setShowLockedMsg(false), 3000)
  }

  return (
    <nav className="nav-bar">
      <span className="nav-logo">UNIGRAN</span>
      {sections.map(s => {
        const isChecklistTab = s.slug === 'checklist-diario'
        const locked = needsLock && !checklistComplete && !isChecklistTab

        if (locked) {
          return (
            <button
              key={s.id}
              type="button"
              className="nav-link nav-link-locked"
              onClick={handleLockedClick}
            >
              <span className="nav-emoji">{s.emoji}</span>
              <span>{s.title}</span>
              <span className="nav-lock-icon">🔒</span>
            </button>
          )
        }

        return (
          <NavLink
            key={s.id}
            to={s.slug === 'inicio' ? '/' : `/${s.slug}`}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            end={s.slug === 'inicio'}
          >
            <span className="nav-emoji">{s.emoji}</span>
            <span>{s.title}</span>
          </NavLink>
        )
      })}

      {showLockedMsg && (
        <div className="nav-lock-toast">
          🔒 Conclua 100% do Checklist Diário para acessar outras abas.
        </div>
      )}

      <button className="nav-admin-btn" onClick={() => navigate('/admin/login')}>
        ⚙ Admin
      </button>
    </nav>
  )
}
