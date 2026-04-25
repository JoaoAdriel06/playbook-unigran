import { useState, useMemo } from 'react'

function applyHighlight(text, term) {
  if (!term || !text) return String(text || '')
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return String(text).replace(
    new RegExp(`(${escaped})`, 'gi'),
    (match) => `<mark>${match.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</mark>`
  )
}

// ---- LINKS BLOCK ----
export function LinksBlock({ content }) {
  const { items = [] } = content
  return (
    <div className="links-grid">
      {items.map((item, i) => (
        <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="link-card">
          <span className="link-card-emoji">{item.emoji}</span>
          <div className="link-card-body">
            <div className="link-card-title">{item.title}</div>
            <div className="link-card-desc">{item.description}</div>
          </div>
          <span className="link-card-arrow">Acessar →</span>
        </a>
      ))}
    </div>
  )
}

// ---- TEXT BLOCK helpers ----
const BLOCK_TAGS_SET = new Set(['h1','h2','h3','p','ul','ol','li','hr','div','section','article','blockquote','figure'])

export function sanitizeHtml(html) {
  if (!html || !html.trim()) return ''
  const tmp = document.createElement('div')
  tmp.innerHTML = html

  function walk(node) {
    if (node.nodeType === 3) return node.textContent
    if (node.nodeType !== 1) return ''
    const tag = node.tagName.toLowerCase()
    const inner = () => Array.from(node.childNodes).map(walk).join('')

    switch (tag) {
      case 'h1': return `<h1>${inner()}</h1>`
      case 'h2': return `<h2>${inner()}</h2>`
      case 'h3': return `<h3>${inner()}</h3>`
      case 'strong': return `<strong>${inner()}</strong>`
      case 'em': case 'i': return `<em>${inner()}</em>`
      case 'ul': return `<ul>${inner()}</ul>`
      case 'ol': return `<ol>${inner()}</ol>`
      case 'li': { const c = inner().trim(); return c ? `<li>${c}</li>` : '' }
      case 'hr': return '<hr>'
      case 'br': return '<br>'
      case 'mark': return `<mark>${inner()}</mark>`
      case 'span': {
        const cls = node.getAttribute('class') || ''
        if (cls === 'hl-yellow' || cls === 'hl-blue' || cls === 'hl-green') {
          return `<span class="${cls}">${inner()}</span>`
        }
        return inner()
      }
      case 'b': {
        const hasBlock = Array.from(node.childNodes).some(
          n => n.nodeType === 1 && BLOCK_TAGS_SET.has(n.tagName.toLowerCase())
        )
        return hasBlock ? inner() : `<strong>${inner()}</strong>`
      }
      case 'p':
      case 'div': {
        const hasBlock = Array.from(node.childNodes).some(
          n => n.nodeType === 1 && BLOCK_TAGS_SET.has(n.tagName.toLowerCase())
        )
        const c = inner()
        if (!c.trim()) return ''
        return hasBlock ? c : `<p>${c}</p>`
      }
      default: return inner()
    }
  }

  return Array.from(tmp.childNodes).map(walk).join('')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p>\s*<br>\s*<\/p>/g, '')
    .trim()
}

const SECTION_COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#64748B']

function parseIntoSections(html) {
  const clean = (html || '').trim()
  if (!clean) return ['']

  // Strategy 1: split on <hr>
  if (/<hr\s*\/?>/i.test(clean)) {
    const parts = clean.split(/<hr\s*\/?>/gi).map(s => s.trim()).filter(Boolean)
    if (parts.length > 0) return parts
  }

  // Strategy 2: each <h2> starts a new section
  if (/<h2/i.test(clean)) {
    const parts = clean.split(/(?=<h2)/i).map(s => s.trim()).filter(Boolean)
    if (parts.length > 1) return parts
  }

  return [clean]
}

function TextSection({ html, index, highlightTerm }) {
  const accent = SECTION_COLORS[index % SECTION_COLORS.length]
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const plain = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    navigator.clipboard.writeText(plain)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const display = highlightTerm ? applyHighlight(html, highlightTerm) : html

  return (
    <div className="text-section-card" style={{ '--section-accent': accent }}>
      <button className={'text-section-copy' + (copied ? ' copied' : '')} onClick={handleCopy}>
        {copied ? '✓ Copiado' : '📋 Copiar'}
      </button>
      <div className="text-content-rich" dangerouslySetInnerHTML={{ __html: display }} />
    </div>
  )
}

// ---- TEXT BLOCK ----
export function TextBlock({ content, highlightTerm }) {
  const { body = '', category, updatedAt } = content

  const sections = useMemo(() => {
    const clean = sanitizeHtml(body)
    return parseIntoSections(clean)
  }, [body])

  return (
    <div className="text-doc-wrap">
      {(category || updatedAt) && (
        <div className="text-doc-meta">
          {category && <span className="text-doc-category">{category}</span>}
          {updatedAt && <span className="text-doc-date">Atualizado em {updatedAt}</span>}
        </div>
      )}
      <div className="text-doc-document">
        {sections.filter(s => s.trim()).map((section, i) => (
          <TextSection key={i} html={section} index={i} highlightTerm={highlightTerm} />
        ))}
      </div>
    </div>
  )
}

// ---- CHECKLIST BLOCK ----
export function ChecklistBlock({ content, blockId, highlightTerm }) {
  const { groups = [], subtitle, closing_tip } = content
  const allItems = groups.flatMap(g => g.items)
  const storageKey = `checklist_${blockId}`
  const linksKey = `checklist_links_${blockId}`

  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') }
    catch { return {} }
  })

  const [linkClicked, setLinkClicked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(linksKey) || '{}') }
    catch { return {} }
  })

  const handleLinkClick = (e, itemId) => {
    e.stopPropagation()
    const next = { ...linkClicked, [itemId]: true }
    setLinkClicked(next)
    localStorage.setItem(linksKey, JSON.stringify(next))
  }

  const toggle = (item) => {
    if (item.url && !linkClicked[item.id]) return
    const next = { ...checked, [item.id]: !checked[item.id] }
    setChecked(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const reset = () => {
    setChecked({})
    setLinkClicked({})
    localStorage.removeItem(storageKey)
    localStorage.removeItem(linksKey)
  }

  const done = allItems.filter(i => checked[i.id]).length
  const pct = allItems.length ? Math.round((done / allItems.length) * 100) : 0

  return (
    <div>
      {subtitle && <div className="tip-box" style={{ marginBottom: 20 }}>{subtitle}</div>}

      <div className="progress-wrap">
        <div className="progress-label">
          <span>Progresso do dia</span>
          <span>{done}/{allItems.length} — {pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: pct + '%' }} />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        {groups.map((group, gi) => (
          <div key={gi} className="checklist-group">
            <div className="checklist-group-title">{group.title}</div>
            {group.tip && <div className="tip-box">{group.tip}</div>}
            {group.items.map(item => {
              const isDone = !!checked[item.id]
              const hasLink = !!item.url
              const clicked = hasLink && !!linkClicked[item.id]
              const locked = hasLink && !clicked && !isDone
              return (
                <div
                  key={item.id}
                  className={'checklist-item' + (isDone ? ' done' : '') + (locked ? ' locked' : '')}
                  onClick={() => toggle(item)}
                >
                  <div className="checklist-item-check">✓</div>
                  <label onClick={e => e.stopPropagation()} dangerouslySetInnerHTML={{ __html: highlightTerm ? applyHighlight(item.label, highlightTerm) : item.label }} />
                  {hasLink && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={'checklist-open-btn' + (clicked ? ' visited' : '')}
                      onClick={e => handleLinkClick(e, item.id)}
                    >
                      ↗ {clicked ? 'Acessado' : 'Abrir'}
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {closing_tip && (
        <div className="tip-box" style={{ marginTop: 8 }}>🎯 {closing_tip}</div>
      )}

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary btn-sm" onClick={reset}>↺ Resetar Checklist</button>
      </div>
    </div>
  )
}

// ---- TABLE BLOCK ----
const stripHtml = (s) => typeof s === 'string' ? s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') : String(s || '')

function parseBRCurrency(raw) {
  const s = String(raw).replace(/[R$\s]/g, '').trim()
  if (!s) return NaN
  if (s.includes(',')) return parseFloat(s.replace(/\./g, '').replace(',', '.'))
  return parseFloat(s.replace(/[^\d.]/g, ''))
}

function getStatusClass(text) {
  const t = text.toLowerCase()
  if (['ativo','aprovado','concluído','concluido','sim','disponível','disponivel','pago','confirmado','habilitado'].some(k => t.includes(k))) return 'table-status-positive'
  if (['pendente','em andamento','aberto','parcial','aguardando','em curso'].some(k => t.includes(k))) return 'table-status-warn'
  if (['inativo','cancelado','não','nao','bloqueado','suspenso','recusado','negado'].some(k => t.includes(k))) return 'table-status-danger'
  return 'table-status-neutral'
}

function renderTypedCell(cell, colType, highlightTerm) {
  const plain = stripHtml(cell || '').trim()

  if (colType === 'currency') {
    if (!plain || plain === '-') return <span style={{ color: '#515151' }}>—</span>
    const num = parseBRCurrency(plain)
    if (!isNaN(num)) {
      return <span className="table-badge-value">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)}</span>
    }
    return <span>{plain}</span>
  }

  if (colType === 'percentage') {
    if (!plain || plain === '-') return <span style={{ color: '#515151' }}>—</span>
    return <span className="table-cell-pct">{plain.endsWith('%') ? plain : `${plain}%`}</span>
  }

  if (colType === 'status') {
    if (!plain || plain === '-') return <span style={{ color: '#515151' }}>—</span>
    return <span className={`table-cell-status ${getStatusClass(plain)}`}>{plain}</span>
  }

  if (colType === 'note') {
    const html = highlightTerm ? applyHighlight(cell || '', highlightTerm) : (cell || '')
    return <span className="table-cell-note" dangerouslySetInnerHTML={{ __html: html }} />
  }

  // text (default) — keep backward compat: plain R$ values still get badge
  if (plain && /^R\$\s*[\d.,]+/.test(plain) && !(cell || '').includes('<')) {
    return <span className="table-badge-value">{plain}</span>
  }
  const html = highlightTerm ? applyHighlight(cell || '', highlightTerm) : (cell || '')
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export function TableBlock({ content, highlightTerm }) {
  const { headers = [], rows = [], subtitle, searchable, column_types = [] } = content
  const [q, setQ] = useState('')

  const filtered = q
    ? rows.filter(row => row.some(cell => stripHtml(cell).toLowerCase().includes(q.toLowerCase())))
    : rows

  return (
    <div>
      {subtitle && <p style={{ color: '#71717A', fontSize: 13, marginBottom: 14 }}>{subtitle}</p>}
      {searchable && (
        <div className="table-search">
          <span>🔍</span>
          <input placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} />
          {q && (
            <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', color: '#71717A', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>×</button>
          )}
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>{headers.map((h, i) => (
              <th key={i} dangerouslySetInnerHTML={{ __html: h || '' }} />
            ))}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: 'center', color: '#515151', height: 72, fontSize: 13 }}>
                  Nenhum resultado para "{q}"
                </td>
              </tr>
            ) : (
              filtered.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => {
                    const colType = column_types[ci] || 'text'
                    const isDash = stripHtml(cell).trim() === '-'
                    return (
                      <td key={ci} style={isDash ? { color: '#515151' } : {}}>
                        {renderTypedCell(cell, colType, highlightTerm)}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- CRM TEMPLATES BLOCK ----
const CRM_COLOR_CLASS = {
  destaque: 'crm-color-destaque',
  positivo: 'crm-color-positivo',
  alerta:   'crm-color-alerta',
  urgente:  'crm-color-urgente',
  primario: 'crm-color-primario',
}

const CRM_BADGE_CLASS = {
  destaque: 'crm-badge-destaque',
  positivo: 'crm-badge-positivo',
  alerta:   'crm-badge-alerta',
  urgente:  'crm-badge-urgente',
  primario: 'crm-badge-primario',
}

export function CrmTemplateBlock({ content, highlightTerm }) {
  const { templates = [] } = content
  const [open, setOpen] = useState(null)
  const [copied, setCopied] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [...new Set(templates.map(t => t.category).filter(Boolean))]
  const hasCategories = categories.length > 0

  const filtered = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory)

  const autoOpen = highlightTerm
    ? filtered.findIndex(t => (t.text + ' ' + t.label).toLowerCase().includes(highlightTerm.toLowerCase()))
    : -1
  const effectiveOpen = open !== null ? open : (autoOpen >= 0 ? autoOpen : null)

  const copy = async (text, idx) => {
    await navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setOpen(null)
  }

  return (
    <div>
      {hasCategories && (
        <div className="crm-filter-bar">
          <button
            className={'crm-filter-chip' + (activeCategory === 'all' ? ' active' : '')}
            onClick={() => handleCategoryChange('all')}
          >Todos</button>
          {categories.map(cat => (
            <button
              key={cat}
              className={'crm-filter-chip' + (activeCategory === cat ? ' active' : '')}
              onClick={() => handleCategoryChange(cat)}
            >{cat}</button>
          ))}
        </div>
      )}

      <div className="crm-grid">
        {filtered.map((tpl, i) => (
          <div
            key={i}
            className={['crm-template-card', CRM_COLOR_CLASS[tpl.color] || ''].filter(Boolean).join(' ')}
          >
            <div className="crm-template-header" onClick={() => setOpen(effectiveOpen === i ? null : i)}>
              <span
                className="crm-template-label"
                dangerouslySetInnerHTML={{ __html: highlightTerm ? applyHighlight(tpl.label, highlightTerm) : tpl.label }}
              />
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                {tpl.category && (
                  <span className={['crm-category-badge', CRM_BADGE_CLASS[tpl.color] || ''].filter(Boolean).join(' ')}>
                    {tpl.category}
                  </span>
                )}
                <button
                  className={'copy-btn' + (copied === i ? ' copied' : '')}
                  onClick={e => { e.stopPropagation(); copy(tpl.text, i) }}
                >
                  {copied === i ? '✓ Copiado' : 'Copiar'}
                </button>
                <span style={{ color: 'var(--text-3)', fontSize: 10 }}>{effectiveOpen === i ? '▲' : '▼'}</span>
              </div>
            </div>
            {effectiveOpen === i && (
              <div
                className="crm-template-body"
                dangerouslySetInnerHTML={{ __html: highlightTerm ? applyHighlight(tpl.text, highlightTerm) : tpl.text }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- NOTEBOOK BLOCK ----
const CARD_COLORS = [
  { value: 'default',       accent: '#f0ad4e' },
  { value: 'vestibular',    accent: '#3B82F6' },
  { value: 'enem',          accent: '#22C55E' },
  { value: 'portador',      accent: '#F59E0B' },
  { value: 'transferencia', accent: '#8B5CF6' },
  { value: 'aviso',         accent: '#EF4444' },
]

const getCardAccent = (colorValue) => {
  const found = CARD_COLORS.find(c => c.value === colorValue)
  return found ? found.accent : '#f0ad4e'
}

export function NotebookBlock({ content, blockId }) {
  const { cards = [], instructions, layout } = content
  const storageKey = `notepad_todos_${blockId}`

  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') }
    catch { return {} }
  })

  const toggleTodo = (todoId) => {
    const next = { ...checked, [todoId]: !checked[todoId] }
    setChecked(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const containerClass = layout === 'stack' ? 'notepad-stack' : 'notepad-grid'

  return (
    <div>
      {instructions && (
        <p style={{ color: '#A1A1AA', fontSize: 14, marginBottom: 20 }}>{instructions}</p>
      )}
      {cards.length === 0 ? (
        <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Nenhuma anotação adicionada ainda.</p>
      ) : (
        <div className={containerClass}>
          {cards.map(card => {
            const accent = getCardAccent(card.color)
            const badges = Array.isArray(card.badges)
              ? card.badges
              : (card.badges ? String(card.badges).split(',').map(b => b.trim()).filter(Boolean) : [])
            const isRich = card.isHtml || (card.body && card.body.trim().startsWith('<'))
            return (
              <div key={card.id} className="notepad-card" style={{ '--card-accent': accent }}>
                {(card.icon || card.title) && (
                  <div className="notepad-card-header">
                    {card.icon && <span className="notepad-card-icon">{card.icon}</span>}
                    {card.title && <div className="notepad-card-title">{card.title}</div>}
                  </div>
                )}
                {card.subtitle && <div className="notepad-card-subtitle">{card.subtitle}</div>}
                {badges.length > 0 && (
                  <div className="notepad-badges">
                    {badges.map((badge, i) => (
                      <span key={i} className="notepad-badge" style={{ color: accent }}>{badge}</span>
                    ))}
                  </div>
                )}
                {card.body && (
                  isRich
                    ? <div className="notepad-card-body" dangerouslySetInnerHTML={{ __html: card.body }} />
                    : <div className="notepad-card-body">{card.body}</div>
                )}
                {(card.todos || []).length > 0 && (
                  <div className="notepad-todos">
                    {card.body && <div className="notepad-todos-divider" />}
                    {card.todos.map(todo => {
                      const done = !!checked[todo.id]
                      return (
                        <div
                          key={todo.id}
                          className={'notepad-todo-item' + (done ? ' done' : '')}
                          onClick={() => toggleTodo(todo.id)}
                        >
                          <div
                            className="notepad-todo-check"
                            style={{
                              borderColor: done ? accent : 'rgba(255,255,255,0.25)',
                              background: done ? accent : 'transparent',
                              color: done ? '#1a1a1a' : 'transparent',
                            }}
                          >✓</div>
                          <span className="notepad-todo-text">{todo.text}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---- SEARCH BLOCK ----
function extractBlockText(block) {
  const { type, title = '', content } = block
  const parts = [title]
  switch (type) {
    case 'text':
      parts.push(stripHtml(content.body || ''))
      break
    case 'checklist':
      ;(content.groups || []).forEach(g => {
        parts.push(g.title || '', g.tip || '')
        ;(g.items || []).forEach(i => parts.push(i.label || ''))
      })
      parts.push(content.subtitle || '', content.closing_tip || '')
      break
    case 'notepad':
      ;(content.cards || []).forEach(c => {
        parts.push(c.title || '', stripHtml(c.body || ''))
        ;(c.todos || []).forEach(t => parts.push(t.text || ''))
      })
      break
    case 'crm_template':
      ;(content.templates || []).forEach(t => parts.push(t.label || '', t.text || ''))
      break
    case 'table':
      parts.push(...(content.headers || []).map(stripHtml))
      ;(content.rows || []).forEach(row => row.forEach(cell => parts.push(stripHtml(cell))))
      break
  }
  return parts.filter(Boolean).join(' ')
}

function getSnippet(text, q) {
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text.slice(0, 120)
  const start = Math.max(0, idx - 40)
  const end = Math.min(text.length, idx + 100)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

function highlightQuery(text, q) {
  if (!q) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
}

export function SearchBlock({ content, blockId, allBlocks = [], onNavigate }) {
  const [q, setQ] = useState('')
  const { placeholder = 'Buscar...', search_in = [] } = content

  const results = q.trim().length < 2 ? [] : allBlocks
    .filter(b => b.id !== blockId && (search_in.length === 0 || search_in.includes(b.type)))
    .map(b => ({ block: b, text: extractBlockText(b) }))
    .filter(({ text }) => text.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 12)

  return (
    <div>
      <div className="table-search">
        <span style={{ color: 'var(--text-3)' }}>🔍</span>
        <input
          placeholder={placeholder || 'Buscar...'}
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        {q && (
          <button
            onClick={() => setQ('')}
            style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 16 }}
          >×</button>
        )}
      </div>
      {q.trim().length >= 2 && (
        <div className="search-results">
          {results.length === 0 ? (
            <p style={{ color: 'var(--text-3)', fontSize: 13, padding: '14px 0' }}>
              Nenhum resultado para "{q}"
            </p>
          ) : (
            results.map(({ block, text }) => (
              <div
                key={block.id}
                className={'search-result-item' + (onNavigate ? ' clickable' : '')}
                onClick={() => { onNavigate?.(block.id, q) }}
              >
                <div className="search-result-title">{block.title || block.type}</div>
                <div
                  className="search-result-snippet"
                  dangerouslySetInnerHTML={{ __html: highlightQuery(getSnippet(text, q), q) }}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ---- BLOCK DISPATCHER ----
export function BlockRenderer({ block, allBlocks, onNavigate, highlightTerm = '' }) {
  const { type, title, content, id } = block

  const inner = () => {
    switch (type) {
      case 'links':        return <LinksBlock content={content} />
      case 'text':         return <TextBlock content={content} highlightTerm={highlightTerm} />
      case 'checklist':    return <ChecklistBlock content={content} blockId={id} highlightTerm={highlightTerm} />
      case 'table':        return <TableBlock content={content} highlightTerm={highlightTerm} />
      case 'crm_template': return <CrmTemplateBlock content={content} highlightTerm={highlightTerm} />
      case 'notepad':      return <NotebookBlock content={content} blockId={id} />
      case 'search':       return <SearchBlock content={content} blockId={id} allBlocks={allBlocks} onNavigate={onNavigate} />
      default:             return <p style={{ color: 'var(--text-3)' }}>Tipo de bloco desconhecido: {type}</p>
    }
  }

  const classes = [
    'card',
    type === 'search' ? 'card-search' : '',
    highlightTerm ? 'card-highlighted' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} id={`block-${id}`}>
      {title && <div className="card-title">{title}</div>}
      {inner()}
    </div>
  )
}
