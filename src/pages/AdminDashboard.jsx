import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import AdminSections from '../components/admin/AdminSections.jsx'
import AdminBlocks from '../components/admin/AdminBlocks.jsx'
import AdminSettings from '../components/admin/AdminSettings.jsx'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [view, setView] = useState('sections') // 'sections' | 'blocks:{sectionId}' | 'settings'
  const [sections, setSections] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth !== 'true') navigate('/admin/login')
  }, [navigate])

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    const { data } = await supabase
      .from('sections')
      .select('*')
      .order('order_index')
    setSections(data || [])
  }

  const handleSelectSection = (section) => {
    setSelectedSection(section)
    setView('blocks')
  }

  const logout = () => {
    sessionStorage.removeItem('admin_auth')
    navigate('/admin/login')
  }

  return (
    <>
      {/* Admin top bar */}
      <div style={{
        height: 56,
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 200
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)', fontSize: 15 }}>
          UNIGRAN
        </span>
        <span style={{ color: 'var(--text-3)', fontSize: 12 }}>/ Admin</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <a href="/" target="_blank" className="btn btn-ghost btn-sm">↗ Ver site</a>
          <button className="btn btn-secondary btn-sm" onClick={logout}>Sair</button>
        </div>
      </div>

      <div className="admin-shell">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-title">Navegação</div>

          <div
            className={'admin-sidebar-item' + (view === 'sections' ? ' active' : '')}
            onClick={() => setView('sections')}
          >
            <span>📑 Abas / Seções</span>
          </div>
          <div
            className={'admin-sidebar-item' + (view === 'settings' ? ' active' : '')}
            onClick={() => setView('settings')}
          >
            <span>⚙️ Configurações</span>
          </div>

          {sections.length > 0 && (
            <>
              <div className="admin-sidebar-title" style={{ marginTop: 24 }}>Conteúdo por Aba</div>
              {sections.map(s => (
                <div
                  key={s.id}
                  className={'admin-sidebar-item' + (view === 'blocks' && selectedSection?.id === s.id ? ' active' : '')}
                  onClick={() => handleSelectSection(s)}
                >
                  <span>{s.emoji} {s.title}</span>
                  {!s.visible && <span className="badge badge-gray">oculta</span>}
                </div>
              ))}
            </>
          )}
        </aside>

        {/* Main area */}
        <main className="admin-main">
          {view === 'sections' && (
            <AdminSections
              sections={sections}
              onRefresh={loadSections}
              onSelectSection={handleSelectSection}
            />
          )}
          {view === 'blocks' && selectedSection && (
            <AdminBlocks
              section={selectedSection}
              onBack={() => setView('sections')}
            />
          )}
          {view === 'settings' && (
            <AdminSettings />
          )}
        </main>
      </div>
    </>
  )
}
