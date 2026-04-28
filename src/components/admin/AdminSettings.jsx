import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'

function PasswordCard({ title, settingsKey, defaultHint }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setMsg('')
    setError('')
    if (!password) return setError('Digite a nova senha.')
    if (password !== confirm) return setError('As senhas não coincidem.')
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.')

    setSaving(true)
    await supabase.from('settings').upsert({ key: settingsKey, value: password })
    setSaving(false)
    setPassword('')
    setConfirm('')
    setMsg('Senha alterada com sucesso!')
    setTimeout(() => setMsg(''), 4000)
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <div className="card-title">{title}</div>

      {error && <div className="alert" style={{ background: 'var(--danger-bg)', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--danger)', marginBottom: 16 }}>{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="form-group">
        <label className="form-label">Nova senha</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Confirmar nova senha</label>
        <input
          type="password"
          className="form-input"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Repita a senha"
        />
      </div>
      {defaultHint && (
        <p style={{ color: 'var(--text-3)', fontSize: 12, marginBottom: 12 }}>
          Senha padrão inicial: <code style={{ background: 'var(--bg-3)', padding: '2px 6px', borderRadius: 4 }}>{defaultHint}</code>
        </p>
      )}
      <button className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? 'Salvando...' : '✓ Salvar nova senha'}
      </button>
    </div>
  )
}

export default function AdminSettings() {
  return (
    <>
      <div className="admin-section-header">
        <div>
          <h1 className="admin-title">Configurações</h1>
          <p className="admin-subtitle">Ajustes gerais do sistema.</p>
        </div>
      </div>

      <PasswordCard
        title="🔒 Senha do Admin"
        settingsKey="admin_password"
        defaultHint="unigran2026"
      />

      <div style={{ marginTop: 20 }}>
        <PasswordCard
          title="👤 Senha de acesso dos usuários"
          settingsKey="user_password"
          defaultHint="unigran76"
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <PasswordCard
          title="🔑 Senha do Gestor"
          settingsKey="gestor_password"
          defaultHint="Adriel2406"
        />
      </div>

      <div className="card" style={{ maxWidth: 480, marginTop: 20 }}>
        <div className="card-title">ℹ️ Sobre o sistema</div>
        <div style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.8 }}>
          <p><strong>Versão:</strong> 2.0</p>
          <p><strong>Banco de dados:</strong> Supabase</p>
          <p><strong>Para adicionar conteúdo:</strong> vá em "Abas / Seções" no menu lateral → clique numa aba → "Novo Bloco"</p>
        </div>
      </div>
    </>
  )
}
