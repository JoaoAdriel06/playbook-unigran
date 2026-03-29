import { useState, useRef, useEffect } from 'react'

const BLOCK_TYPES = [
  { value: 'text', label: '📝 Texto livre', desc: 'Parágrafos de texto. Ideal para o Help da equipe, instruções longas, documentos internos.' },
  { value: 'checklist', label: '✅ Checklist', desc: 'Lista de tarefas com progresso. Ideal para rotinas diárias.' },
  { value: 'table', label: '📊 Tabela', desc: 'Tabela com busca e formatação rica. Ideal para tabelas de investimentos, cursos, ramais.' },
  { value: 'links', label: '🔗 Cards de links', desc: 'Grade de cards clicáveis com ícone, título e descrição. Ideal para links externos.' },
  { value: 'crm_template', label: '📋 Templates CRM', desc: 'Templates de texto copiável com 1 clique. Ideal para notas do RD Station.' },
  { value: 'notepad', label: '🗒️ Bloco de Notas', desc: 'Cards de anotações com texto, cor e to-do. Conteúdo gerenciado pelo admin.' },
  { value: 'search', label: '🔍 Bloco de Busca', desc: 'Campo de busca que pesquisa conteúdo de outros blocos da mesma página.' },
]

export default function BlockEditor({ block, sectionTitle, onSave, onCancel }) {
  const [type, setType] = useState(block?.type || 'text')
  const [title, setTitle] = useState(block?.title || '')
  const [content, setContent] = useState(block?.content || getDefaultContent(block?.type || 'text'))
  const [saving, setSaving] = useState(false)
  const [jsonError, setJsonError] = useState('')

  // When type changes, reset content to default for that type
  const handleTypeChange = (newType) => {
    if (block) return // don't reset when editing existing
    setType(newType)
    setContent(getDefaultContent(newType))
  }

  const handleSave = async () => {
    setSaving(true)
    await onSave({ type, title, content })
    setSaving(false)
  }

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginBottom: 8 }}>
            ← Voltar
          </button>
          <h1 className="admin-title">{block ? 'Editar Bloco' : 'Novo Bloco'}</h1>
          <p className="admin-subtitle">Aba: {sectionTitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !!jsonError}>
            {saving ? 'Salvando...' : '✓ Salvar bloco'}
          </button>
        </div>
      </div>

      {/* Type selector */}
      {!block && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Tipo de bloco</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {BLOCK_TYPES.map(bt => (
              <div
                key={bt.value}
                onClick={() => handleTypeChange(bt.value)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--r-lg)',
                  border: `2px solid ${type === bt.value ? 'var(--accent)' : 'var(--border)'}`,
                  background: type === bt.value ? 'var(--accent-glow)' : 'var(--bg-3)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{bt.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 }}>{bt.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="card">
        <div className="form-group">
          <label className="form-label">Título do bloco (aparece no site)</label>
          <input
            className="form-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Tabela de Investimentos 2026"
          />
        </div>
      </div>

      {/* Content editor per type */}
      {type === 'text' && (
        <TextEditor content={content} onChange={setContent} />
      )}
      {type === 'checklist' && (
        <ChecklistEditor content={content} onChange={setContent} />
      )}
      {type === 'table' && (
        <TableEditor content={content} onChange={setContent} />
      )}
      {type === 'links' && (
        <LinksEditor content={content} onChange={setContent} />
      )}
      {type === 'crm_template' && (
        <CrmEditor content={content} onChange={setContent} />
      )}
      {type === 'notepad' && (
        <NotebookEditor content={content} onChange={setContent} />
      )}
      {type === 'search' && (
        <SearchEditor content={content} onChange={setContent} />
      )}
    </div>
  )
}

// ---- TEXT EDITOR (Rich) ----
function TextEditor({ content, onChange }) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content.body || '<p>Digite aqui...</p>'
    }
  }, []) // only on mount — avoids cursor reset on every keystroke

  const exec = (cmd, val = null) => {
    document.execCommand('styleWithCSS', false, true)
    document.execCommand(cmd, false, val)
    editorRef.current.focus()
    onChange({ ...content, body: editorRef.current.innerHTML, isHtml: true })
  }

  const handleInput = () => {
    onChange({ ...content, body: editorRef.current.innerHTML, isHtml: true })
  }

  return (
    <div className="card">
      <div className="card-title">📝 Editor de Texto</div>

      <div className="rich-toolbar">
        <select className="rich-select" onChange={e => { exec('fontName', e.target.value); e.target.value = '' }} defaultValue="">
          <option value="" disabled>Fonte</option>
          <option value="Inter, sans-serif">Inter</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
        </select>

        <select className="rich-select" onChange={e => { exec('fontSize', e.target.value); e.target.value = '' }} defaultValue="">
          <option value="" disabled>Tamanho</option>
          <option value="1">Muito pequeno</option>
          <option value="2">Pequeno</option>
          <option value="3">Normal</option>
          <option value="4">Médio</option>
          <option value="5">Grande</option>
          <option value="6">Muito grande</option>
          <option value="7">Enorme</option>
        </select>

        <span className="rich-divider" />

        <button className="rich-btn rich-bold" title="Negrito (Ctrl+B)" onMouseDown={e => { e.preventDefault(); exec('bold') }}>B</button>
        <button className="rich-btn rich-italic" title="Itálico (Ctrl+I)" onMouseDown={e => { e.preventDefault(); exec('italic') }}>I</button>
        <button className="rich-btn rich-underline" title="Sublinhado (Ctrl+U)" onMouseDown={e => { e.preventDefault(); exec('underline') }}>U</button>

        <span className="rich-divider" />

        <label className="rich-color-btn" title="Cor do texto">
          <span className="rich-color-icon" style={{ borderBottom: '3px solid #e53e3e' }}>A</span>
          <input type="color" defaultValue="#000000" onChange={e => exec('foreColor', e.target.value)} className="rich-color-input" />
        </label>

        <label className="rich-color-btn" title="Marca-texto">
          <span className="rich-color-icon" style={{ background: '#fef08a', padding: '0 2px' }}>ab</span>
          <input type="color" defaultValue="#fef08a" onChange={e => exec('backColor', e.target.value)} className="rich-color-input" />
        </label>

        <span className="rich-divider" />

        <button className="rich-btn" title="Alinhar à esquerda" onMouseDown={e => { e.preventDefault(); exec('justifyLeft') }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="0" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="0" y="13" width="9" height="2"/></svg>
        </button>
        <button className="rich-btn" title="Centralizar" onMouseDown={e => { e.preventDefault(); exec('justifyCenter') }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="2.5" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="2.5" y="13" width="9" height="2"/></svg>
        </button>
        <button className="rich-btn" title="Alinhar à direita" onMouseDown={e => { e.preventDefault(); exec('justifyRight') }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="5" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="5" y="13" width="9" height="2"/></svg>
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="rich-editor"
        onInput={handleInput}
      />
    </div>
  )
}

// ---- CHECKLIST EDITOR ----
function ChecklistEditor({ content, onChange }) {
  const groups = content.groups || []

  const addGroup = () => {
    onChange({
      ...content,
      groups: [...groups, { title: 'Novo grupo', items: [] }]
    })
  }

  const updateGroup = (gi, key, val) => {
    const g = [...groups]
    g[gi] = { ...g[gi], [key]: val }
    onChange({ ...content, groups: g })
  }

  const addItem = (gi) => {
    const g = [...groups]
    g[gi].items = [...(g[gi].items || []), { id: `item_${Date.now()}`, label: '', url: '' }]
    onChange({ ...content, groups: g })
  }

  const updateItem = (gi, ii, key, val) => {
    const g = [...groups]
    g[gi].items[ii] = { ...g[gi].items[ii], [key]: val }
    onChange({ ...content, groups: g })
  }

  const removeItem = (gi, ii) => {
    const g = [...groups]
    g[gi].items.splice(ii, 1)
    onChange({ ...content, groups: g })
  }

  const removeGroup = (gi) => {
    const g = [...groups]
    g.splice(gi, 1)
    onChange({ ...content, groups: g })
  }

  return (
    <div className="card">
      <div className="card-title">✅ Editor de Checklist</div>

      <div className="form-group">
        <label className="form-label">Subtítulo (opcional)</label>
        <input
          className="form-input"
          value={content.subtitle || ''}
          onChange={e => onChange({ ...content, subtitle: e.target.value })}
          placeholder='"Antes de atender alguém, esteja pronto para atender bem."'
        />
      </div>

      {groups.map((group, gi) => (
        <div key={gi} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <input
              className="form-input"
              value={group.title}
              onChange={e => updateGroup(gi, 'title', e.target.value)}
              placeholder="Nome do grupo"
              style={{ flex: 1 }}
            />
            <button className="btn btn-danger btn-sm" onClick={() => removeGroup(gi)}>🗑</button>
          </div>
          <input
            className="form-input"
            value={group.tip || ''}
            onChange={e => updateGroup(gi, 'tip', e.target.value)}
            placeholder="Dica do grupo (opcional)"
            style={{ marginBottom: 10 }}
          />
          {(group.items || []).map((item, ii) => (
            <div key={ii} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '10px 12px', marginBottom: 6 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input
                  className="form-input"
                  value={item.label}
                  onChange={e => updateItem(gi, ii, 'label', e.target.value)}
                  placeholder="Item do checklist"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-ghost btn-sm" onClick={() => removeItem(gi, ii)}>×</button>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>↗ URL</span>
                <input
                  className="form-input"
                  value={item.url || ''}
                  onChange={e => updateItem(gi, ii, 'url', e.target.value)}
                  placeholder="https://... (opcional)"
                  style={{ fontSize: 12 }}
                />
              </div>
            </div>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={() => addItem(gi)} style={{ marginTop: 4 }}>
            + Adicionar item
          </button>
        </div>
      ))}

      <button className="btn btn-secondary" onClick={addGroup}>+ Adicionar grupo</button>

      <div className="form-group" style={{ marginTop: 20 }}>
        <label className="form-label">Frase de fechamento (opcional)</label>
        <input
          className="form-input"
          value={content.closing_tip || ''}
          onChange={e => onChange({ ...content, closing_tip: e.target.value })}
          placeholder='"É justo que muito custe o que muito vale"'
        />
      </div>
    </div>
  )
}

// ---- TABLE CELL (contentEditable) ----
function TableCell({ value, onBlur, style, className }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || ''
  }, []) // set only on mount; parent key changes trigger remount with fresh value

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={() => ref.current && onBlur(ref.current.innerHTML)}
      className={className}
      style={{ outline: 'none', minHeight: 26, cursor: 'text', fontFamily: 'var(--font)', ...style }}
    />
  )
}

// ---- TABLE EDITOR ----
function TableEditor({ content, onChange }) {
  const headers = content.headers || ['Coluna 1', 'Coluna 2']
  const rows = content.rows || []
  const [ver, setVer] = useState(0)

  const set = (updates) => onChange({ ...content, ...updates })
  const bumpVer = () => setVer(v => v + 1)

  const addColumn = () => {
    set({ headers: [...headers, `Coluna ${headers.length + 1}`], rows: rows.map(r => [...r, '']) })
  }

  const removeColumn = (ci) => {
    set({ headers: headers.filter((_, i) => i !== ci), rows: rows.map(r => r.filter((_, i) => i !== ci)) })
    bumpVer()
  }

  const addRow = () => set({ rows: [...rows, Array(headers.length).fill('')] })

  const removeRow = (ri) => {
    set({ rows: rows.filter((_, i) => i !== ri) })
    bumpVer()
  }

  const updateHeader = (ci, val) => {
    const h = [...headers]; h[ci] = val; set({ headers: h })
  }

  const updateCell = (ri, ci, val) => {
    set({ rows: rows.map((row, i) => i === ri ? row.map((c, j) => j === ci ? val : c) : row) })
  }

  const execCmd = (cmd, val = null) => {
    document.execCommand('styleWithCSS', false, true)
    document.execCommand(cmd, false, val)
  }

  return (
    <div className="card">
      <div className="card-title">📊 Editor de Tabela</div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 12 }}>
          <label className="form-label">Subtítulo</label>
          <input
            className="form-input"
            value={content.subtitle || ''}
            onChange={e => set({ subtitle: e.target.value })}
            placeholder="Ex: Valores válidos para 2026"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, paddingBottom: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', paddingBottom: 4 }}>
            <input
              type="checkbox"
              checked={!!content.searchable}
              onChange={e => set({ searchable: e.target.checked })}
              style={{ accentColor: 'var(--accent)' }}
            />
            Buscável
          </label>
        </div>
      </div>

      {/* Rich text toolbar — dark theme */}
      <div className="rich-toolbar rich-toolbar-dark" style={{ borderRadius: 'var(--r) var(--r) 0 0', marginBottom: 0 }}>
        <select className="rich-select rich-select-dark"
          onChange={e => { execCmd('fontName', e.target.value); e.target.value = '' }} defaultValue="">
          <option value="" disabled>Fonte</option>
          <option value="Inter, sans-serif">Inter</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
        </select>

        <select className="rich-select rich-select-dark"
          onChange={e => { execCmd('fontSize', e.target.value); e.target.value = '' }} defaultValue="">
          <option value="" disabled>Tamanho</option>
          <option value="1">XS</option>
          <option value="2">P</option>
          <option value="3">M</option>
          <option value="4">G</option>
          <option value="5">XG</option>
          <option value="6">2X</option>
        </select>

        <span className="rich-divider rich-divider-dark" />

        <button className="rich-btn rich-btn-dark rich-bold" title="Negrito"
          onMouseDown={e => { e.preventDefault(); execCmd('bold') }}>B</button>
        <button className="rich-btn rich-btn-dark rich-italic" title="Itálico"
          onMouseDown={e => { e.preventDefault(); execCmd('italic') }}>I</button>
        <button className="rich-btn rich-btn-dark rich-underline" title="Sublinhado"
          onMouseDown={e => { e.preventDefault(); execCmd('underline') }}>U</button>

        <span className="rich-divider rich-divider-dark" />

        <label className="rich-color-btn rich-color-btn-dark" title="Cor do texto">
          <span className="rich-color-icon" style={{ borderBottom: '3px solid #e53e3e' }}>A</span>
          <input type="color" defaultValue="#ffffff" onChange={e => execCmd('foreColor', e.target.value)} className="rich-color-input" />
        </label>

        <label className="rich-color-btn rich-color-btn-dark" title="Marca-texto">
          <span className="rich-color-icon" style={{ background: '#fef08a', padding: '0 2px', color: '#333' }}>ab</span>
          <input type="color" defaultValue="#fef08a" onChange={e => execCmd('backColor', e.target.value)} className="rich-color-input" />
        </label>

        <span className="rich-divider rich-divider-dark" />

        <button className="rich-btn rich-btn-dark" title="Alinhar à esquerda"
          onMouseDown={e => { e.preventDefault(); execCmd('justifyLeft') }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="0" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="0" y="13" width="9" height="2"/></svg>
        </button>
        <button className="rich-btn rich-btn-dark" title="Centralizar"
          onMouseDown={e => { e.preventDefault(); execCmd('justifyCenter') }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="2.5" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="2.5" y="13" width="9" height="2"/></svg>
        </button>
        <button className="rich-btn rich-btn-dark" title="Alinhar à direita"
          onMouseDown={e => { e.preventDefault(); execCmd('justifyRight') }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="5" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="5" y="13" width="9" height="2"/></svg>
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 var(--r) var(--r)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {headers.map((h, ci) => (
                <th key={`${ver}_h_${ci}`} style={{ padding: 0, background: 'var(--bg-3)', border: '1px solid var(--border)', minWidth: 100 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TableCell
                      value={h}
                      onBlur={val => updateHeader(ci, val)}
                      style={{ flex: 1, fontSize: 12, fontWeight: 700, color: 'var(--text-2)', padding: '6px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}
                    />
                    {headers.length > 1 && (
                      <button onClick={() => removeColumn(ci)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16, padding: '0 8px', lineHeight: 1, flexShrink: 0 }}>×</button>
                    )}
                  </div>
                </th>
              ))}
              <th style={{ padding: 4, background: 'var(--bg-3)', border: '1px solid var(--border)', width: 36, textAlign: 'center' }}>
                <button onClick={addColumn}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>+</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={`${ver}_r_${ri}`}>
                {row.map((cell, ci) => (
                  <td key={`${ver}_${ri}_${ci}`} style={{ border: '1px solid var(--border)', padding: 0, background: 'var(--bg-2)' }}>
                    <TableCell
                      value={cell}
                      onBlur={val => updateCell(ri, ci, val)}
                      style={{ fontSize: 13, color: 'var(--text)', padding: '5px 8px', minWidth: 80 }}
                    />
                  </td>
                ))}
                <td style={{ border: '1px solid var(--border)', padding: 4, width: 36, textAlign: 'center', background: 'var(--bg-2)' }}>
                  <button onClick={() => removeRow(ri)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button className="btn btn-secondary btn-sm" onClick={addRow}>+ Adicionar linha</button>
        <span style={{ fontSize: 12, color: 'var(--text-3)', alignSelf: 'center' }}>{rows.length} linhas · {headers.length} colunas</span>
      </div>
    </div>
  )
}

// ---- LINKS EDITOR ----
function LinksEditor({ content, onChange }) {
  const items = content.items || []

  const add = () => onChange({
    ...content,
    items: [...items, { emoji: '🔗', title: '', description: '', url: '' }]
  })

  const update = (i, key, val) => {
    const arr = items.map((item, idx) => idx === i ? { ...item, [key]: val } : item)
    onChange({ ...content, items: arr })
  }

  const remove = (i) => onChange({ ...content, items: items.filter((_, idx) => idx !== i) })

  return (
    <div className="card">
      <div className="card-title">🔗 Editor de Cards de Links</div>
      {items.map((item, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="form-input"
              value={item.emoji}
              onChange={e => update(i, 'emoji', e.target.value)}
              style={{ width: 60 }}
              placeholder="🔗"
            />
            <input
              className="form-input"
              value={item.title}
              onChange={e => update(i, 'title', e.target.value)}
              placeholder="Título do card"
              style={{ flex: 1 }}
            />
            <button className="btn btn-danger btn-sm" onClick={() => remove(i)}>🗑</button>
          </div>
          <input
            className="form-input"
            value={item.description}
            onChange={e => update(i, 'description', e.target.value)}
            placeholder="Descrição breve"
            style={{ marginBottom: 8 }}
          />
          <input
            className="form-input"
            value={item.url}
            onChange={e => update(i, 'url', e.target.value)}
            placeholder="https://..."
          />
        </div>
      ))}
      <button className="btn btn-secondary" onClick={add}>+ Adicionar card</button>
    </div>
  )
}

// ---- CRM TEMPLATES EDITOR ----
function CrmEditor({ content, onChange }) {
  const templates = content.templates || []

  const add = () => onChange({
    ...content,
    templates: [...templates, { label: '📄 Novo template', text: '' }]
  })

  const update = (i, key, val) => {
    const arr = templates.map((t, idx) => idx === i ? { ...t, [key]: val } : t)
    onChange({ ...content, templates: arr })
  }

  const remove = (i) => onChange({ ...content, templates: templates.filter((_, idx) => idx !== i) })

  return (
    <div className="card">
      <div className="card-title">📋 Editor de Templates CRM</div>
      {templates.map((tpl, i) => (
        <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="form-input"
              value={tpl.label}
              onChange={e => update(i, 'label', e.target.value)}
              placeholder="Ex: 📄 Nota Inicial"
              style={{ flex: 1 }}
            />
            <button className="btn btn-danger btn-sm" onClick={() => remove(i)}>🗑</button>
          </div>
          <textarea
            className="form-textarea"
            value={tpl.text}
            onChange={e => update(i, 'text', e.target.value)}
            placeholder="Texto do template que será copiado com 1 clique..."
            style={{ fontFamily: 'monospace', fontSize: 13 }}
          />
        </div>
      ))}
      <button className="btn btn-secondary" onClick={add}>+ Adicionar template</button>
    </div>
  )
}

// ---- SEARCH EDITOR ----
function SearchEditor({ content, onChange }) {
  const TYPES = [
    { value: 'text', label: '📝 Texto livre' },
    { value: 'checklist', label: '✅ Checklist' },
    { value: 'table', label: '📊 Tabela' },
    { value: 'notepad', label: '🗒️ Bloco de Notas' },
    { value: 'crm_template', label: '📋 Templates CRM' },
  ]
  const searchIn = content.search_in || []

  const toggleType = (type) => {
    const next = searchIn.includes(type)
      ? searchIn.filter(t => t !== type)
      : [...searchIn, type]
    onChange({ ...content, search_in: next })
  }

  return (
    <div className="card">
      <div className="card-title">🔍 Bloco de Busca</div>
      <div className="form-group">
        <label className="form-label">Placeholder da caixa de busca</label>
        <input
          className="form-input"
          value={content.placeholder || ''}
          onChange={e => onChange({ ...content, placeholder: e.target.value })}
          placeholder="Ex: Buscar regra, curso, desconto..."
        />
      </div>
      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!content.sticky}
            onChange={e => onChange({ ...content, sticky: e.target.checked })}
            style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
          />
          <span className="form-label" style={{ margin: 0 }}>📌 Fixar barra de busca no topo ao rolar</span>
        </label>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
          A busca ficará sempre visível enquanto o usuário rola a página.
        </p>
      </div>
      <div className="form-group">
        <label className="form-label">Buscar em (vazio = todos os blocos)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
          {TYPES.map(t => (
            <label key={t.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)' }}>
              <input
                type="checkbox"
                checked={searchIn.includes(t.value)}
                onChange={() => toggleType(t.value)}
                style={{ accentColor: 'var(--accent)', width: 15, height: 15 }}
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- NOTEBOOK COLORS ----
const NOTE_COLORS = [
  { value: 'default', text: null, name: 'Padrão (fundo do site)' },
  { value: '#fef9c3', text: '#713f12', name: 'Amarelo' },
  { value: '#fde68a', text: '#78350f', name: 'Âmbar' },
  { value: '#fed7aa', text: '#7c2d12', name: 'Laranja claro' },
  { value: '#fdba74', text: '#9a3412', name: 'Laranja' },
  { value: '#fca5a5', text: '#7f1d1d', name: 'Vermelho' },
  { value: '#fce7f3', text: '#831843', name: 'Rosa claro' },
  { value: '#fbcfe8', text: '#9d174d', name: 'Rosa' },
  { value: '#dbeafe', text: '#1e3a5f', name: 'Azul claro' },
  { value: '#bfdbfe', text: '#1e40af', name: 'Azul' },
  { value: '#dcfce7', text: '#14532d', name: 'Verde claro' },
  { value: '#bbf7d0', text: '#166534', name: 'Verde' },
  { value: '#f3e8ff', text: '#4a044e', name: 'Roxo claro' },
  { value: '#e9d5ff', text: '#581c87', name: 'Roxo' },
  { value: '#f3f4f6', text: '#111827', name: 'Cinza claro' },
  { value: '#d1d5db', text: '#374151', name: 'Cinza' },
  { value: '#1e293b', text: '#e2e8f0', name: 'Azul noite' },
  { value: '#111827', text: '#f9fafb', name: 'Preto' },
]

const getNoteEditorStyle = (colorValue) => {
  if (!colorValue || colorValue === 'default') {
    return { bg: '#2c2c2c', text: '#ffffff', border: '#495057' }
  }
  const found = NOTE_COLORS.find(c => c.value === colorValue)
  return { bg: colorValue, text: found?.text || '#111', border: colorValue }
}

// ---- NOTE CARD EDITOR (single card with rich text) ----
function NoteCardEditor({ card, onUpdate, onRemove, onAddTodo, onUpdateTodo, onRemoveTodo }) {
  const editorRef = useRef(null)
  const { bg, text, border } = getNoteEditorStyle(card.color)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = card.body || ''
    }
  }, []) // mount only — same pattern as TextEditor

  const exec = (cmd, val = null) => {
    document.execCommand('styleWithCSS', false, true)
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
    if (editorRef.current) onUpdate({ body: editorRef.current.innerHTML, isHtml: true })
  }

  const handleInput = () => {
    if (editorRef.current) onUpdate({ body: editorRef.current.innerHTML, isHtml: true })
  }

  return (
    <div style={{ border: `2px solid ${border}`, borderRadius: 12, overflow: 'hidden', background: bg, display: 'flex', flexDirection: 'column' }}>
      {/* Colored accent bar + color picker + delete */}
      <div style={{ background: bg === '#2c2c2c' ? 'var(--bg-3)' : bg + 'cc', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${border}44` }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
          {NOTE_COLORS.map(c => (
            <button
              key={c.value}
              title={c.name}
              onClick={() => onUpdate({ color: c.value })}
              style={{
                width: c.value === 'default' ? 22 : 18,
                height: 18,
                borderRadius: c.value === 'default' ? 5 : '50%',
                background: c.value === 'default' ? '#2c2c2c' : c.value,
                border: `2px solid ${card.color === c.value ? text : 'transparent'}`,
                cursor: 'pointer', padding: 0, flexShrink: 0,
                fontSize: 9, color: '#fff', fontFamily: 'var(--font)',
                transform: card.color === c.value ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >{c.value === 'default' ? '⌂' : ''}</button>
          ))}
        </div>
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, opacity: 0.5, color: text, lineHeight: 1, padding: '0 4px', flexShrink: 0 }}
          title="Remover card"
        >🗑</button>
      </div>

      <div style={{ padding: '12px 12px 0' }}>
        {/* Title input */}
        <input
          value={card.title}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Título (opcional)"
          style={{
            width: '100%', border: 'none', borderBottom: `1px solid ${text}44`,
            background: 'transparent', fontSize: 14, fontWeight: 700,
            fontFamily: 'var(--font)', color: text, padding: '0 0 8px',
            outline: 'none', marginBottom: 10,
          }}
        />
      </div>

      {/* Rich text toolbar */}
      <div className="rich-toolbar" style={{ margin: '0 12px', borderRadius: 'var(--r) var(--r) 0 0', marginBottom: 0 }}>
        <button className="rich-btn rich-bold" title="Negrito" onMouseDown={e => { e.preventDefault(); exec('bold') }}>B</button>
        <button className="rich-btn rich-italic" title="Itálico" onMouseDown={e => { e.preventDefault(); exec('italic') }}>I</button>
        <button className="rich-btn rich-underline" title="Sublinhado" onMouseDown={e => { e.preventDefault(); exec('underline') }}>U</button>
        <span className="rich-divider" />
        <label className="rich-color-btn" title="Cor do texto">
          <span className="rich-color-icon" style={{ borderBottom: '3px solid #e53e3e' }}>A</span>
          <input type="color" defaultValue="#000000" onChange={e => exec('foreColor', e.target.value)} className="rich-color-input" />
        </label>
        <label className="rich-color-btn" title="Marca-texto">
          <span className="rich-color-icon" style={{ background: '#fef08a', padding: '0 2px' }}>ab</span>
          <input type="color" defaultValue="#fef08a" onChange={e => exec('backColor', e.target.value)} className="rich-color-input" />
        </label>
        <span className="rich-divider" />
        <button className="rich-btn" title="Alinhar à esquerda" onMouseDown={e => { e.preventDefault(); exec('justifyLeft') }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="0" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="0" y="13" width="9" height="2"/></svg>
        </button>
        <button className="rich-btn" title="Centralizar" onMouseDown={e => { e.preventDefault(); exec('justifyCenter') }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="2.5" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="2.5" y="13" width="9" height="2"/></svg>
        </button>
        <button className="rich-btn" title="Alinhar à direita" onMouseDown={e => { e.preventDefault(); exec('justifyRight') }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="5" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="5" y="13" width="9" height="2"/></svg>
        </button>
      </div>

      {/* Rich text area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="rich-editor"
        style={{ minHeight: 80, background: bg === '#2c2c2c' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.35)', borderRadius: '0 0 var(--r) var(--r)', fontSize: 14, color: text, margin: '0 12px 12px' }}
        onInput={handleInput}
      />

      {/* Todos */}
      {(card.todos || []).length > 0 && (
        <div style={{ padding: '0 12px', marginBottom: 8 }}>
          <div style={{ height: 0, borderTop: `1px dashed ${text}33`, marginBottom: 10 }} />
          {card.todos.map(todo => (
            <div key={todo.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: text, opacity: 0.5, flexShrink: 0 }}>☐</span>
              <input
                value={todo.text}
                onChange={e => onUpdateTodo(todo.id, e.target.value)}
                placeholder="Texto do item..."
                style={{
                  flex: 1, border: 'none', borderBottom: `1px solid ${text}33`,
                  background: 'transparent', fontSize: 13, color: text,
                  fontFamily: 'var(--font)', outline: 'none', padding: '2px 0',
                }}
              />
              <button
                onClick={() => onRemoveTodo(todo.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, opacity: 0.4, color: text, padding: 0, lineHeight: 1, flexShrink: 0 }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '0 12px 12px' }}>
        <button
          onClick={onAddTodo}
          style={{
            background: 'none', border: `1px dashed ${text}44`, borderRadius: 6,
            padding: '4px 12px', fontSize: 12, cursor: 'pointer', opacity: 0.65,
            fontFamily: 'var(--font)', color: text,
          }}
        >+ to-do</button>
      </div>
    </div>
  )
}

// ---- NOTEBOOK EDITOR (admin) ----
function NotebookEditor({ content, onChange }) {
  const cards = content.cards || []
  const layout = content.layout || 'grid'

  const addCard = () => onChange({
    ...content,
    cards: [...cards, { id: `c_${Date.now()}`, title: '', color: 'default', body: '', isHtml: true, todos: [] }]
  })

  const updateCard = (id, patch) => onChange({
    ...content,
    cards: cards.map(c => c.id === id ? { ...c, ...patch } : c)
  })

  const removeCard = (id) => onChange({
    ...content,
    cards: cards.filter(c => c.id !== id)
  })

  const addTodo = (cardId) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return
    updateCard(cardId, { todos: [...(card.todos || []), { id: `t_${Date.now()}`, text: '' }] })
  }

  const updateTodo = (cardId, todoId, text) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return
    updateCard(cardId, { todos: card.todos.map(t => t.id === todoId ? { ...t, text } : t) })
  }

  const removeTodo = (cardId, todoId) => {
    const card = cards.find(c => c.id === cardId)
    if (!card) return
    updateCard(cardId, { todos: card.todos.filter(t => t.id !== todoId) })
  }

  return (
    <div className="card">
      <div className="card-title">🗒️ Editor de Bloco de Notas</div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="form-group" style={{ flex: 1, minWidth: 220, marginBottom: 0 }}>
          <label className="form-label">Mensagem de instruções (opcional)</label>
          <input
            className="form-input"
            value={content.instructions || ''}
            onChange={e => onChange({ ...content, instructions: e.target.value })}
            placeholder="Ex: Anotações da equipe"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label className="form-label">Layout dos cards</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className={'btn btn-sm ' + (layout !== 'stack' ? 'btn-primary' : 'btn-secondary')}
              onClick={() => onChange({ ...content, layout: 'grid' })}
              title="Cards lado a lado (máx. 3 por linha)"
            >◫ Grade</button>
            <button
              type="button"
              className={'btn btn-sm ' + (layout === 'stack' ? 'btn-primary' : 'btn-secondary')}
              onClick={() => onChange({ ...content, layout: 'stack' })}
              title="Um card abaixo do outro"
            >☰ Coluna</button>
          </div>
        </div>
      </div>

      {cards.length > 0 && (
        <div style={{
          display: layout === 'stack' ? 'flex' : 'grid',
          flexDirection: layout === 'stack' ? 'column' : undefined,
          gridTemplateColumns: layout !== 'stack' ? 'repeat(auto-fill, minmax(320px, 1fr))' : undefined,
          gap: 16, marginBottom: 16
        }}>
          {cards.map(card => (
            <NoteCardEditor
              key={card.id}
              card={card}
              onUpdate={patch => updateCard(card.id, patch)}
              onRemove={() => removeCard(card.id)}
              onAddTodo={() => addTodo(card.id)}
              onUpdateTodo={(todoId, text) => updateTodo(card.id, todoId, text)}
              onRemoveTodo={todoId => removeTodo(card.id, todoId)}
            />
          ))}
        </div>
      )}

      <button className="btn btn-secondary" onClick={addCard}>+ Adicionar card</button>
    </div>
  )
}

// ---- DEFAULTS ----
function getDefaultContent(type) {
  switch (type) {
    case 'text': return { body: '', isHtml: true }
    case 'checklist': return { subtitle: '', groups: [{ title: 'Grupo 1', items: [] }], closing_tip: '' }
    case 'table': return { subtitle: '', searchable: true, headers: ['Coluna 1', 'Coluna 2', 'Coluna 3'], rows: [['', '', '']] }
    case 'links': return { items: [] }
    case 'crm_template': return { templates: [] }
    case 'notepad': return { instructions: '', cards: [], layout: 'grid' }
    case 'search': return { placeholder: '', search_in: [] }
    default: return {}
  }
}
