import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import Icon from '../components/Icon'

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    address: { street: '', city: '', state: '', country: '', zipCode: '' }
  })
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
      const { data } = await authAPI.register(form)
      login(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
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
          <p className="auth-brand-tagline">Join thousands of happy shoppers enjoying exclusive deals and premium products.</p>
          <div className="auth-brand-features">
            <div className="auth-feature">
              <Icon name="gift" size={18} />
              <span>Exclusive Member Deals</span>
            </div>
            <div className="auth-feature">
              <Icon name="star" size={18} />
              <span>Curated Product Selection</span>
            </div>
            <div className="auth-feature">
              <Icon name="shield" size={18} />
              <span>Safe &amp; Secure Shopping</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-wrapper fade-in">
          <div className="auth-form-header">
            <div className="auth-form-icon">
              <Icon name="user" size={28} />
            </div>
            <h2 className="auth-form-title">Create Account</h2>
            <p className="auth-form-subtitle">Join Shopzo and start shopping today</p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              <Icon name="alert" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Personal Information */}
            <div className="auth-section-label">
              <Icon name="user" size={14} />
              Personal Information
            </div>

            <div className="auth-field">
              <label htmlFor="name" className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Icon name="user" size={15} /></span>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="auth-input"
                  autoComplete="name"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Icon name="mail" size={15} /></span>
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
                <span className="auth-input-icon"><Icon name="lock" size={15} /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="auth-input auth-input-password"
                  autoComplete="new-password"
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

            <div className="auth-field">
              <label htmlFor="phone" className="auth-label">Phone Number</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Icon name="phone" size={15} /></span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="auth-input"
                  autoComplete="tel"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="auth-section-label">
              <Icon name="mapPin" size={14} />
              Shipping Address
            </div>

            <div className="auth-field">
              <label htmlFor="street" className="auth-label">Street Address</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon"><Icon name="home" size={15} /></span>
                <input
                  id="street"
                  type="text"
                  placeholder="123 Main St"
                  value={form.address.street}
                  onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                  className="auth-input"
                  autoComplete="street-address"
                  required
                  aria-required="true"
                />
              </div>
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="city" className="auth-label">City</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><Icon name="building" size={15} /></span>
                  <input
                    id="city"
                    type="text"
                    placeholder="Mumbai"
                    value={form.address.city}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                    className="auth-input"
                    autoComplete="address-level2"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="auth-field">
                <label htmlFor="state" className="auth-label">State</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><Icon name="map" size={15} /></span>
                  <input
                    id="state"
                    type="text"
                    placeholder="Maharashtra"
                    value={form.address.state}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                    className="auth-input"
                    autoComplete="address-level1"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="country" className="auth-label">Country</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><Icon name="globe" size={15} /></span>
                  <input
                    id="country"
                    type="text"
                    placeholder="India"
                    value={form.address.country}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
                    className="auth-input"
                    autoComplete="country-name"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="auth-field">
                <label htmlFor="zipCode" className="auth-label">Zip Code</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><Icon name="hash" size={15} /></span>
                  <input
                    id="zipCode"
                    type="text"
                    placeholder="400001"
                    value={form.address.zipCode}
                    onChange={(e) => setForm({ ...form, address: { ...form.address, zipCode: e.target.value } })}
                    className="auth-input"
                    autoComplete="postal-code"
                    required
                    aria-required="true"
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? (
                <>
                  <Icon name="loader" size={18} />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <Icon name="arrowRight" size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-footer-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
