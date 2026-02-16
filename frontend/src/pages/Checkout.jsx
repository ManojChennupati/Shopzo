import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'

const Checkout = () => {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    shippingAddress: user?.address || { street: '', city: '', state: '', country: '', zipCode: '' },
    paymentMethod: 'cod'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await orderAPI.create(form)
      const paymentResult = await orderAPI.processPayment({ orderId: data.order._id, provider: form.paymentMethod })
      setMessage('Order placed successfully!')
      setTimeout(() => navigate('/orders'), 2000)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', color: 'var(--dark)', textAlign: 'center' }}>Checkout</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--dark)', marginBottom: '0.5rem' }}>📍 Shipping Address</h3>
        <input type="text" placeholder="Street" value={form.shippingAddress.street} onChange={(e) => setForm({ ...form, shippingAddress: { ...form.shippingAddress, street: e.target.value } })} style={styles.input} required />
        <input type="text" placeholder="City" value={form.shippingAddress.city} onChange={(e) => setForm({ ...form, shippingAddress: { ...form.shippingAddress, city: e.target.value } })} style={styles.input} required />
        <input type="text" placeholder="State" value={form.shippingAddress.state} onChange={(e) => setForm({ ...form, shippingAddress: { ...form.shippingAddress, state: e.target.value } })} style={styles.input} required />
        <input type="text" placeholder="Country" value={form.shippingAddress.country} onChange={(e) => setForm({ ...form, shippingAddress: { ...form.shippingAddress, country: e.target.value } })} style={styles.input} required />
        <input type="text" placeholder="Zip Code" value={form.shippingAddress.zipCode} onChange={(e) => setForm({ ...form, shippingAddress: { ...form.shippingAddress, zipCode: e.target.value } })} style={styles.input} required />
        
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--dark)', marginTop: '1rem', marginBottom: '0.5rem' }}>💳 Payment Method</h3>
        <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} style={styles.input}>
          <option value="cod">Cash on Delivery</option>
          <option value="card">Card</option>
        </select>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Processing...' : 'Place Order'}
        </button>
        {message && <p style={styles.message}>{message}</p>}
      </form>
    </div>
  )
}

const styles = {
  container: { padding: '3rem 1.5rem', maxWidth: '700px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' },
  form: { background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  input: { padding: '1rem', fontSize: '1rem', border: '2px solid var(--border)', borderRadius: '8px', background: 'var(--light)' },
  button: { padding: '1.25rem', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '700', marginTop: '1rem' },
  message: { color: 'var(--success)', textAlign: 'center', padding: '1rem', background: '#E8F8F5', borderRadius: '8px', fontWeight: '600' }
}

export default Checkout
