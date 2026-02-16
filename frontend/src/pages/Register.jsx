import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    address: { street: '', city: '', state: '', country: '', zipCode: '' }
  })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await authAPI.register(form)
      login(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Register</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={styles.input} required />
        <div style={{ position: 'relative' }}>
          <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={styles.input} required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeButton}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
        </div>
        <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={styles.input} required />
        <input type="text" placeholder="Street" value={form.address.street} onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })} style={styles.input} required />
        <input type="text" placeholder="City" value={form.address.city} onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} style={styles.input} required />
        <input type="text" placeholder="State" value={form.address.state} onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} style={styles.input} required />
        <input type="text" placeholder="Country" value={form.address.country} onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })} style={styles.input} required />
        <input type="text" placeholder="Zip Code" value={form.address.zipCode} onChange={(e) => setForm({ ...form, address: { ...form.address, zipCode: e.target.value } })} style={styles.input} required />
        <button type="submit" style={styles.button}>Register</button>
      </form>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', padding: '2rem' },
  form: { width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '4px', width: '100%' },
  button: { padding: '0.75rem', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '1rem' },
  error: { color: 'red', margin: 0 },
  eyeButton: { position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }
}

export default Register
