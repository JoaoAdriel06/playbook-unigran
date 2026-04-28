import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function AdminSections({ sections, onRefresh, onSelectSection }) {
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', emoji: '', slug: '', order_index: 0 })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const openNew = () => {
    setEditing(null)
    setForm({ title: '', emoji: '📄', slug: '', order_index: sections.length + 1, show_sidebar: false, sidebar_position: 'left', sidebar_sticky: false, access: 'all' })
    setShowModal(true)
  }

  const openEdit = (s) => {
    setEditing(s)
    setForm({ title: s.title, emoji: s.emoji, slug: s.slug, order_index: s.order_index, show_sidebar: !!s.show_sidebar, sidebar_position: s.sidebar_position || 'left', sidebar_sticky: !!s.sidebar_sticky, access: s.access || 'all' })
    setShowModal(true)
  }

  const slugify = (text) =>
    text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')

  const handleTitleChange = (val) => {
    setForm(f => ({
      ...f,
      title: val,
      slug: editing ? f.slug : slugify(val)
    }))
  }

  const save = async () => {
    if (!form.title.trim() || !form.slug.trim()) return
    setSaving(true)

    let dbError = null
    if (editing) {
      const { error } = await supabase.from('sections').update({
        title: form.title,
        emoji: form.emoji,
        slug: form.slug,
        order_index: form.order_index,
        show_sidebar: form.show_sidebar,
        sidebar_position: form.sidebar_position,
        sidebar_sticky: form.sidebar_sticky,
        access: form.access || 'all',
      }).eq('id', editing.id)
      dbError = error
    } else {
      const { error } = await supabase.from('sections').insert({ ...form, visible: true })
      dbError = error
    }

    setSaving(false)
    if (dbError) {
      setMsg(`Erro ao salvar: ${dbError.message}`)
      setTimeout(() => setMsg(''), 5000)
      return
    }
    setShowModal(false)
    setMsg(editing ? 'Aba atualizada!' : 'Aba criada!')
    setTimeout(() => setMsg(''), 3000)
    onRefresh()
  }

  const toggleVisible = async (s) => {
    await supabase.from('sections').update({ visible: !s.visible }).eq('id', s.id)
    onRefresh()
  }

  const deleteSection = async (s) => {
    if (!confirm(`Excluir a aba "${s.title}" e todo seu conteúdo? Isso não pode ser desfeito.`)) return
    await supabase.from('sections').delete().eq('id', s.id)
    onRefresh()
  }

  const moveUp = async (s, idx) => {
    if (idx === 0) return
    const prev = sections[idx - 1]
    await supabase.from('sections').update({ order_index: prev.order_index }).eq('id', s.id)
    await supabase.from('sections').update({ order_index: s.order_index }).eq('id', prev.id)
    onRefresh()
  }

  const moveDown = async (s, idx) => {
    if (idx === sections.length - 1) return
    const next = sections[idx + 1]
    await supabase.from('sections').update({ order_index: next.order_index }).eq('id', s.id)
    await supabase.from('sections').update({ order_index: s.order_index }).eq('id', next.id)
    onRefresh()
  }

  return (
    <>
      <div className="admin-section-header">
        <div>
          <h1 className="admin-title">Abas de Navegação</h1>
          <p className="admin-subtitle">Gerencie as abas que aparecem no menu do sistema.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Nova Aba</button>
      </div>

      {msg && <div className={`alert ${msg.startsWith('Erro') ? 'alert-danger' : 'alert-success'}`}>{msg.startsWith('Erro') ? '✗' : '✓'} {msg}</div>}

      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        💡 Clique no nome de uma aba para editar seu conteúdo (blocos de texto, checklists, tabelas etc.)
      </div>

      {sections.map((s, idx) => (
        <div key={s.id} className="section-item">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 4 }}>
            <button className="btn btn-ghost btn-xs" onClick={() => moveUp(s, idx)} disabled={idx === 0}>▲</button>
            <button className="btn btn-ghost btn-xs" onClick={() => moveDown(s, idx)} disabled={idx === sections.length - 1}>▼</button>
          </div>
          <span className="section-item-emoji">{s.emoji}</span>
          <div className="section-item-info" style={{ cursor: 'pointer' }} onClick={() => onSelectSection(s)}>
            <div className="section-item-title">{s.title}</div>
            <div className="section-item-slug">/{s.slug}</div>
          </div>
          <div className="section-item-actions">
            {s.access === 'user'   && <span className="badge badge-gray">👤 Usuário</span>}
            {s.access === 'gestor' && <span className="badge badge-gray">🔑 Gestor</span>}
            {s.show_sidebar && (
              <span className="badge badge-gray" title="Barra lateral ativa">☰ sidebar</span>
            )}
            <label className="toggle" title={s.visible ? 'Ocultar' : 'Mostrar'}>
              <input type="checkbox" checked={s.visible} onChange={() => toggleVisible(s)} />
              <span className="toggle-slider" />
            </label>
            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>✏️</button>
            <button className="btn btn-danger btn-sm" onClick={() => deleteSection(s)}>🗑</button>
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h2 className="modal-title">{editing ? 'Editar Aba' : 'Nova Aba'}</h2>

            <div className="form-group">
              <label className="form-label">Emoji</label>
              <input
                className="form-input"
                value={form.emoji}
                onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                placeholder="🎓"
                style={{ maxWidth: 80 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Título da Aba</label>
              <input
                className="form-input"
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Ex: Formas de Ingresso"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Slug (URL)</label>
              <input
                className="form-input"
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="Ex: formas-de-ingresso"
              />
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 5 }}>
                O site abrirá em /{form.slug || '...'}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Visibilidade</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: 'all',    label: '👥 Todos' },
                  { value: 'user',   label: '👤 Usuário' },
                  { value: 'gestor', label: '🔑 Gestor' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={'btn btn-sm ' + (form.access === opt.value ? 'btn-primary' : 'btn-secondary')}
                    onClick={() => setForm(f => ({ ...f, access: opt.value }))}
                  >{opt.label}</button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 5 }}>
                Define quem pode ver e acessar esta aba.
              </p>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!form.show_sidebar}
                  onChange={e => setForm(f => ({ ...f, show_sidebar: e.target.checked }))}
                  style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
                />
                <span className="form-label" style={{ margin: 0 }}>Barra lateral de navegação</span>
              </label>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                Exibe navegação entre os blocos da página (sem scroll — cada clique mostra um bloco).
              </p>
            </div>

            {form.show_sidebar && (
              <div className="form-group">
                <label className="form-label">Posição da barra de navegação</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { value: 'left', label: '◀ Esquerda' },
                    { value: 'top', label: '▲ Acima' },
                    { value: 'bottom', label: '▼ Abaixo' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={'btn btn-sm ' + (form.sidebar_position === opt.value ? 'btn-primary' : 'btn-secondary')}
                      onClick={() => setForm(f => ({ ...f, sidebar_position: opt.value, sidebar_sticky: false }))}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>
            )}

            {form.show_sidebar && form.sidebar_position === 'top' && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!form.sidebar_sticky}
                    onChange={e => setForm(f => ({ ...f, sidebar_sticky: e.target.checked }))}
                    style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
                  />
                  <span className="form-label" style={{ margin: 0 }}>📌 Fixar barra no topo ao rolar</span>
                </label>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                  A barra de navegação ficará sempre visível enquanto o usuário rola a página.
                </p>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Salvando...' : (editing ? 'Salvar alterações' : 'Criar aba')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
