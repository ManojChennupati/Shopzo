import { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'

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
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form} className="fade-in">
        <div style={styles.header}>
          <div style={styles.icon}>✨</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join us and start shopping</p>
        </div>

        {error && (
          <div style={styles.error} role="alert">
            <span style={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Personal Information</h3>
          
          <div style={styles.inputGroup}>
            <label htmlFor="name" style={styles.label}>Full Name</label>
            <input 
              id="name"
              type="text" 
              placeholder="John Doe" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              style={styles.input} 
              autoComplete="name"
              required 
              aria-required="true"
            />
          </div>

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
                placeholder="Create a strong password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
                style={styles.input} 
                autoComplete="new-password"
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

          <div style={styles.inputGroup}>
            <label htmlFor="phone" style={styles.label}>Phone Number</label>
            <input 
              id="phone"
              type="tel" 
              placeholder="+1 (555) 123-4567" 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              style={styles.input} 
              autoComplete="tel"
              required 
              aria-required="true"
            />
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Shipping Address</h3>
          
          <div style={styles.inputGroup}>
            <label htmlFor="street" style={styles.label}>Street Address</label>
            <input 
              id="street"
              type="text" 
              placeholder="123 Main St" 
              value={form.address.street} 
              onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} 
              style={styles.input} 
              autoComplete="street-address"
              required 
              aria-required="true"
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label htmlFor="city" style={styles.label}>City</label>
              <input 
                id="city"
                type="text" 
                placeholder="New York" 
                value={form.address.city} 
                onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} 
                style={styles.input} 
                autoComplete="address-level2"
                required 
                aria-required="true"
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="state" style={styles.label}>State</label>
              <input 
                id="state"
                type="text" 
                placeholder="NY" 
                value={form.address.state} 
                onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} 
                style={styles.input} 
                autoComplete="address-level1"
                required 
                aria-required="true"
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label htmlFor="country" style={styles.label}>Country</label>
              <input 
                id="country"
                type="text" 
                placeholder="USA" 
                value={form.address.country} 
                onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })} 
                style={styles.input} 
                autoComplete="country-name"
                required 
                aria-required="true"
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="zipCode" style={styles.label}>Zip Code</label>
              <input 
                id="zipCode"
                type="text" 
                placeholder="10001" 
                value={form.address.zipCode} 
                onChange={(e) => setForm({ ...form, address: { ...form.address, zipCode: e.target.value } })} 
                style={styles.input} 
                autoComplete="postal-code"
                required 
                aria-required="true"
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? <span className="spinner" /> : 'Create Account'}
        </button>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Login here
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
    maxWidth: '600px', 
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
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--dark)',
    marginBottom: '0.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid var(--border)'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1
  },
  row: {
    display: 'flex',
    gap: '1rem'
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

export default Register


