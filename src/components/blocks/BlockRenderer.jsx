import { useState } from 'react'

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
          <span className="link-card-arrow">↗</span>
        </a>
      ))}
    </div>
  )
}

// ---- TEXT BLOCK ----
export function TextBlock({ content, highlightTerm }) {
  const { body = '', isHtml } = content
  const isRich = isHtml || (body.trim().startsWith('<') && body.includes('>'))
  const displayBody = highlightTerm ? applyHighlight(body, highlightTerm) : body

  return (
    <div className="text-block-wrap">
      {isRich
        ? <div className="text-content-rich" dangerouslySetInnerHTML={{ __html: displayBody }} />
        : <div className="text-content-rich">
            {displayBody.split('\n').map((line, i) =>
              line.trim() === '' ? <br key={i} /> : <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
            )}
          </div>
      }
    </div>
  )
}

// ---- CHECKLIST BLOCK ----
export function ChecklistBlock({ content, blockId, highlightTerm }) {
  const { groups = [], subtitle, closing_tip } = content
  const allItems = groups.flatMap(g => g.items)
  const storageKey = `checklist_${blockId}`

  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') }
    catch { return {} }
  })

  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  const reset = () => {
    setChecked({})
    localStorage.removeItem(storageKey)
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
            {group.items.map(item => (
              <div
                key={item.id}
                className={'checklist-item' + (checked[item.id] ? ' done' : '')}
                onClick={() => toggle(item.id)}
              >
                <div className="checklist-item-check">✓</div>
                <label onClick={e => e.stopPropagation()} dangerouslySetInnerHTML={{ __html: highlightTerm ? applyHighlight(item.label, highlightTerm) : item.label }} />
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="checklist-link-btn"
                    onClick={e => e.stopPropagation()}
                    title="Abrir link"
                  >↗</a>
                )}
              </div>
            ))}
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

export function TableBlock({ content, highlightTerm }) {
  const { headers = [], rows = [], subtitle, searchable } = content
  const [q, setQ] = useState('')

  const filtered = q
    ? rows.filter(row => row.some(cell => stripHtml(cell).toLowerCase().includes(q.toLowerCase())))
    : rows

  return (
    <div>
      {subtitle && <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 14 }}>{subtitle}</p>}
      {searchable && (
        <div className="table-search">
          <span style={{ color: 'var(--text-3)' }}>🔍</span>
          <input
            placeholder="Buscar curso..."
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
                <td colSpan={headers.length} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 24 }}>
                  Nenhum resultado para "{q}"
                </td>
              </tr>
            ) : (
              filtered.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={stripHtml(cell).trim() === '-' ? { color: 'var(--text-3)' } : {}}>
                      <span dangerouslySetInnerHTML={{ __html: highlightTerm ? applyHighlight(cell || '', highlightTerm) : (cell || '') }} />
                    </td>
                  ))}
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
export function CrmTemplateBlock({ content, highlightTerm }) {
  const { templates = [] } = content
  const [open, setOpen] = useState(null)
  const [copied, setCopied] = useState(null)

  const autoOpen = highlightTerm
    ? templates.findIndex(t => (t.text + ' ' + t.label).toLowerCase().includes(highlightTerm.toLowerCase()))
    : -1
  const effectiveOpen = open !== null ? open : (autoOpen >= 0 ? autoOpen : null)

  const copy = async (text, idx) => {
    await navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="crm-grid">
      {templates.map((tpl, i) => (
        <div key={i} className="crm-template-card">
          <div className="crm-template-header" onClick={() => setOpen(effectiveOpen === i ? null : i)}>
            <span
              className="crm-template-label"
              dangerouslySetInnerHTML={{ __html: highlightTerm ? applyHighlight(tpl.label, highlightTerm) : tpl.label }}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                className={'copy-btn' + (copied === i ? ' copied' : '')}
                onClick={e => { e.stopPropagation(); copy(tpl.text, i) }}
              >
                {copied === i ? '✓ Copiado!' : '📋 Copiar'}
              </button>
              <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{effectiveOpen === i ? '▲' : '▼'}</span>
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
  )
}

// ---- NOTEBOOK BLOCK ----
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

const getNoteStyle = (colorValue) => {
  if (!colorValue || colorValue === 'default') {
    return { bg: 'var(--bg-2)', text: 'var(--text)', accentColor: 'var(--accent)' }
  }
  const found = NOTE_COLORS.find(c => c.value === colorValue)
  return { bg: colorValue, text: found?.text || '#111', accentColor: found?.text || '#111' }
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
        <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 16 }}>{instructions}</p>
      )}
      {cards.length === 0 ? (
        <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Nenhuma anotação adicionada ainda.</p>
      ) : (
        <div className={containerClass}>
          {cards.map(card => {
            const { bg, text, accentColor } = getNoteStyle(card.color)
            const isRich = card.isHtml || (card.body && card.body.trim().startsWith('<'))
            return (
              <div key={card.id} className="notepad-card" style={{ background: bg }}>
                {card.title && (
                  <div className="notepad-card-title" style={{ color: text }}>{card.title}</div>
                )}
                {card.body && (
                  isRich
                    ? <div className="notepad-card-body" style={{ color: text }} dangerouslySetInnerHTML={{ __html: card.body }} />
                    : <div className="notepad-card-body" style={{ color: text }}>{card.body}</div>
                )}
                {(card.todos || []).length > 0 && (
                  <div className="notepad-todos">
                    {card.body && <div className="notepad-todos-divider" style={{ borderTopColor: text + '33' }} />}
                    {card.todos.map(todo => {
                      const done = !!checked[todo.id]
                      return (
                        <div
                          key={todo.id}
                          className={'notepad-todo-item' + (done ? ' done' : '')}
                          onClick={() => toggleTodo(todo.id)}
                          style={{
                            borderColor: done ? accentColor + '88' : text + '28',
                            background: done ? accentColor + '18' : text + '08',
                          }}
                        >
                          <div
                            className="notepad-todo-check"
                            style={{
                              borderColor: done ? accentColor : text + '66',
                              background: done ? accentColor : 'transparent',
                              color: done ? '#1a1a1a' : 'transparent',
                            }}
                          >✓</div>
                          <span
                            style={{
                              fontSize: 13,
                              fontFamily: 'var(--font)',
                              color: text,
                              textDecoration: done ? 'line-through' : 'none',
                              opacity: done ? 0.5 : 1,
                              flex: 1,
                              userSelect: 'none',
                            }}
                          >{todo.text}</span>
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
