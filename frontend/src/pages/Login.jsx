import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import Icon from '../components/Icon'
import { GoogleLogin } from '@react-oauth/google'

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

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.googleAuth(credentialResponse.credential)
      login(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Brand Panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-decoration">
          <div className="auth-circle auth-circle-1" />
          <div className="auth-circle auth-circle-2" />
          <div className="auth-circle auth-circle-3" />
        </div>
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <Icon name="shoppingBag" size={38} />
          </div>
          <h1 className="auth-brand-title">Shopzo</h1>
          <p className="auth-brand-tagline">Your premium shopping destination. Discover amazing products at unbeatable prices.</p>
          <div className="auth-brand-features">
            <div className="auth-feature">
              <Icon name="shield" size={18} />
              <span>Secure &amp; Encrypted Checkout</span>
            </div>
            <div className="auth-feature">
              <Icon name="truck" size={18} />
              <span>Fast &amp; Reliable Delivery</span>
            </div>
            <div className="auth-feature">
              <Icon name="refreshCw" size={18} />
              <span>Easy 30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-wrapper fade-in">
          <div className="auth-form-header">
            <div className="auth-form-icon">
              <Icon name="lock" size={28} />
            </div>
            <h2 className="auth-form-title">Welcome Back</h2>
            <p className="auth-form-subtitle">Sign in to your Shopzo account</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <Icon name="alert" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icon name="mail" size={15} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="auth-input"
                  autoComplete="email"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Icon name="lock" size={15} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="auth-input auth-input-password"
                  autoComplete="current-password"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-eye-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={15} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? (
                <>
                  <Icon name="loader" size={18} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <Icon name="arrowRight" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Or continue with</span>
          </div>
          
          <div className="auth-google-btn-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed.')}
              useOneTap
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-footer-link">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
