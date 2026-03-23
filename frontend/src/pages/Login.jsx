import { useState, useContext, useEffect } from 'react'
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

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '874059481484-c2ebvq40gimaqf6s4jl2qdht0mh259ns.apps.googleusercontent.com',
          callback: handleGoogleResponse
        })
        
        const buttonDiv = document.getElementById('googleSignInButton')
        if (buttonDiv) {
          window.google.accounts.id.renderButton(
            buttonDiv,
            { theme: 'outline', size: 'large', width: '100%' }
          )
        }
      }
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true)
      setError('')
      console.log('Google credential received')
      const { data } = await authAPI.googleAuth(response.credential)
      console.log('Google auth successful:', data)
      login(data.user, data.token)
      
      if (data.user.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error('Google sign-in error:', err)
      setError(err.response?.data?.message || err.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { data } = await authAPI.login(form)
      login(data.user, data.token)
      
      // Redirect based on user role
      if (data.user.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value })
    if (error) setError('') // Clear error when user starts typing
  }

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <div style={styles.icon}>🔐</div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              style={styles.input}
              required
              autoComplete="email"
              aria-describedby={error ? "error-message" : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div style={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                style={styles.passwordInput}
                required
                autoComplete="current-password"
                aria-describedby={error ? "error-message" : undefined}
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

          <button 
            type="submit" 
            disabled={loading || !form.email || !form.password}
            className="btn-primary btn-lg"
            style={styles.submitButton}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerText}>OR</span>
          </div>

          <div id="googleSignInButton" style={styles.googleButton}></div>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: 'calc(100vh - 64px)', 
    padding: 'var(--space-4)',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
  },
  formWrapper: {
    width: '100%',
    maxWidth: '420px',
    background: 'white',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: 'var(--shadow-xl)',
    overflow: 'hidden'
  },
  header: {
    textAlign: 'center',
    padding: 'var(--space-8) var(--space-6) var(--space-4)',
    background: 'linear-gradient(135deg, var(--gray-50) 0%, white 100%)'
  },
  icon: {
    fontSize: 'var(--font-size-5xl)',
    marginBottom: 'var(--space-4)'
  },
  title: {
    fontSize: 'var(--font-size-3xl)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-2)'
  },
  subtitle: {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-size-base)'
  },
  form: {
    padding: 'var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  },
  input: {
    fontSize: 'var(--font-size-base)',
    padding: 'var(--space-4)',
    borderRadius: 'var(--radius-lg)'
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  passwordInput: {
    fontSize: 'var(--font-size-base)',
    padding: 'var(--space-4)',
    paddingRight: 'var(--space-12)',
    borderRadius: 'var(--radius-lg)',
    width: '100%'
  },
  eyeButton: {
    position: 'absolute',
    right: 'var(--space-4)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 'var(--font-size-xl)',
    padding: 'var(--space-2)',
    color: 'var(--gray-500)',
    borderRadius: 'var(--radius)',
    transition: 'all var(--transition-base)'
  },
  submitButton: {
    marginTop: 'var(--space-2)',
    width: '100%'
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: 'var(--space-4) 0'
  },
  dividerText: {
    background: 'white',
    padding: '0 var(--space-3)',
    color: 'var(--gray-500)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: '500',
    position: 'relative',
    zIndex: 1
  },
  googleButton: {
    display: 'flex',
    justifyContent: 'center'
  },
  footer: {
    padding: 'var(--space-6)',
    paddingTop: 0,
    textAlign: 'center'
  },
  footerText: {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-size-sm)'
  },
  link: {
    color: 'var(--primary)',
    fontWeight: '600',
    textDecoration: 'none'
  }
}

export default Login