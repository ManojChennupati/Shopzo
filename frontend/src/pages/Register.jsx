import { useState, useContext, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import Icon from '../components/Icon'

const Register = () => {
  const [form, setForm] = useState({
    name: '', 
    email: '', 
    password: '', 
    phone: '',
    address: { 
      street: '', 
      city: '', 
      state: '', 
      country: '', 
      zipCode: '' 
    }
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyingAddress, setVerifyingAddress] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
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
      navigate('/')
    } catch (err) {
      console.error('Google sign-in error:', err)
      setError(err.response?.data?.message || err.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Verify address
    setVerifyingAddress(true)
    try {
      const { city, state, country } = form.address
      const query = `${city}, ${state}, ${country}`
      const apiKey = 'pk.1cc505b2ffe76a7a378b4bcb0ecd6c1e'
      const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(query)}&format=json`
      
      console.log('Verifying address:', query)
      const response = await fetch(url)
      const data = await response.json()
      console.log('LocationIQ response:', data)
      
      if (data.error) {
        setError('Please check your city, state, and country.')
        setVerifyingAddress(false)
        return
      }
      
      if (data.length === 0) {
        setError('Address not found. Please enter a valid city, state, and country.')
        setVerifyingAddress(false)
        return
      }
    } catch (err) {
      console.error('Address verification error:', err)
      setError('Failed to verify address. Please try again.')
      setVerifyingAddress(false)
      return
    }
    setVerifyingAddress(false)
    
    setLoading(true)
    setError('')
    
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

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setForm({ ...form, [parent]: { ...form[parent], [child]: value } })
    } else {
      setForm({ ...form, [field]: value })
    }
    if (error) setError('')
  }

  const nextStep = () => {
    if (currentStep === 1 && (!form.name || !form.email || !form.password || !form.phone)) {
      setError('Please fill in all required fields')
      return
    }
    setCurrentStep(2)
    setError('')
  }

  const prevStep = () => {
    setCurrentStep(1)
    setError('')
  }

  const isStep1Valid = form.name && form.email && form.password && form.phone
  const isStep2Valid = form.address.street && form.address.city && form.address.state && form.address.country && form.address.zipCode

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <div style={styles.header}>
          <div style={styles.icon}>🚀</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join us and start shopping today</p>
          
          {/* Progress Indicator */}
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: currentStep === 1 ? '50%' : '100%'
              }}></div>
            </div>
            <div style={styles.stepLabels}>
              <span style={currentStep >= 1 ? styles.activeStep : styles.inactiveStep}>
                Personal Info
              </span>
              <span style={currentStep >= 2 ? styles.activeStep : styles.inactiveStep}>
                Address
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <>
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={styles.input}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={styles.input}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password *</label>
                <div style={styles.passwordWrapper}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    style={styles.passwordInput}
                    required
                    autoComplete="new-password"
                    minLength="6"
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

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={styles.input}
                  required
                  autoComplete="tel"
                />
              </div>

              <button 
                type="button"
                onClick={nextStep}
                disabled={!isStep1Valid}
                className="btn-primary btn-lg"
                style={styles.submitButton}
              >
                Continue to Address →
              </button>

              <div style={styles.divider}>
                <span style={styles.dividerText}>OR</span>
              </div>

              <div id="googleSignInButton" style={styles.googleButton}></div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="form-group">
                <label htmlFor="street" className="form-label">Street Address *</label>
                <input
                  id="street"
                  type="text"
                  placeholder="Enter your street address"
                  value={form.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  style={styles.input}
                  required
                  autoComplete="street-address"
                />
              </div>

              <div style={styles.row}>
                <div className="form-group" style={styles.halfWidth}>
                  <label htmlFor="city" className="form-label">City *</label>
                  <input
                    id="city"
                    type="text"
                    placeholder="City"
                    value={form.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    style={styles.input}
                    required
                    autoComplete="address-level2"
                  />
                </div>

                <div className="form-group" style={styles.halfWidth}>
                  <label htmlFor="state" className="form-label">State *</label>
                  <input
                    id="state"
                    type="text"
                    placeholder="State"
                    value={form.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    style={styles.input}
                    required
                    autoComplete="address-level1"
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div className="form-group" style={styles.halfWidth}>
                  <label htmlFor="country" className="form-label">Country *</label>
                  <input
                    id="country"
                    type="text"
                    placeholder="Country"
                    value={form.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    style={styles.input}
                    required
                    autoComplete="country"
                  />
                </div>

                <div className="form-group" style={styles.halfWidth}>
                  <label htmlFor="zipCode" className="form-label">Zip Code *</label>
                  <input
                    id="zipCode"
                    type="text"
                    placeholder="Zip Code"
                    value={form.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                    style={styles.input}
                    required
                    autoComplete="postal-code"
                  />
                </div>
              </div>

              <div style={styles.buttonRow}>
                <button 
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary"
                  style={styles.backButton}
                >
                  ← Back
                </button>

                <button 
                  type="submit" 
                  disabled={loading || verifyingAddress || !isStep2Valid}
                  className="btn-primary btn-lg"
                  style={styles.submitButton}
                >
                  {verifyingAddress ? (
                    <>
                      <span className="spinner"></span>
                      Verifying Address...
                    </>
                  ) : loading ? (
                    <>
                      <span className="spinner"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Sign in here
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
    background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)'
  },
  formWrapper: {
    width: '100%',
    maxWidth: '480px',
    background: 'white',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: 'var(--shadow-xl)',
    overflow: 'hidden'
  },
  header: {
    textAlign: 'center',
    padding: 'var(--space-8) var(--space-6) var(--space-6)',
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
    fontSize: 'var(--font-size-base)',
    marginBottom: 'var(--space-6)'
  },
  progressContainer: {
    marginTop: 'var(--space-4)'
  },
  progressBar: {
    width: '100%',
    height: '4px',
    background: 'var(--gray-200)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    marginBottom: 'var(--space-3)'
  },
  progressFill: {
    height: '100%',
    background: 'var(--primary)',
    transition: 'width var(--transition-slow)',
    borderRadius: 'var(--radius-full)'
  },
  stepLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--font-size-sm)'
  },
  activeStep: {
    color: 'var(--primary)',
    fontWeight: '600'
  },
  inactiveStep: {
    color: 'var(--gray-400)'
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
  row: {
    display: 'flex',
    gap: 'var(--space-4)'
  },
  halfWidth: {
    flex: 1
  },
  buttonRow: {
    display: 'flex',
    gap: 'var(--space-4)',
    marginTop: 'var(--space-2)'
  },
  backButton: {
    flex: '0 0 auto'
  },
  submitButton: {
    flex: 1
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

export default Register