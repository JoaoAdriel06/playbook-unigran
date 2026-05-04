import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { TextBlock, sanitizeHtml } from '../blocks/BlockRenderer'

const BLOCK_TYPES = [
  { value: 'text', label: '📝 Texto livre', desc: 'Parágrafos de texto. Ideal para o Help da equipe, instruções longas, documentos internos.' },
  { value: 'checklist', label: '✅ Checklist', desc: 'Lista de tarefas com progresso. Ideal para rotinas diárias.' },
  { value: 'table', label: '📊 Tabela', desc: 'Tabela com busca e formatação rica. Ideal para tabelas de investimentos, cursos, ramais.' },
  { value: 'links', label: '🔗 Cards de links', desc: 'Grade de cards clicáveis com ícone, título e descrição. Ideal para links externos.' },
  { value: 'crm_template', label: '📋 Templates CRM', desc: 'Templates de texto copiável com 1 clique. Ideal para notas do RD Station.' },
  { value: 'notepad', label: '🗒️ Bloco de Notas', desc: 'Cards de anotações com texto, cor e to-do. Conteúdo gerenciado pelo admin.' },
  { value: 'search', label: '🔍 Bloco de Busca', desc: 'Campo de busca que pesquisa conteúdo de outros blocos da mesma página.' },
  { value: 'flow', label: '🗺️ Playbook de Fluxo', desc: 'Etapas interativas com scripts, regras e dicas. Ideal para processos de atendimento.' },
]

export default function BlockEditor({ block, sectionTitle, onSave, onCancel }) {
  const [type, setType] = useState(block?.type || 'text')
  const [title, setTitle] = useState(block?.title || '')
  const [content, setContent] = useState(block?.content || getDefaultContent(block?.type || 'text'))
  const [saving, setSaving] = useState(false)
  const [jsonError, setJsonError] = useState('')
  const textEditorRef = useRef(null)

  const handleTypeChange = (newType) => {
    if (block) return
    setType(newType)
    setContent(getDefaultContent(newType))
  }

  const handleSave = async () => {
    setSaving(true)
    let finalContent = content
    if (type === 'text' && textEditorRef.current) {
      finalContent = textEditorRef.current.getContent()
    }
    await onSave({ type, title, content: finalContent })
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
        <TextEditor ref={textEditorRef} content={content} onChange={setContent} />
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
      {type === 'flow' && (
        <FlowEditor content={content} onChange={setContent} />
      )}
    </div>
  )
}

// ---- TEXT EDITOR (Rich) ----
const TextEditor = forwardRef(function TextEditor({ content, onChange }, ref) {
  const [mode, setMode] = useState('edit')
  const editorRef = useRef(null)

  useImperativeHandle(ref, () => ({
    getContent: () => {
      if (!editorRef.current) return { ...content, isHtml: true }
      const body = sanitizeHtml(editorRef.current.innerHTML)
      return { ...content, body, isHtml: true }
    }
  }), [content])

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content.body || ''
    }
  }, []) // only on mount

  const exec = (cmd, val = null) => {
    document.execCommand('styleWithCSS', false, false)
    document.execCommand(cmd, false, val)
    if (editorRef.current) {
      editorRef.current.focus()
      onChange({ ...content, body: editorRef.current.innerHTML, isHtml: true })
    }
  }

  const handleInput = () => {
    if (editorRef.current) onChange({ ...content, body: editorRef.current.innerHTML, isHtml: true })
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const html = e.clipboardData.getData('text/html')
    const plain = e.clipboardData.getData('text/plain')
    const sanitized = html
      ? sanitizeHtml(html)
      : plain.split('\n').filter(Boolean).map(l => `<p>${l}</p>`).join('')
    document.execCommand('insertHTML', false, sanitized)
    if (editorRef.current) onChange({ ...content, body: editorRef.current.innerHTML, isHtml: true })
  }

  const handleBlur = () => {
    if (!editorRef.current) return
    const clean = sanitizeHtml(editorRef.current.innerHTML)
    if (clean !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = clean
      onChange({ ...content, body: clean, isHtml: true })
    }
  }

  const insertHr = (e) => {
    e.preventDefault()
    document.execCommand('insertHTML', false, '<hr>')
    if (editorRef.current) onChange({ ...content, body: editorRef.current.innerHTML, isHtml: true })
  }

  const insertHighlight = (color) => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    const fragment = range.extractContents()
    const span = document.createElement('span')
    span.className = `hl-${color}`
    span.appendChild(fragment)
    range.insertNode(span)
    sel.removeAllRanges()
    if (editorRef.current) {
      editorRef.current.focus()
      onChange({ ...content, body: editorRef.current.innerHTML, isHtml: true })
    }
  }

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', alignItems: 'center' }}>
        <span>📝 Editor de Texto</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button
            className={'btn btn-sm ' + (mode === 'edit' ? 'btn-primary' : 'btn-secondary')}
            onClick={() => setMode('edit')}
          >✏️ Editar</button>
          <button
            className={'btn btn-sm ' + (mode === 'preview' ? 'btn-primary' : 'btn-secondary')}
            onClick={() => setMode('preview')}
          >👁 Preview</button>
        </div>
      </div>

      {/* Meta fields */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label">Categoria</label>
          <input
            className="form-input"
            value={content.category || ''}
            onChange={e => onChange({ ...content, category: e.target.value })}
            placeholder="Ex: Vendas, Produto, Processos..."
          />
        </div>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label className="form-label">Atualizado em</label>
          <input
            className="form-input"
            type="date"
            value={content.updatedAt || ''}
            onChange={e => onChange({ ...content, updatedAt: e.target.value })}
          />
        </div>
      </div>

      {/* Editor (kept mounted, hidden in preview mode) */}
      <div style={{ display: mode === 'edit' ? '' : 'none' }}>
        <div className="rich-toolbar rich-toolbar-dark" style={{ borderRadius: 'var(--r) var(--r) 0 0', marginBottom: 0 }}>
          <select
            className="rich-select rich-select-dark"
            onChange={e => { exec('formatBlock', e.target.value); e.target.value = '' }}
            defaultValue=""
          >
            <option value="" disabled>Estilo</option>
            <option value="p">Parágrafo</option>
            <option value="h1">Título (h1)</option>
            <option value="h2">Seção (h2) — novo card</option>
            <option value="h3">Subtópico (h3)</option>
          </select>
          <span className="rich-divider rich-divider-dark" />
          <button className="rich-btn rich-btn-dark rich-bold" title="Negrito" onMouseDown={e => { e.preventDefault(); exec('bold') }}>B</button>
          <button className="rich-btn rich-btn-dark rich-italic" title="Itálico" onMouseDown={e => { e.preventDefault(); exec('italic') }}>I</button>
          <span className="rich-divider rich-divider-dark" />
          <button
            className="rich-btn rich-btn-dark"
            title="Inserir divisor de seção — gera novo card"
            onMouseDown={insertHr}
            style={{ fontSize: 11, letterSpacing: '0.04em', fontWeight: 600 }}
          >― HR</button>
          <span className="rich-divider rich-divider-dark" />
          <button
            className="rich-btn rich-btn-dark"
            title="Grifo Amarelo"
            onMouseDown={e => { e.preventDefault(); insertHighlight('yellow') }}
          ><span className="hl-yellow" style={{ fontSize: 11, pointerEvents: 'none' }}>A</span></button>
          <button
            className="rich-btn rich-btn-dark"
            title="Grifo Azul"
            onMouseDown={e => { e.preventDefault(); insertHighlight('blue') }}
          ><span className="hl-blue" style={{ fontSize: 11, pointerEvents: 'none' }}>A</span></button>
          <button
            className="rich-btn rich-btn-dark"
            title="Grifo Verde"
            onMouseDown={e => { e.preventDefault(); insertHighlight('green') }}
          ><span className="hl-green" style={{ fontSize: 11, pointerEvents: 'none' }}>A</span></button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="rich-editor rich-editor-dark rich-editor-doc"
          onInput={handleInput}
          onPaste={handlePaste}
          onBlur={handleBlur}
        />
      </div>

      {/* Preview: same component as front */}
      {mode === 'preview' && (
        <div style={{ padding: '4px 0' }}>
          <TextBlock content={content} />
        </div>
      )}
    </div>
  )
})

// ---- CHECKLIST EDITOR ----
function ChecklistEditor({ content, onChange }) {
  const [activeView, setActiveView] = useState('user')

  const groupsKey = activeView === 'user' ? 'groups' : 'gestor_groups'
  const groups = content[groupsKey] || []

  const setGroups = (newGroups) => onChange({ ...content, [groupsKey]: newGroups })

  const addGroup = () => setGroups([...groups, { title: 'Novo grupo', items: [] }])

  const updateGroup = (gi, key, val) => {
    const g = [...groups]
    g[gi] = { ...g[gi], [key]: val }
    setGroups(g)
  }

  const addItem = (gi) => {
    const g = [...groups]
    g[gi].items = [...(g[gi].items || []), { id: `item_${Date.now()}`, label: '', url: '' }]
    setGroups(g)
  }

  const updateItem = (gi, ii, key, val) => {
    const g = [...groups]
    g[gi].items[ii] = { ...g[gi].items[ii], [key]: val }
    setGroups(g)
  }

  const removeItem = (gi, ii) => {
    const g = [...groups]
    g[gi].items.splice(ii, 1)
    setGroups(g)
  }

  const removeGroup = (gi) => {
    const g = [...groups]
    g.splice(gi, 1)
    setGroups(g)
  }

  return (
    <div className="card">
      <div className="card-title">✅ Editor de Checklist</div>

      {/* View switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <button
          type="button"
          className={'btn btn-sm ' + (activeView === 'user' ? 'btn-primary' : 'btn-secondary')}
          onClick={() => setActiveView('user')}
        >
          👤 Visualização Usuário
        </button>
        <button
          type="button"
          className={'btn btn-sm ' + (activeView === 'gestor' ? 'btn-primary' : 'btn-secondary')}
          onClick={() => setActiveView('gestor')}
        >
          🔑 Visualização Gestor
        </button>
        {activeView === 'gestor' && groups.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-3)', alignSelf: 'center', marginLeft: 4 }}>
            Vazio = gestor verá a mesma lista do usuário
          </span>
        )}
      </div>

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
const COL_TYPE_OPTIONS = [
  { value: 'text',       label: 'Texto' },
  { value: 'currency',   label: 'Moeda' },
  { value: 'percentage', label: 'Percentual' },
  { value: 'status',     label: 'Status' },
  { value: 'note',       label: 'Observação' },
]

const CURRENCY_KEYWORDS = ['investimento', 'mensalidade', 'valor', 'preço', 'preco', 'pontualidade', 'dp']

function detectColTypes(hdrs) {
  return hdrs.map(h => {
    const lower = String(h).toLowerCase()
    return CURRENCY_KEYWORDS.some(k => lower.includes(k)) ? 'currency' : 'text'
  })
}

function TableEditor({ content, onChange }) {
  const headers = content.headers || ['Coluna 1', 'Coluna 2']
  const rows = content.rows || []
  const columnTypes = content.column_types || headers.map(() => 'text')
  const [ver, setVer] = useState(0)
  const [importMsg, setImportMsg] = useState(null)
  const [pendingSheets, setPendingSheets] = useState(null)
  const fileRef = useRef(null)

  const set = (updates) => onChange({ ...content, ...updates })
  const bumpVer = () => setVer(v => v + 1)

  const addColumn = () => {
    set({
      headers: [...headers, `Coluna ${headers.length + 1}`],
      rows: rows.map(r => [...r, '']),
      column_types: [...columnTypes, 'text'],
    })
  }

  const removeColumn = (ci) => {
    set({
      headers: headers.filter((_, i) => i !== ci),
      rows: rows.map(r => r.filter((_, i) => i !== ci)),
      column_types: columnTypes.filter((_, i) => i !== ci),
    })
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

  const updateColumnType = (ci, val) => {
    const types = [...columnTypes]; types[ci] = val; set({ column_types: types })
  }

  const updateCell = (ri, ci, val) => {
    set({ rows: rows.map((row, i) => i === ri ? row.map((c, j) => j === ci ? val : c) : row) })
  }

  const execCmd = (cmd, val = null) => {
    document.execCommand('styleWithCSS', false, false)
    document.execCommand(cmd, false, val)
  }

  const insertHighlight = (color) => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    const fragment = range.extractContents()
    const span = document.createElement('span')
    span.className = `hl-${color}`
    span.appendChild(fragment)
    range.insertNode(span)
    sel.removeAllRanges()
  }

  // ---- Excel / CSV import ----
  const applySheet = (sheetData, sheetName) => {
    const types = detectColTypes(sheetData.headers)
    set({ headers: sheetData.headers, rows: sheetData.rows, column_types: types })
    bumpVer()
    setPendingSheets(null)
    const currencyCount = types.filter(t => t === 'currency').length
    setImportMsg({
      type: 'success',
      text: `✓ ${sheetData.rows.length} linhas · ${sheetData.headers.length} colunas importadas de "${sheetName}"${currencyCount ? ` · ${currencyCount} coluna(s) detectada(s) como moeda` : ''}`,
    })
  }

  const parseWorkbook = (XLSX, wb) => {
    const result = {}
    for (const name of wb.SheetNames) {
      const raw = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' })
      if (!raw || raw.length < 1) continue
      const hdrs = (raw[0] || []).map(h => String(h ?? '').trim())
      if (hdrs.every(h => !h)) continue
      const rws = raw.slice(1)
        .filter(row => row.some(c => String(c) !== ''))
        .map(row => hdrs.map((_, ci) => String(row[ci] ?? '')))
      result[name] = { headers: hdrs, rows: rws }
    }
    return result
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    setImportMsg(null)
    setPendingSheets(null)
    try {
      const XLSX = await import('xlsx')
      const ab = await file.arrayBuffer()
      const wb = XLSX.read(new Uint8Array(ab), { type: 'array' })
      const sheets = parseWorkbook(XLSX, wb)
      const names = Object.keys(sheets)
      if (names.length === 0) { setImportMsg({ type: 'error', text: 'Arquivo vazio ou sem dados válidos.' }); return }
      if (names.length === 1) { applySheet(sheets[names[0]], names[0]) }
      else { setPendingSheets({ names, sheets }); setImportMsg({ type: 'info', text: `${names.length} planilhas encontradas. Selecione qual importar:` }) }
    } catch (err) {
      setImportMsg({ type: 'error', text: `Erro ao ler arquivo: ${err.message}` })
    }
  }

  const IMPORT_MSG_COLORS = {
    success: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', color: '#4ADE80' },
    error:   { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  color: '#F87171' },
    info:    { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', color: '#60A5FA' },
  }

  return (
    <div className="card">
      <div className="card-title">📊 Editor de Tabela</div>

      {/* Top controls */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
          <label className="form-label">Subtítulo</label>
          <input className="form-input" value={content.subtitle || ''} onChange={e => set({ subtitle: e.target.value })} placeholder="Ex: Valores válidos para 2026" />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', paddingBottom: 4, flexShrink: 0 }}>
          <input type="checkbox" checked={!!content.searchable} onChange={e => set({ searchable: e.target.checked })} style={{ accentColor: 'var(--accent)' }} />
          Buscável
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)', paddingBottom: 4, flexShrink: 0 }}>
          <input type="checkbox" checked={content.view_mode === 'contacts'} onChange={e => set({ view_mode: e.target.checked ? 'contacts' : '' })} style={{ accentColor: 'var(--accent)' }} />
          👤 Modo Contatos
        </label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>📥 Importar Excel</button>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>.xlsx · .xls · .csv</span>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFile} />
        </div>
      </div>

      {/* Import feedback */}
      {importMsg && (() => {
        const c = IMPORT_MSG_COLORS[importMsg.type] || IMPORT_MSG_COLORS.info
        return <div style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>{importMsg.text}</div>
      })()}

      {/* Multi-sheet selector */}
      {pendingSheets && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {pendingSheets.names.map(name => (
            <button key={name} type="button" className="btn btn-secondary btn-sm" onClick={() => applySheet(pendingSheets.sheets[name], name)}>{name}</button>
          ))}
        </div>
      )}

      {/* Simplified toolbar — same pattern as text editor */}
      <div className="rich-toolbar rich-toolbar-dark" style={{ borderRadius: 'var(--r) var(--r) 0 0', marginBottom: 0 }}>
        <select className="rich-select rich-select-dark"
          onChange={e => { execCmd('formatBlock', e.target.value); e.target.value = '' }} defaultValue="">
          <option value="" disabled>Estilo</option>
          <option value="h3">Título</option>
          <option value="h4">Subtítulo</option>
          <option value="p">Texto</option>
        </select>
        <span className="rich-divider rich-divider-dark" />
        <button className="rich-btn rich-btn-dark rich-bold" title="Negrito"
          onMouseDown={e => { e.preventDefault(); execCmd('bold') }}>B</button>
        <button className="rich-btn rich-btn-dark rich-italic" title="Itálico"
          onMouseDown={e => { e.preventDefault(); execCmd('italic') }}>I</button>
        <span className="rich-divider rich-divider-dark" />
        <button className="rich-btn rich-btn-dark"
          title="Inserir divisor"
          onMouseDown={e => { e.preventDefault(); document.execCommand('insertHTML', false, '<hr>') }}
          style={{ fontSize: 11, letterSpacing: '0.04em', fontWeight: 600 }}>― HR</button>
        <span className="rich-divider rich-divider-dark" />
        <button className="rich-btn rich-btn-dark" title="Grifo Amarelo"
          onMouseDown={e => { e.preventDefault(); insertHighlight('yellow') }}>
          <span className="hl-yellow" style={{ fontSize: 11, pointerEvents: 'none' }}>A</span>
        </button>
        <button className="rich-btn rich-btn-dark" title="Grifo Azul"
          onMouseDown={e => { e.preventDefault(); insertHighlight('blue') }}>
          <span className="hl-blue" style={{ fontSize: 11, pointerEvents: 'none' }}>A</span>
        </button>
        <button className="rich-btn rich-btn-dark" title="Grifo Verde"
          onMouseDown={e => { e.preventDefault(); insertHighlight('green') }}>
          <span className="hl-green" style={{ fontSize: 11, pointerEvents: 'none' }}>A</span>
        </button>
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
                <th key={`${ver}_h_${ci}`} style={{ padding: 0, background: 'var(--bg-3)', border: '1px solid var(--border)', minWidth: 120 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                    <select
                      value={columnTypes[ci] || 'text'}
                      onChange={e => updateColumnType(ci, e.target.value)}
                      style={{ fontSize: 10, background: 'var(--bg)', border: 'none', borderTop: '1px solid var(--border)', color: 'var(--text-3)', padding: '3px 6px', outline: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
                    >
                      {COL_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </th>
              ))}
              <th style={{ padding: 4, background: 'var(--bg-3)', border: '1px solid var(--border)', width: 36, textAlign: 'center' }}>
                <button onClick={addColumn} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>+</button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={`${ver}_r_${ri}`}>
                {row.map((cell, ci) => (
                  <td key={`${ver}_${ri}_${ci}`} style={{ border: '1px solid var(--border)', padding: 0, background: 'var(--bg-2)' }}>
                    <TableCell value={cell} onBlur={val => updateCell(ri, ci, val)} style={{ fontSize: 13, color: 'var(--text)', padding: '5px 8px', minWidth: 80 }} />
                  </td>
                ))}
                <td style={{ border: '1px solid var(--border)', padding: 4, width: 36, textAlign: 'center', background: 'var(--bg-2)' }}>
                  <button onClick={() => removeRow(ri)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
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
const CRM_COLOR_OPTIONS = [
  { value: 'default',  label: 'Padrão' },
  { value: 'destaque', label: '🟡 Destaque (amarelo)' },
  { value: 'positivo', label: '🟢 Positivo (verde)' },
  { value: 'alerta',   label: '🟠 Alerta (laranja)' },
  { value: 'urgente',  label: '🔴 Urgente (vermelho)' },
  { value: 'primario', label: '🔵 Primário (azul)' },
]

function CrmEditor({ content, onChange }) {
  const templates = content.templates || []

  const add = () => onChange({
    ...content,
    templates: [...templates, { label: '📄 Novo template', text: '', category: '', color: 'default' }]
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
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="form-input"
              value={tpl.category || ''}
              onChange={e => update(i, 'category', e.target.value)}
              placeholder="Categoria (ex: Retorno, Abertura, Follow-up...)"
              style={{ flex: 1 }}
            />
            <select
              className="form-select"
              value={tpl.color || 'default'}
              onChange={e => update(i, 'color', e.target.value)}
              style={{ width: 190, flexShrink: 0 }}
            >
              {CRM_COLOR_OPTIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
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
const CARD_COLORS = [
  { value: 'default',       label: 'Padrão (dourado)',        accent: '#f0ad4e' },
  { value: 'vestibular',    label: '🔵 Vestibular',            accent: '#3B82F6' },
  { value: 'enem',          label: '🟢 ENEM',                  accent: '#22C55E' },
  { value: 'portador',      label: '🟡 Portador de Diploma',   accent: '#F59E0B' },
  { value: 'transferencia', label: '🟣 Transferência',         accent: '#8B5CF6' },
  { value: 'aviso',         label: '🔴 Aviso',                 accent: '#EF4444' },
]

const getCardAccent = (colorValue) => {
  const found = CARD_COLORS.find(c => c.value === colorValue)
  return found ? found.accent : '#f0ad4e'
}

// ---- NOTE CARD EDITOR (single card with rich text) ----
function NoteCardEditor({ card, onUpdate, onRemove, onAddTodo, onUpdateTodo, onRemoveTodo }) {
  const editorRef = useRef(null)
  const accent = getCardAccent(card.color)
  const badgesStr = Array.isArray(card.badges)
    ? card.badges.join(', ')
    : (card.badges || '')
  const badgesParsed = badgesStr ? badgesStr.split(',').map(b => b.trim()).filter(Boolean) : []

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = card.body || ''
    }
  }, [])

  const exec = (cmd, val = null) => {
    document.execCommand('styleWithCSS', false, true)
    document.execCommand(cmd, false, val)
    editorRef.current?.focus()
    if (editorRef.current) onUpdate({ body: editorRef.current.innerHTML, isHtml: true })
  }

  const handleInput = () => {
    if (editorRef.current) onUpdate({ body: editorRef.current.innerHTML, isHtml: true })
  }

  const handleBadgesChange = (val) => {
    const badges = val.split(',').map(b => b.trim()).filter(Boolean)
    onUpdate({ badges })
  }

  return (
    <div className="notepad-card" style={{ '--card-accent': accent }}>
      {/* Top bar: color selector + delete */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {CARD_COLORS.map(c => (
            <button
              key={c.value}
              title={c.label}
              onClick={() => onUpdate({ color: c.value })}
              style={{
                width: 20, height: 20, borderRadius: '50%', cursor: 'pointer',
                background: c.accent, padding: 0, flexShrink: 0,
                border: `2px solid ${card.color === c.value ? 'rgba(255,255,255,0.6)' : 'transparent'}`,
                transform: card.color === c.value ? 'scale(1.25)' : 'scale(1)',
                transition: 'transform 0.15s',
              }}
            />
          ))}
        </div>
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: 0.45, color: '#D4D4D8', padding: '4px', borderRadius: 4, lineHeight: 1 }}
          title="Remover card"
        >🗑</button>
      </div>

      {/* Icon + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <input
          value={card.icon || ''}
          onChange={e => onUpdate({ icon: e.target.value })}
          placeholder="📌"
          style={{
            width: 44, height: 36, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
            fontSize: 20, textAlign: 'center', color: '#F4F4F5',
            fontFamily: 'var(--font)', outline: 'none', padding: 0, flexShrink: 0,
          }}
        />
        <input
          value={card.title || ''}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Título do card"
          style={{
            flex: 1, background: 'transparent', border: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            fontSize: 20, fontWeight: 700, color: '#F4F4F5',
            fontFamily: 'var(--font)', outline: 'none', padding: '0 0 4px',
          }}
        />
      </div>

      {/* Subtitle */}
      <input
        value={card.subtitle || ''}
        onChange={e => onUpdate({ subtitle: e.target.value })}
        placeholder="Subtítulo (ex: Graduação · Presencial)"
        style={{
          width: '100%', background: 'transparent', border: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: 14, color: '#A1A1AA', fontFamily: 'var(--font)',
          outline: 'none', padding: '6px 0', marginBottom: 10,
        }}
      />

      {/* Badges preview */}
      {badgesParsed.length > 0 && (
        <div className="notepad-badges" style={{ marginBottom: 8 }}>
          {badgesParsed.map((badge, i) => (
            <span key={i} className="notepad-badge" style={{ color: accent }}>{badge}</span>
          ))}
        </div>
      )}

      {/* Badges input */}
      <input
        value={badgesStr}
        onChange={e => handleBadgesChange(e.target.value)}
        placeholder="Badges separados por vírgula (ex: Graduação, UNIGRAN)"
        style={{
          width: '100%', background: 'rgba(255,255,255,0.03)',
          border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 8,
          fontSize: 12, color: '#A1A1AA', fontFamily: 'var(--font)',
          outline: 'none', padding: '6px 10px', marginBottom: 12,
        }}
      />

      {/* Rich text toolbar */}
      <div className="rich-toolbar rich-toolbar-dark" style={{ borderRadius: 'var(--r) var(--r) 0 0', marginBottom: 0 }}>
        <button className="rich-btn rich-btn-dark rich-bold" title="Negrito" onMouseDown={e => { e.preventDefault(); exec('bold') }}>B</button>
        <button className="rich-btn rich-btn-dark rich-italic" title="Itálico" onMouseDown={e => { e.preventDefault(); exec('italic') }}>I</button>
        <button className="rich-btn rich-btn-dark rich-underline" title="Sublinhado" onMouseDown={e => { e.preventDefault(); exec('underline') }}>U</button>
        <span className="rich-divider rich-divider-dark" />
        <label className="rich-color-btn rich-color-btn-dark" title="Cor do texto">
          <span className="rich-color-icon" style={{ borderBottom: '3px solid #e53e3e' }}>A</span>
          <input type="color" defaultValue="#D4D4D8" onChange={e => exec('foreColor', e.target.value)} className="rich-color-input" />
        </label>
        <label className="rich-color-btn rich-color-btn-dark" title="Marca-texto">
          <span className="rich-color-icon" style={{ background: '#fef08a', padding: '0 2px', color: '#333' }}>ab</span>
          <input type="color" defaultValue="#fef08a" onChange={e => exec('backColor', e.target.value)} className="rich-color-input" />
        </label>
        <span className="rich-divider rich-divider-dark" />
        <button className="rich-btn rich-btn-dark" title="Alinhar à esquerda" onMouseDown={e => { e.preventDefault(); exec('justifyLeft') }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="0" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="0" y="13" width="9" height="2"/></svg>
        </button>
        <button className="rich-btn rich-btn-dark" title="Centralizar" onMouseDown={e => { e.preventDefault(); exec('justifyCenter') }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="2.5" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="2.5" y="13" width="9" height="2"/></svg>
        </button>
        <button className="rich-btn rich-btn-dark" title="Alinhar à direita" onMouseDown={e => { e.preventDefault(); exec('justifyRight') }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="14" height="2"/><rect x="5" y="5" width="9" height="2"/><rect x="0" y="9" width="14" height="2"/><rect x="5" y="13" width="9" height="2"/></svg>
        </button>
      </div>

      {/* Rich text area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="rich-editor rich-editor-dark"
        onInput={handleInput}
        style={{ minHeight: 100 }}
      />

      {/* Todos */}
      {(card.todos || []).length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 10 }} />
          {card.todos.map(todo => (
            <div key={todo.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>☐</span>
              <input
                value={todo.text}
                onChange={e => onUpdateTodo(todo.id, e.target.value)}
                placeholder="Texto do item..."
                style={{
                  flex: 1, border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', fontSize: 13, color: '#D4D4D8',
                  fontFamily: 'var(--font)', outline: 'none', padding: '2px 0',
                }}
              />
              <button
                onClick={() => onRemoveTodo(todo.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, opacity: 0.4, color: '#D4D4D8', padding: 0, lineHeight: 1, flexShrink: 0 }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onAddTodo}
        style={{
          marginTop: 12, background: 'none',
          border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 6,
          padding: '4px 12px', fontSize: 12, cursor: 'pointer', opacity: 0.7,
          fontFamily: 'var(--font)', color: '#A1A1AA',
        }}
      >+ to-do</button>
    </div>
  )
}

// ---- NOTEBOOK EDITOR (admin) ----
function NotebookEditor({ content, onChange }) {
  const cards = content.cards || []
  const layout = content.layout || 'grid'

  const addCard = () => onChange({
    ...content,
    cards: [...cards, { id: `c_${Date.now()}`, icon: '', title: '', subtitle: '', badges: [], color: 'default', body: '', isHtml: true, todos: [] }]
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

// ---- FLOW EDITOR ----
const CARD_TYPES = [
  { value: 'script', label: '📋 Script' },
  { value: 'rules',  label: '📌 Regras' },
  { value: 'tip',    label: '💡 Dica' },
  { value: 'alert',  label: '⚠️ Atenção' },
  { value: 'text',   label: '📝 Texto' },
]

function FlowEditor({ content, onChange }) {
  const steps = content.steps || []
  const [expandedStep, setExpandedStep] = useState(null)

  const setSteps = (s) => onChange({ ...content, steps: s })

  const addStep = () => {
    const newStep = { id: `step_${Date.now()}`, title: 'Nova Etapa', emoji: '📌', cards: [] }
    const next = [...steps, newStep]
    setSteps(next)
    setExpandedStep(next.length - 1)
  }

  const updateStep = (si, key, val) => {
    const s = [...steps]; s[si] = { ...s[si], [key]: val }; setSteps(s)
  }

  const removeStep = (si) => {
    const s = [...steps]; s.splice(si, 1); setSteps(s)
    setExpandedStep(v => (v >= si ? Math.max(0, v - 1) : v))
  }

  const addCard = (si, type) => {
    const base = { id: `card_${Date.now()}`, type, title: '' }
    if (type === 'rules') base.items = []
    else if (type === 'text') base.body = ''
    else base.text = ''
    const s = [...steps]
    s[si] = { ...s[si], cards: [...(s[si].cards || []), base] }
    setSteps(s)
  }

  const updateCard = (si, ci, updates) => {
    const s = [...steps]
    s[si].cards[ci] = { ...s[si].cards[ci], ...updates }
    setSteps(s)
  }

  const removeCard = (si, ci) => {
    const s = [...steps]; s[si].cards.splice(ci, 1); setSteps(s)
  }

  const addRule = (si, ci) => {
    const s = [...steps]
    s[si].cards[ci].items = [...(s[si].cards[ci].items || []), { id: `r_${Date.now()}`, positive: true, text: '' }]
    setSteps(s)
  }

  const updateRule = (si, ci, ri, key, val) => {
    const s = [...steps]; s[si].cards[ci].items[ri] = { ...s[si].cards[ci].items[ri], [key]: val }; setSteps(s)
  }

  const removeRule = (si, ci, ri) => {
    const s = [...steps]; s[si].cards[ci].items.splice(ri, 1); setSteps(s)
  }

  return (
    <div className="card">
      <div className="card-title">🗺️ Editor de Playbook</div>
      <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 20 }}>
        Crie as etapas do processo. Dentro de cada etapa, adicione cards de script, regras, dicas, etc.
      </p>

      {steps.map((step, si) => (
        <div key={step.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', marginBottom: 10, overflow: 'hidden' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-3)', cursor: 'pointer' }}
            onClick={() => setExpandedStep(expandedStep === si ? null : si)}
          >
            <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: 13, flexShrink: 0, minWidth: 18 }}>{si + 1}</span>
            <input
              className="form-input"
              value={step.emoji || ''}
              onChange={e => updateStep(si, 'emoji', e.target.value)}
              placeholder="emoji"
              style={{ width: 46, flexShrink: 0, textAlign: 'center' }}
              onClick={e => e.stopPropagation()}
            />
            <input
              className="form-input"
              value={step.title}
              onChange={e => updateStep(si, 'title', e.target.value)}
              placeholder="Título da etapa"
              style={{ flex: 1 }}
              onClick={e => e.stopPropagation()}
            />
            <input
              className="form-input"
              value={step.description || ''}
              onChange={e => updateStep(si, 'description', e.target.value)}
              placeholder="Descrição curta (opcional, aparece no card)"
              style={{ flex: 1 }}
              onClick={e => e.stopPropagation()}
            />
            <select
              className="form-input"
              value={step.visibility || 'all'}
              onChange={e => updateStep(si, 'visibility', e.target.value)}
              style={{ width: 118, flexShrink: 0, fontSize: 11 }}
              onClick={e => e.stopPropagation()}
            >
              <option value="all">👥 Todos</option>
              <option value="user">👤 Usuário</option>
              <option value="gestor">🔑 Gestor</option>
            </select>
            <button
              type="button"
              className={'btn btn-xs ' + ((step.layout || 'stack') === 'stack' ? 'btn-secondary' : 'btn-primary')}
              title="Layout: coluna / grade"
              onClick={e => { e.stopPropagation(); updateStep(si, 'layout', (step.layout || 'stack') === 'stack' ? 'grid' : 'stack') }}
              style={{ flexShrink: 0, fontSize: 12, padding: '2px 7px' }}
            >{(step.layout || 'stack') === 'stack' ? '☰ Coluna' : '⊞ Grade'}</button>
            <button
              type="button"
              className={'btn btn-xs ' + ((step.cards_mode || 'accordion') === 'accordion' ? 'btn-secondary' : 'btn-primary')}
              title="Modo dos cards: acordeão / sempre aberto"
              onClick={e => { e.stopPropagation(); updateStep(si, 'cards_mode', (step.cards_mode || 'accordion') === 'accordion' ? 'open' : 'accordion') }}
              style={{ flexShrink: 0, fontSize: 12, padding: '2px 7px' }}
            >{(step.cards_mode || 'accordion') === 'accordion' ? '▼ Acordeão' : '↕ Aberto'}</button>
            <span style={{ color: 'var(--text-3)', fontSize: 11, flexShrink: 0 }}>{(step.cards || []).length} card(s)</span>
            <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); removeStep(si) }}>🗑</button>
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{expandedStep === si ? '▲' : '▼'}</span>
          </div>

          {expandedStep === si && (
            <div style={{ padding: 16 }}>
              {(step.cards || []).map((card, ci) => (
                <div key={card.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 14, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                      {CARD_TYPES.find(t => t.value === card.type)?.label || card.type}
                    </span>
                    <input
                      className="form-input"
                      value={card.title || ''}
                      onChange={e => updateCard(si, ci, { title: e.target.value })}
                      placeholder="Título do card (opcional)"
                      style={{ flex: 1 }}
                    />
                    <select
                      className="form-input"
                      value={card.visibility || 'all'}
                      onChange={e => updateCard(si, ci, { visibility: e.target.value })}
                      style={{ width: 112, flexShrink: 0, fontSize: 11 }}
                    >
                      <option value="all">👥 Todos</option>
                      <option value="user">👤 Usuário</option>
                      <option value="gestor">🔑 Gestor</option>
                    </select>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeCard(si, ci)}>×</button>
                  </div>

                  {(card.type === 'script' || card.type === 'tip' || card.type === 'alert') && (
                    <textarea
                      className="form-input"
                      value={card.text || ''}
                      onChange={e => updateCard(si, ci, { text: e.target.value })}
                      placeholder={card.type === 'script' ? 'Texto do script (exatamente como será copiado)...' : card.type === 'tip' ? 'Dica rápida...' : 'Descrição do alerta...'}
                      rows={4}
                      style={{ resize: 'vertical', fontFamily: 'var(--font)', fontSize: 13 }}
                    />
                  )}

                  {card.type === 'text' && (
                    <textarea
                      className="form-input"
                      value={card.body || ''}
                      onChange={e => updateCard(si, ci, { body: e.target.value })}
                      placeholder="Texto livre (suporta HTML básico)"
                      rows={4}
                      style={{ resize: 'vertical', fontFamily: 'var(--font)', fontSize: 13 }}
                    />
                  )}

                  {card.type === 'rules' && (
                    <div>
                      {(card.items || []).map((item, ri) => (
                        <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                          <button
                            type="button"
                            onClick={() => updateRule(si, ci, ri, 'positive', !item.positive)}
                            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}
                            title="Clique para alternar ✅/❌"
                          >{item.positive ? '✅' : '❌'}</button>
                          <input
                            className="form-input"
                            value={item.text}
                            onChange={e => updateRule(si, ci, ri, 'text', e.target.value)}
                            placeholder="Descrição da regra..."
                            style={{ flex: 1 }}
                          />
                          <button className="btn btn-ghost btn-sm" onClick={() => removeRule(si, ci, ri)}>×</button>
                        </div>
                      ))}
                      <button className="btn btn-secondary btn-sm" onClick={() => addRule(si, ci)} style={{ marginTop: 4 }}>
                        + Adicionar regra
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingTop: 4 }}>
                {CARD_TYPES.map(ct => (
                  <button key={ct.value} className="btn btn-secondary btn-sm" onClick={() => addCard(si, ct.value)}>
                    + {ct.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <button className="btn btn-secondary" onClick={addStep} style={{ marginTop: 8 }}>
        + Adicionar etapa
      </button>
    </div>
  )
}

// ---- DEFAULTS ----
function getDefaultContent(type) {
  switch (type) {
    case 'text': return { body: '', isHtml: true }
    case 'checklist': return { subtitle: '', groups: [{ title: 'Grupo 1', items: [] }], gestor_groups: [], closing_tip: '' }
    case 'flow': return { steps: [{ id: `step_${Date.now()}`, title: 'Etapa 1', emoji: '👋', cards: [] }] }
    case 'table': return { subtitle: '', searchable: true, headers: ['Coluna 1', 'Coluna 2', 'Coluna 3'], rows: [['', '', '']], column_types: ['text', 'text', 'text'] }
    case 'links': return { items: [] }
    case 'crm_template': return { templates: [{ label: '📄 Novo template', text: '', category: '', color: 'default' }] }
    case 'notepad': return { instructions: '', cards: [], layout: 'grid' }
    case 'search': return { placeholder: '', search_in: [] }
    default: return {}
  }
}
