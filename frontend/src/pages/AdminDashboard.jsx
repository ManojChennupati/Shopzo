import { useState, useEffect } from 'react'
import { productAPI, orderAPI } from '../services/api'

const AdminDashboard = () => {
  const [view, setView] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    price: '', 
    stock: '',
    brand: '',
    category: '',
    discountPercentage: '',
    thumbnail: '',
    images: ''
  })
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

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

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    
    try {
      const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_API_KEY', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        return data.data.url
      }
      throw new Error('Upload failed')
    } catch (err) {
      console.error('Image upload error:', err)
      throw err
    }
  }

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select an image file', type: 'error' })
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Image size should be less than 5MB', type: 'error' })
      return
    }
    
    setUploadingThumbnail(true)
    try {
      // Create a local preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm({ ...form, thumbnail: reader.result })
      }
      reader.readAsDataURL(file)
      
      setMessage({ text: 'Image loaded! You can use this or upload to get permanent URL', type: 'success' })
    } catch (err) {
      setMessage({ text: 'Failed to load image', type: 'error' })
    } finally {
      setUploadingThumbnail(false)
    }
  }

  const handleMultipleImagesUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    const invalidFiles = files.filter(f => !f.type.startsWith('image/'))
    if (invalidFiles.length > 0) {
      setMessage({ text: 'Please select only image files', type: 'error' })
      return
    }
    
    const largeFiles = files.filter(f => f.size > 5 * 1024 * 1024)
    if (largeFiles.length > 0) {
      setMessage({ text: 'All images should be less than 5MB', type: 'error' })
      return
    }
    
    setUploadingImages(true)
    try {
      const imageUrls = []
      for (const file of files) {
        const reader = new FileReader()
        const result = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(file)
        })
        imageUrls.push(result)
      }
      
      setForm({ ...form, images: imageUrls.join(', ') })
      setMessage({ text: `${files.length} images loaded!`, type: 'success' })
    } catch (err) {
      setMessage({ text: 'Failed to load images', type: 'error' })
    } finally {
      setUploadingImages(false)
    }
  }

  const createProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const productData = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        brand: form.brand || '',
        category: form.category || '',
        discountPercentage: form.discountPercentage ? parseFloat(form.discountPercentage) : 0,
        thumbnail: form.thumbnail || '',
        images: form.images ? form.images.split(',').map(url => url.trim()).filter(url => url) : []
      }
      
      if (editingProduct) {
        await productAPI.update(editingProduct._id, productData)
        setMessage({ text: '✓ Product updated successfully!', type: 'success' })
        setEditingProduct(null)
      } else {
        await productAPI.create(productData)
        setMessage({ text: '✓ Product created successfully!', type: 'success' })
      }
      
      setForm({ 
        title: '', 
        description: '', 
        price: '', 
        stock: '',
        brand: '',
        category: '',
        discountPercentage: '',
        thumbnail: '',
        images: ''
      })
      fetchProducts()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: editingProduct ? 'Failed to update product' : 'Failed to create product', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      brand: product.brand || '',
      category: product.category || '',
      discountPercentage: product.discountPercentage ? product.discountPercentage.toString() : '',
      thumbnail: product.thumbnail || '',
      images: Array.isArray(product.images) ? product.images.join(', ') : ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setForm({ 
      title: '', 
      description: '', 
      price: '', 
      stock: '',
      brand: '',
      category: '',
      discountPercentage: '',
      thumbnail: '',
      images: ''
    })
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
        >
          📦 Products
        </button>
        <button 
          onClick={() => setView('orders')} 
          style={view === 'orders' ? styles.activeTab : styles.tab}
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
        }}>
          {message.text}
        </div>
      )}

      {view === 'products' && (
        <div style={styles.content}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
            <form onSubmit={createProduct} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Product Title *</label>
                <input 
                  type="text" 
                  placeholder="iPhone 15 Pro Max" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  style={styles.input} 
                  required 
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Description *</label>
                <textarea 
                  placeholder="Detailed product description..." 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  style={{...styles.input, minHeight: '100px', resize: 'vertical'}} 
                  required 
                />
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Price (₹) *</label>
                  <input 
                    type="number" 
                    placeholder="99999.00" 
                    value={form.price} 
                    onChange={(e) => setForm({ ...form, price: e.target.value })} 
                    style={styles.input} 
                    min="0"
                    step="0.01"
                    required 
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Stock Quantity *</label>
                  <input 
                    type="number" 
                    placeholder="100" 
                    value={form.stock} 
                    onChange={(e) => setForm({ ...form, stock: e.target.value })} 
                    style={styles.input} 
                    min="0"
                    required 
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Brand</label>
                  <input 
                    type="text" 
                    placeholder="Apple, Samsung, etc." 
                    value={form.brand} 
                    onChange={(e) => setForm({ ...form, brand: e.target.value })} 
                    style={styles.input} 
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Category</label>
                  <input 
                    type="text" 
                    placeholder="Electronics, Clothing, etc." 
                    value={form.category} 
                    onChange={(e) => setForm({ ...form, category: e.target.value })} 
                    style={styles.input} 
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Discount Percentage (%)</label>
                <input 
                  type="number" 
                  placeholder="10" 
                  value={form.discountPercentage} 
                  onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} 
                  style={styles.input} 
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div style={styles.divider}></div>

              <h3 style={styles.sectionTitle}>🖼️ Product Images</h3>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Thumbnail Image</label>
                <div style={styles.uploadContainer}>
                  <input 
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    style={{display: 'none'}}
                    id="thumbnailUpload"
                  />
                  <label htmlFor="thumbnailUpload" style={{
                    ...styles.uploadBox,
                    ...(uploadingThumbnail && styles.uploadBoxLoading)
                  }}>
                    <div style={styles.uploadIcon}>{uploadingThumbnail ? '⏳' : '📤'}</div>
                    <div style={styles.uploadText}>
                      {uploadingThumbnail ? 'Uploading...' : 'Upload'}
                    </div>
                    <div style={styles.uploadSubtext}>Click or drag & drop</div>
                  </label>
                </div>
                <input 
                  type="url" 
                  placeholder="Or paste image URL" 
                  value={form.thumbnail} 
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} 
                  style={styles.input} 
                />
                <p style={styles.helpText}>Max 5MB • JPG, PNG, WebP</p>
                {form.thumbnail && (
                  <div style={styles.previewContainer}>
                    <img src={form.thumbnail} alt="Preview" style={styles.previewImage} onError={(e) => e.target.style.display = 'none'} />
                    <button type="button" onClick={() => setForm({ ...form, thumbnail: '' })} style={styles.removeBtn}>✕</button>
                  </div>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Additional Images</label>
                <div style={styles.uploadContainer}>
                  <input 
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImagesUpload}
                    style={{display: 'none'}}
                    id="imagesUpload"
                  />
                  <label htmlFor="imagesUpload" style={{
                    ...styles.uploadBox,
                    ...(uploadingImages && styles.uploadBoxLoading)
                  }}>
                    <div style={styles.uploadIcon}>{uploadingImages ? '⏳' : '📤'}</div>
                    <div style={styles.uploadText}>
                      {uploadingImages ? 'Uploading...' : 'Upload'}
                    </div>
                    <div style={styles.uploadSubtext}>Multiple files supported</div>
                  </label>
                </div>
                <textarea 
                  placeholder="Or paste URLs separated by commas" 
                  value={form.images} 
                  onChange={(e) => setForm({ ...form, images: e.target.value })} 
                  style={{...styles.input, minHeight: '80px'}} 
                />
                <p style={styles.helpText}>Upload multiple images or paste URLs</p>
              </div>

              <button type="submit" disabled={loading} style={styles.submitBtn}>
                {loading ? <span className="spinner" /> : (editingProduct ? '💾 Update Product' : '➕ Add Product')}
              </button>
              
              {editingProduct && (
                <button type="button" onClick={handleCancelEdit} style={styles.cancelBtn}>
                  ✕ Cancel Edit
                </button>
              )}
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
                    {p.thumbnail ? (
                      <img src={p.thumbnail} alt={p.title} style={styles.productImage} />
                    ) : (
                      <div style={styles.productIcon}>📦</div>
                    )}
                    <div style={styles.productInfo}>
                      <h3 style={styles.productTitle}>{p.title}</h3>
                      <p style={styles.productMeta}>
                        Price: <strong>₹{p.price}</strong> | Stock: <strong>{p.stock}</strong>
                      </p>
                      {p.brand && <p style={styles.productBrand}>Brand: {p.brand}</p>}
                    </div>
                    <div style={styles.productActions}>
                      <div style={{
                        ...styles.stockBadge,
                        background: p.stock > 10 ? 'var(--success)' : p.stock > 0 ? '#FFA500' : 'var(--danger)'
                      }}>
                        {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </div>
                      <button 
                        onClick={() => handleEditProduct(p)} 
                        style={styles.editBtn}
                      >
                        ✏️ Edit
                      </button>
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
                        <label style={styles.statusLabel}>Update Status:</label>
                        <select 
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
  container: { padding: '3rem 1.5rem', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' },
  header: { textAlign: 'center', marginBottom: '3rem' },
  title: { fontSize: '2.5rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '0.5rem' },
  subtitle: { color: 'var(--gray)', fontSize: '1.1rem' },
  tabs: { display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' },
  tab: { padding: '1rem 2rem', background: 'white', border: '2px solid var(--border)', cursor: 'pointer', borderRadius: 'var(--radius-md)', fontWeight: '600', fontSize: '1rem', color: 'var(--gray)' },
  activeTab: { padding: '1rem 2rem', background: 'var(--primary)', color: 'white', border: '2px solid var(--primary)', cursor: 'pointer', borderRadius: 'var(--radius-md)', fontWeight: '600', fontSize: '1rem', boxShadow: 'var(--shadow-md)' },
  content: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  card: { background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)' },
  cardTitle: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid var(--border)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },
  row: { display: 'flex', gap: '1rem' },
  label: { fontSize: '0.9rem', fontWeight: '600', color: 'var(--dark)' },
  input: { padding: '1rem', fontSize: '1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--light)' },
  divider: { height: '2px', background: 'var(--border)', margin: '1rem 0' },
  sectionTitle: { fontSize: '1.2rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '0.5rem' },
  helpText: { fontSize: '0.85rem', color: 'var(--gray)', marginTop: '0.5rem' },
  uploadContainer: { display: 'flex', gap: '1rem', marginBottom: '1rem' },
  uploadBox: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '2rem 3rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: '3px dashed rgba(255,255,255,0.3)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102,126,234,0.2)',
  },
  uploadBoxLoading: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  uploadIcon: { 
    fontSize: '3rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
  },
  uploadText: { 
    fontSize: '1.2rem', 
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  uploadSubtext: { 
    fontSize: '0.85rem', 
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500'
  },
  previewContainer: { 
    position: 'relative', 
    display: 'inline-block',
    marginTop: '1rem'
  },
  previewImage: { 
    width: '200px', 
    height: '200px', 
    objectFit: 'cover', 
    borderRadius: 'var(--radius-lg)', 
    border: '3px solid var(--border)',
    boxShadow: 'var(--shadow-md)'
  },
  removeBtn: { 
    position: 'absolute', 
    top: '-10px', 
    right: '-10px', 
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '50%', 
    width: '36px', 
    height: '36px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    fontSize: '1.2rem',
    boxShadow: '0 4px 12px rgba(245,87,108,0.4)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitBtn: { padding: '1.25rem', background: 'var(--success)', color: 'white', cursor: 'pointer', borderRadius: 'var(--radius-md)', fontWeight: '700', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', minHeight: '56px' },
  message: { padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: '600', textAlign: 'center', marginBottom: '1rem' },
  loadingState: { display: 'flex', justifyContent: 'center', padding: '3rem' },
  noData: { textAlign: 'center', color: 'var(--gray)', padding: '3rem', fontSize: '1rem' },
  productsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  productItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'var(--light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' },
  productImage: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' },
  productIcon: { fontSize: '2.5rem' },
  productInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  productTitle: { fontSize: '1.1rem', fontWeight: '600', color: 'var(--dark)' },
  productMeta: { color: 'var(--gray)', fontSize: '0.95rem' },
  productBrand: { color: 'var(--gray)', fontSize: '0.85rem', fontStyle: 'italic' },
  productActions: { display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' },
  stockBadge: { color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' },
  editBtn: {
    padding: '0.6rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
  },
  cancelBtn: {
    padding: '1.25rem',
    background: 'var(--gray)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1.05rem',
    transition: 'all 0.3s ease'
  },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  orderItem: { border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' },
  orderItemHeader: { display: 'flex', justifyContent: 'space-between', padding: '1.5rem', background: 'var(--light)', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: '1rem' },
  orderItemId: { fontSize: '1.1rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '0.5rem' },
  orderCustomer: { color: 'var(--gray)', fontSize: '0.95rem', marginBottom: '0.25rem' },
  orderDate: { color: 'var(--gray)', fontSize: '0.9rem' },
  orderItemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' },
  orderAmount: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' },
  statusBadge: { color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' },
  orderItemBody: { padding: '1.5rem' },
  statusControl: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  statusLabel: { fontSize: '1rem', fontWeight: '600', color: 'var(--dark)' },
  select: { padding: '0.75rem 1rem', fontSize: '1rem', border: '2px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer', fontWeight: '600', color: 'var(--dark)', minWidth: '180px' }
}

export default AdminDashboard
