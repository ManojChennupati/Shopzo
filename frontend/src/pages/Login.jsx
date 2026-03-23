import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form} className="fade-in">
        <div style={styles.header}>
          <div style={styles.icon}>🔐</div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Login to continue shopping</p>
        </div>

        {error && (
          <div style={styles.error} role="alert">
            <span style={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={styles.input}
            autoComplete="email"
            required
            aria-required="true"
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>Password</label>
          <div style={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={styles.input}
              autoComplete="current-password"
              required
              aria-required="true"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? <span className="spinner" /> : 'Login'}
        </button>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Create one
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}

const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: 'calc(100vh - 80px)', 
    padding: '2rem', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  form: { 
    width: '100%', 
    maxWidth: '450px', 
    background: 'white', 
    padding: '3rem', 
    borderRadius: 'var(--radius-lg)', 
    boxShadow: 'var(--shadow-lg)', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1.5rem'
  },
  header: {
    textAlign: 'center',
    marginBottom: '1rem'
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  title: { 
    fontSize: '2rem', 
    fontWeight: '700', 
    color: 'var(--dark)', 
    marginBottom: '0.5rem' 
  },
  subtitle: { 
    color: 'var(--gray)', 
    fontSize: '1rem' 
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--dark)'
  },
  input: { 
    padding: '1rem', 
    fontSize: '1rem', 
    border: '2px solid var(--border)', 
    borderRadius: 'var(--radius-md)', 
    background: 'var(--light)',
    transition: 'var(--transition)'
  },
  passwordWrapper: {
    position: 'relative'
  },
  button: { 
    padding: '1rem', 
    background: 'var(--primary)', 
    color: 'white', 
    borderRadius: 'var(--radius-md)', 
    fontSize: '1.05rem', 
    fontWeight: '600', 
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '52px'
  },
  error: { 
    color: 'var(--danger)', 
    padding: '1rem', 
    background: '#FEE2E7', 
    borderRadius: 'var(--radius-md)', 
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid var(--danger)'
  },
  errorIcon: {
    fontSize: '1.2rem'
  },
  eyeButton: { 
    position: 'absolute', 
    right: '1rem', 
    top: '50%', 
    transform: 'translateY(-50%)', 
    background: 'transparent', 
    cursor: 'pointer', 
    fontSize: '1.25rem', 
    padding: '0.5rem',
    transition: 'var(--transition-fast)'
  },
  footer: {
    textAlign: 'center',
    marginTop: '0.5rem'
  },
  footerText: {
    color: 'var(--gray)',
    fontSize: '0.95rem'
  },
  link: {
    color: 'var(--primary)',
    fontWeight: '600',
    textDecoration: 'underline'
  }
}

export default Login
