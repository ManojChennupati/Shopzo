import { useState, useEffect } from 'react'
import { productAPI, orderAPI } from '../services/api'

const AdminDashboard = () => {
  const [view, setView] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ title: '', description: '', price: '', stock: '' })

  useEffect(() => {
    if (view === 'products') fetchProducts()
    if (view === 'orders') fetchOrders()
  }, [view])

  const fetchProducts = async () => {
    const { data } = await productAPI.getAll({})
    setProducts(data.products)
  }

  const fetchOrders = async () => {
    const { data } = await orderAPI.getAll()
    setOrders(data)
  }

  const createProduct = async (e) => {
    e.preventDefault()
    try {
      await productAPI.create(form)
      setForm({ title: '', description: '', price: '', stock: '' })
      fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, { orderStatus: status })
      fetchOrders()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={styles.container}>
      <h1>Admin Dashboard</h1>
      <div style={styles.tabs}>
        <button onClick={() => setView('products')} style={view === 'products' ? styles.activeTab : styles.tab}>Products</button>
        <button onClick={() => setView('orders')} style={view === 'orders' ? styles.activeTab : styles.tab}>Orders</button>
      </div>

      {view === 'products' && (
        <div>
          <h2>Add Product</h2>
          <form onSubmit={createProduct} style={styles.form}>
            <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={styles.input} required />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={styles.input} required />
            <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={styles.input} required />
            <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={styles.input} required />
            <button type="submit" style={styles.button}>Add Product</button>
          </form>
          <h2>Products</h2>
          {products.map(p => (
            <div key={p._id} style={styles.item}>
              <h3>{p.title}</h3>
              <p>Price: ${p.price} | Stock: {p.stock}</p>
            </div>
          ))}
        </div>
      )}

      {view === 'orders' && (
        <div>
          <h2>Orders</h2>
          {orders.map(order => (
            <div key={order._id} style={styles.item}>
              <h3>Order #{order._id.slice(-6)}</h3>
              <p>Customer: {order.userId.name}</p>
              <p>Total: ${order.totalAmount}</p>
              <p>Status: {order.orderStatus}</p>
              <select value={order.orderStatus} onChange={(e) => updateOrderStatus(order._id, e.target.value)} style={styles.input}>
                <option value="PLACED">PLACED</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  tabs: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  tab: { padding: '0.75rem 1.5rem', background: '#ddd', border: 'none', cursor: 'pointer', borderRadius: '4px' },
  activeTab: { padding: '0.75rem 1.5rem', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxWidth: '600px' },
  input: { padding: '0.75rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '4px' },
  button: { padding: '0.75rem', background: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' },
  item: { border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }
}

export default AdminDashboard
