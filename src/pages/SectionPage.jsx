import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { BlockRenderer } from '../components/blocks/BlockRenderer.jsx'

const BLOCK_LABELS = {
  text: 'Texto',
  checklist: 'Checklist',
  table: 'Tabela',
  links: 'Links',
  crm_template: 'Templates CRM',
  notepad: 'Bloco de Notas',
  search: 'Busca',
}

export default function SectionPage({ slug: slugProp }) {
  const { slug: slugParam } = useParams()
  const slug = slugProp || slugParam

  const [section, setSection] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [highlight, setHighlight] = useState({ blockId: null, term: '' })

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(null)
    setActiveId(null)

    async function load() {
      const { data: sec, error: secErr } = await supabase
        .from('sections')
        .select('*')
        .eq('slug', slug)
        .eq('visible', true)
        .single()

      if (secErr || !sec) {
        setError('Seção não encontrada.')
        setLoading(false)
        return
      }

      const isAdmin  = sessionStorage.getItem('admin_auth')  === 'true'
      const isGestor = sessionStorage.getItem('gestor_auth') === 'true'
      const a = sec.access || 'all'
      const canAccess = a === 'all' || isAdmin
        || (a === 'gestor' && isGestor)
        || (a === 'user'   && !isGestor && !isAdmin)
      if (!canAccess) {
        setError('Você não tem acesso a esta seção.')
        setLoading(false)
        return
      }

      const { data: blks } = await supabase
        .from('blocks')
        .select('*')
        .eq('section_id', sec.id)
        .eq('visible', true)
        .order('order_index')

      setSection(sec)
      setBlocks(blks || [])
      setLoading(false)
    }

    load()
  }, [slug])

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      Carregando...
    </div>
  )

  if (error) return (
    <div className="page">
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-text">{error}</div>
      </div>
    </div>
  )

  const sidebarEnabled = section.show_sidebar
  const searchBlocks = blocks.filter(b => b.type === 'search')
  const nonSearchBlocks = blocks.filter(b => b.type !== 'search')
  // Include every non-search block in sidebar (fallback to type label if no title)
  const sidebarBlocks = sidebarEnabled ? nonSearchBlocks : []
  const hasSidebar = sidebarEnabled && sidebarBlocks.length > 0

  const position = section.sidebar_position || 'left'
  const sidebarSticky = !!(hasSidebar && position === 'top' && section.sidebar_sticky)

  const stickySearchBlocks = searchBlocks.filter(b => b.content?.sticky)
  const normalSearchBlocks = searchBlocks.filter(b => !b.content?.sticky)

  const hasStickyBar = sidebarSticky || stickySearchBlocks.length > 0

  const scrollToBlock = (blockId) => {
    setActiveId(blockId)
    setTimeout(() => {
      document.getElementById(`block-${blockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const SidebarNav = ({ className }) => (
    <nav className={className}>
      <div className="page-sidebar-title">Nesta página</div>
      {sidebarBlocks.map(block => {
        const label = block.title || BLOCK_LABELS[block.type] || block.type
        return (
          <a
            key={block.id}
            href={`#block-${block.id}`}
            className={'page-sidebar-link' + (activeId === block.id ? ' active' : '')}
            onClick={e => {
              e.preventDefault()
              scrollToBlock(block.id)
            }}
          >{label}</a>
        )
      })}
    </nav>
  )

  const PageHeader = () => (
    <div className="page-header">
      <h1 className="page-title">{section.emoji} {section.title}</h1>
    </div>
  )

  const handleNavigate = (blockId, term = '') => {
    setHighlight({ blockId, term })
    setTimeout(() => setHighlight({ blockId: null, term: '' }), 5000)
    scrollToBlock(blockId)
  }

  const renderBlock = (block) => (
    <BlockRenderer
      key={block.id}
      block={block}
      allBlocks={block.type === 'search' ? blocks : undefined}
      onNavigate={block.type === 'search' ? handleNavigate : undefined}
      highlightTerm={highlight.blockId === block.id ? highlight.term : ''}
    />
  )

  const StickyBar = () => (
    <div className="page-sticky-bar">
      {sidebarSticky && <SidebarNav className="page-sidebar-top" />}
      {stickySearchBlocks.map(b => renderBlock(b))}
    </div>
  )

  const Content = () => (
    <>
      {normalSearchBlocks.map(block => renderBlock(block))}
      {nonSearchBlocks.length === 0 && searchBlocks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">Esta seção ainda não tem conteúdo.<br />Adicione blocos pelo painel Admin.</div>
        </div>
      ) : (
        nonSearchBlocks.map(block => renderBlock(block))
      )}
    </>
  )

  // Left position
  if (hasSidebar && position === 'left') {
    return (
      <div className="page page-with-sidebar">
        <SidebarNav className="page-sidebar" />
        <div className="page-main-content">
          <PageHeader />
          {stickySearchBlocks.length > 0 && <StickyBar />}
          <Content />
        </div>
      </div>
    )
  }

  // Top position
  if (hasSidebar && position === 'top') {
    return (
      <div className="page page-with-sidebar-top">
        <PageHeader />
        {!sidebarSticky && <SidebarNav className="page-sidebar-top" />}
        {hasStickyBar && <StickyBar />}
        <div className="page-main-content">
          <Content />
        </div>
      </div>
    )
  }

  // Bottom position
  if (hasSidebar && position === 'bottom') {
    return (
      <div className="page page-with-sidebar-bottom">
        <PageHeader />
        {stickySearchBlocks.length > 0 && <StickyBar />}
        <div className="page-main-content">
          <Content />
        </div>
        <SidebarNav className="page-sidebar-bottom" />
      </div>
    )
  }

  // No sidebar
  return (
    <div className="page">
      <PageHeader />
      {stickySearchBlocks.length > 0 && <StickyBar />}
      <Content />
    </div>
  )
}
