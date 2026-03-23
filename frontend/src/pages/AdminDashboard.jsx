import { useState, useEffect } from 'react'
import { productAPI, orderAPI } from '../services/api'

const AdminDashboard = () => {
  const [view, setView] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ title: '', description: '', price: '', stock: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    if (view === 'products') fetchProducts()
    if (view === 'orders') fetchOrders()
  }, [view])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data } = await productAPI.getAll({})
      setProducts(data.products)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data } = await orderAPI.getAll()
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await productAPI.create(form)
      setForm({ title: '', description: '', price: '', stock: '' })
      setMessage({ text: '✓ Product created successfully!', type: 'success' })
      fetchProducts()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to create product', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, { orderStatus: status })
      setMessage({ text: '✓ Order status updated!', type: 'success' })
      fetchOrders()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: 'Failed to update order', type: 'error' })
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'PLACED': '#FFA500',
      'SHIPPED': '#3498db',
      'DELIVERED': 'var(--success)',
      'CANCELLED': 'var(--danger)'
    }
    return colors[status] || 'var(--gray)'
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Admin Dashboard</h1>
        <p style={styles.subtitle}>Manage products and orders</p>
      </div>

      <div style={styles.tabs}>
        <button 
          onClick={() => setView('products')} 
          style={view === 'products' ? styles.activeTab : styles.tab}
          aria-current={view === 'products' ? 'page' : undefined}
        >
          📦 Products
        </button>
        <button 
          onClick={() => setView('orders')} 
          style={view === 'orders' ? styles.activeTab : styles.tab}
          aria-current={view === 'orders' ? 'page' : undefined}
        >
          📋 Orders
        </button>
      </div>

      {message.text && (
        <div style={{
          ...styles.message,
          background: message.type === 'success' ? '#E8F8F5' : '#FEE2E7',
          color: message.type === 'success' ? 'var(--success-dark)' : 'var(--danger)',
          border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
        }} role="alert">
          {message.text}
        </div>
      )}

      {view === 'products' && (
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>➕ Add New Product</h2>
            <form onSubmit={createProduct} style={styles.form}>
              <div style={styles.inputGroup}>
                <label htmlFor="title" style={styles.label}>Product Title</label>
                <input 
                  id="title"
                  type="text" 
                  placeholder="Enter product name" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  style={styles.input} 
                  required 
                />
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="description" style={styles.label}>Description</label>
                <textarea 
                  id="description"
                  placeholder="Describe the product" 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  style={{...styles.input, minHeight: '100px', resize: 'vertical'}} 
                  required 
                />
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label htmlFor="price" style={styles.label}>Price (₹)</label>
                  <input 
                    id="price"
                    type="number" 
                    placeholder="0.00" 
                    value={form.price} 
                    onChange={(e) => setForm({ ...form, price: e.target.value })} 
                    style={styles.input} 
                    min="0"
                    step="0.01"
                    required 
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label htmlFor="stock" style={styles.label}>Stock Quantity</label>
                  <input 
                    id="stock"
                    type="number" 
                    placeholder="0" 
                    value={form.stock} 
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} 
                    style={styles.input} 
                    min="0"
                    required 
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? <span className="spinner" /> : '➕ Add Product'}
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📦 All Products ({products.length})</h2>
            {loading ? (
              <div style={styles.loadingState}>
                <div className="spinner spinner-large" />
              </div>
            ) : products.length === 0 ? (
              <p style={styles.noData}>No products available</p>
            ) : (
              <div style={styles.productsList}>
                {products.map(p => (
                  <div key={p._id} style={styles.productItem}>
                    <div style={styles.productIcon}>📦</div>
                    <div style={styles.productInfo}>
                      <h3 style={styles.productTitle}>{p.title}</h3>
                      <p style={styles.productMeta}>
                        Price: <strong>₹{p.price}</strong> | Stock: <strong>{p.stock}</strong>
                      </p>
                    </div>
                    <div style={{
                      ...styles.stockBadge,
                      background: p.stock > 10 ? 'var(--success)' : p.stock > 0 ? '#FFA500' : 'var(--danger)'
                    }}>
                      {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'orders' && (
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📋 All Orders ({orders.length})</h2>
            {loading ? (
              <div style={styles.loadingState}>
                <div className="spinner spinner-large" />
              </div>
            ) : orders.length === 0 ? (
              <p style={styles.noData}>No orders yet</p>
            ) : (
              <div style={styles.ordersList}>
                {orders.map(order => (
                  <div key={order._id} style={styles.orderItem}>
                    <div style={styles.orderItemHeader}>
                      <div>
                        <h3 style={styles.orderItemId}>Order #{order._id.slice(-8).toUpperCase()}</h3>
                        <p style={styles.orderCustomer}>👤 {order.userId.name}</p>
                        <p style={styles.orderDate}>
                          📅 {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div style={styles.orderItemRight}>
                        <div style={styles.orderAmount}>₹{order.totalAmount.toFixed(2)}</div>
                        <span style={{
                          ...styles.statusBadge,
                          background: getStatusColor(order.orderStatus)
                        }}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>

                    <div style={styles.orderItemBody}>
                      <div style={styles.statusControl}>
                        <label htmlFor={`status-${order._id}`} style={styles.statusLabel}>
                          Update Status:
                        </label>
                        <select 
                          id={`status-${order._id}`}
                          value={order.orderStatus} 
                          onChange={(e) => updateOrderStatus(order._id, e.target.value)} 
                          style={styles.select}
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { 
    padding: '3rem 1.5rem', 
    maxWidth: '1200px', 
    margin: '0 auto',
    minHeight: 'calc(100vh - 80px)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'var(--dark)',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: 'var(--gray)',
    fontSize: '1.1rem'
  },
  tabs: { 
    display: 'flex', 
    gap: '1rem', 
    marginBottom: '2rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  tab: { 
    padding: '1rem 2rem', 
    background: 'white', 
    border: '2px solid var(--border)',
    cursor: 'pointer', 
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    fontSize: '1rem',
    color: 'var(--gray)',
    transition: 'var(--transition)'
  },
  activeTab: { 
    padding: '1rem 2rem', 
    background: 'var(--primary)', 
    color: 'white', 
    border: '2px solid var(--primary)',
    cursor: 'pointer', 
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    fontSize: '1rem',
    boxShadow: 'var(--shadow-md)'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  card: {
    background: 'white',
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)'
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--dark)',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid var(--border)'
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1.5rem'
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
  submitBtn: { 
    padding: '1.25rem', 
    background: 'var(--success)', 
    color: 'white', 
    cursor: 'pointer', 
    borderRadius: 'var(--radius-md)',
    fontWeight: '700',
    fontSize: '1.05rem',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minHeight: '56px'
  },
  message: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '1rem'
  },
  loadingState: {
    display: 'flex',
    justifyContent: 'center',
    padding: '3rem'
  },
  noData: {
    textAlign: 'center',
    color: 'var(--gray)',
    padding: '3rem',
    fontSize: '1rem'
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  productItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    background: 'var(--light)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border)',
    transition: 'var(--transition)'
  },
  productIcon: {
    fontSize: '2.5rem'
  },
  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  productTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--dark)'
  },
  productMeta: {
    color: 'var(--gray)',
    fontSize: '0.95rem'
  },
  stockBadge: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  orderItem: {
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    transition: 'var(--transition)'
  },
  orderItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    background: 'var(--light)',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  orderItemId: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--dark)',
    marginBottom: '0.5rem'
  },
  orderCustomer: {
    color: 'var(--gray)',
    fontSize: '0.95rem',
    marginBottom: '0.25rem'
  },
  orderDate: {
    color: 'var(--gray)',
    fontSize: '0.9rem'
  },
  orderItemRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.75rem'
  },
  orderAmount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  statusBadge: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  orderItemBody: {
    padding: '1.5rem'
  },
  statusControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  statusLabel: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--dark)'
  },
  select: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    background: 'white',
    cursor: 'pointer',
    fontWeight: '600',
    color: 'var(--dark)',
    minWidth: '180px',
    transition: 'var(--transition)'
  }
}

export default AdminDashboard
