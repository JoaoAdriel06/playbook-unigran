import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function UserLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'user_password')
      .single()

    const correctPassword = data?.value || 'unigran76'

    if (password === correctPassword) {
      sessionStorage.setItem('user_auth', 'true')
      navigate('/')
    } else {
      setError('Senha incorreta.')
    }

    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">UNIGRAN</div>
        <div className="login-sub">Sistema Comercial</div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Senha de acesso</label>
            <input
              type="password"
              className="form-input"
              placeholder="Digite a senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Entrar →'}
          </button>
        </form>
      </div>
    </div>
  )
}
