import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import BlockEditor from './BlockEditor.jsx'

const TYPE_LABELS = {
  text: '📝 Texto livre',
  checklist: '✅ Checklist',
  table: '📊 Tabela',
  links: '🔗 Cards de links',
  crm_template: '📋 Templates CRM',
  notepad: '🗒️ Bloco de Notas',
}

export default function AdminBlocks({ section, onBack }) {
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingBlock, setEditingBlock] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    loadBlocks()
  }, [section.id])

  const loadBlocks = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('blocks')
      .select('*')
      .eq('section_id', section.id)
      .order('order_index')
    setBlocks(data || [])
    setLoading(false)
  }

  const openNew = () => {
    setEditingBlock(null)
    setShowEditor(true)
  }

  const openEdit = (block) => {
    setEditingBlock(block)
    setShowEditor(true)
  }

  const handleSave = async (data) => {
    if (editingBlock) {
      const { error } = await supabase.from('blocks').update(data).eq('id', editingBlock.id)
      if (error) { setMsg(`Erro ao salvar: ${error.message}`); return }
      setMsg('Bloco atualizado!')
    } else {
      const { error } = await supabase.from('blocks').insert({
        ...data,
        section_id: section.id,
        order_index: blocks.length + 1,
        visible: true,
      })
      if (error) { setMsg(`Erro ao criar bloco: ${error.message}`); return }
      setMsg('Bloco criado!')
    }
    setTimeout(() => setMsg(''), 4000)
    setShowEditor(false)
    loadBlocks()
  }

  const toggleVisible = async (block) => {
    await supabase.from('blocks').update({ visible: !block.visible }).eq('id', block.id)
    loadBlocks()
  }

  const deleteBlock = async (block) => {
    if (!confirm(`Excluir o bloco "${block.title || block.type}"?`)) return
    await supabase.from('blocks').delete().eq('id', block.id)
    loadBlocks()
  }

  const moveUp = async (block, idx) => {
    if (idx === 0) return
    const prev = blocks[idx - 1]
    await supabase.from('blocks').update({ order_index: prev.order_index }).eq('id', block.id)
    await supabase.from('blocks').update({ order_index: block.order_index }).eq('id', prev.id)
    loadBlocks()
  }

  const moveDown = async (block, idx) => {
    if (idx === blocks.length - 1) return
    const next = blocks[idx + 1]
    await supabase.from('blocks').update({ order_index: next.order_index }).eq('id', block.id)
    await supabase.from('blocks').update({ order_index: block.order_index }).eq('id', next.id)
    loadBlocks()
  }

  if (showEditor) {
    return (
      <BlockEditor
        block={editingBlock}
        sectionTitle={section.title}
        onSave={handleSave}
        onCancel={() => setShowEditor(false)}
      />
    )
  }

  return (
    <>
      <div className="admin-section-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 8 }}>
            ← Voltar às seções
          </button>
          <h1 className="admin-title">{section.emoji} {section.title}</h1>
          <p className="admin-subtitle">Gerencie os blocos de conteúdo desta aba.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href={`/${section.slug === 'inicio' ? '' : section.slug}`}
            target="_blank"
            className="btn btn-secondary"
            rel="noopener noreferrer"
          >
            ↗ Ver aba
          </a>
          <button className="btn btn-primary" onClick={openNew}>+ Novo Bloco</button>
        </div>
      </div>

      {msg && <div className="alert alert-success">✓ {msg}</div>}

      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        💡 Os blocos aparecem na ordem que estão aqui. Use ▲▼ para reordenar. O toggle oculta sem excluir.
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Carregando...</div>
      ) : blocks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">Nenhum bloco ainda.<br />Clique em "Novo Bloco" para começar.</div>
        </div>
      ) : (
        blocks.map((block, idx) => (
          <div key={block.id} className="block-item">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button className="btn btn-ghost btn-xs" onClick={() => moveUp(block, idx)} disabled={idx === 0}>▲</button>
              <button className="btn btn-ghost btn-xs" onClick={() => moveDown(block, idx)} disabled={idx === blocks.length - 1}>▼</button>
            </div>
            <div className="block-item-info" style={{ cursor: 'pointer' }} onClick={() => openEdit(block)}>
              <div className="block-item-title">{block.title || '(sem título)'}</div>
              <div className="block-item-type">{TYPE_LABELS[block.type] || block.type}</div>
            </div>
            <div className="block-item-actions">
              <label className="toggle">
                <input type="checkbox" checked={block.visible} onChange={() => toggleVisible(block)} />
                <span className="toggle-slider" />
              </label>
              <button className="btn btn-secondary btn-sm" onClick={() => openEdit(block)}>✏️ Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteBlock(block)}>🗑</button>
            </div>
          </div>
        ))
      )}
    </>
  )
}
