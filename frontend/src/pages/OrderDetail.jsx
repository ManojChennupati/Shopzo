import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orderAPI } from '../services/api'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const { data } = await orderAPI.getById(id)
      console.log('Order data:', data)
      console.log('First item:', data.items[0])
      setOrder(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PLACED: '#3B82F6',
      SHIPPED: '#F59E0B', 
      DELIVERED: '#10B981',
      CANCELLED: '#EF4444'
    }
    return colors[status] || '#6B7280'
  }

  const getStatusIcon = (status) => {
    const icons = {
      PLACED: '📋',
      SHIPPED: '🚚',
      DELIVERED: '✅',
      CANCELLED: '❌'
    }
    return icons[status] || '📦'
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div className="spinner" style={styles.spinner}></div>
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>😞</div>
          <h2>Order Not Found</h2>
          <p>{error || 'The order you\'re looking for doesn\'t exist.'}</p>
          <Link to="/orders" className="btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/orders')} style={styles.backButton}>
          ← Back to Orders
        </button>
        <div style={styles.orderHeader}>
          <h1 style={styles.orderTitle}>Order #{order._id.slice(-8).toUpperCase()}</h1>
          <div style={styles.orderMeta}>
            <span style={styles.orderDate}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        {/* Status Section */}
        <div style={styles.statusSection} className="od-responsive-status-grid">
          <div style={styles.statusCard}>
            <div style={styles.statusHeader}>
              <span style={styles.statusIcon}>{getStatusIcon(order.orderStatus)}</span>
              <div>
                <h3 style={styles.statusTitle}>Order Status</h3>
                <span style={{...styles.statusValue, color: getStatusColor(order.orderStatus)}}>
                  {order.orderStatus}
                </span>
              </div>
            </div>
          </div>
          
          <div style={styles.statusCard}>
            <div style={styles.statusHeader}>
              <span style={styles.statusIcon}>💳</span>
              <div>
                <h3 style={styles.statusTitle}>Payment Status</h3>
                <span style={{
                  ...styles.statusValue, 
                  color: order.paymentStatus === 'PAID' ? '#10B981' : '#F59E0B'
                }}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.statusCard}>
            <div style={styles.statusHeader}>
              <span style={styles.statusIcon}>💰</span>
              <div>
                <h3 style={styles.statusTitle}>Total Amount</h3>
                <span style={styles.totalAmount}>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📦 Items Ordered ({order.items.length})</h2>
          <div style={styles.itemsContainer}>
            {order.items.map((item, idx) => {
              // Debug log to see what data we have
              console.log(`Item ${idx}:`, item);
              
              // Try multiple fallback options for the image
              let thumbnailUrl = null;
              
              if (item.thumbnailSnapshot) {
                thumbnailUrl = item.thumbnailSnapshot;
              } else if (item.productId && typeof item.productId === 'object' && item.productId.thumbnail) {
                thumbnailUrl = item.productId.thumbnail;
              } else if (item.productId && typeof item.productId === 'string') {
                // If productId is not populated, we can't get the thumbnail
                console.log('ProductId not populated:', item.productId);
              }
              
              console.log(`Using thumbnail URL: ${thumbnailUrl}`);
              
              return (
                <div key={idx} style={styles.itemCard} className="od-responsive-item-card">
                  <div style={styles.itemImageContainer} className="od-responsive-item-image">
                    {thumbnailUrl ? (
                      <img 
                        src={thumbnailUrl} 
                        alt={item.titleSnapshot}
                        style={styles.itemImage}
                        onError={(e) => {
                          console.log('Image failed to load:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      ...styles.imagePlaceholder,
                      display: thumbnailUrl ? 'none' : 'flex'
                    }}>
                      📦
                    </div>
                  </div>
                  <div style={styles.itemInfo} className="od-responsive-item-info">
                    <h4 style={styles.itemName}>{item.titleSnapshot}</h4>
                    <div style={styles.itemDetails}>
                      <span style={styles.itemQuantity}>Quantity: {item.quantity}</span>
                      <span style={styles.itemPrice}>₹{item.priceSnapshot.toFixed(2)} each</span>
                    </div>
                  </div>
                  <div style={styles.itemTotal} className="od-responsive-item-total">
                    ₹{(item.priceSnapshot * item.quantity).toFixed(2)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Shipping Address */}
        {order.ShippingAddress && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📍 Shipping Address</h2>
            <div style={styles.addressCard}>
              <div style={styles.addressContent}>
                <p style={styles.addressLine}>{order.ShippingAddress.street}</p>
                <p style={styles.addressLine}>
                  {order.ShippingAddress.city}, {order.ShippingAddress.state}
                </p>
                <p style={styles.addressLine}>
                  {order.ShippingAddress.country} - {order.ShippingAddress.zipCode}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>💳 Payment Method</h2>
          <div style={styles.paymentCard}>
            <span style={styles.paymentMethod}>
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}
            </span>
          </div>
        </div>

        {/* Order Summary */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📊 Order Summary</h2>
          <div style={styles.summaryCard}>
            <div style={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Shipping</span>
              <span style={{color: '#10B981', fontWeight: '600'}}>FREE</span>
            </div>
            <div style={styles.summaryDivider}></div>
            <div style={styles.summaryTotal}>
              <span>Total</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 64px)',
    background: 'var(--gray-50)',
    padding: 'var(--space-6)'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: 'var(--space-4)'
  },
  spinner: {
    width: '40px',
    height: '40px'
  },
  errorContainer: {
    textAlign: 'center',
    padding: 'var(--space-16)',
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow)',
    maxWidth: '500px',
    margin: '0 auto'
  },
  errorIcon: {
    fontSize: 'var(--font-size-5xl)',
    marginBottom: 'var(--space-4)'
  },
  header: {
    maxWidth: '1200px',
    margin: '0 auto var(--space-8)'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: 'var(--font-size-base)',
    cursor: 'pointer',
    marginBottom: 'var(--space-4)',
    padding: 'var(--space-2) 0'
  },
  orderHeader: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--gray-200)'
  },
  orderTitle: {
    fontSize: 'var(--font-size-3xl)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-2)'
  },
  orderMeta: {
    display: 'flex',
    gap: 'var(--space-4)'
  },
  orderDate: {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-size-base)'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-8)'
  },
  statusSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 'var(--space-4)'
  },
  statusCard: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--gray-200)'
  },
  statusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)'
  },
  statusIcon: {
    fontSize: 'var(--font-size-3xl)'
  },
  statusTitle: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)',
    marginBottom: 'var(--space-1)'
  },
  statusValue: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  totalAmount: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  section: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-8)',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--gray-200)'
  },
  sectionTitle: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-6)'
  },
  itemsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  },
  itemCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-4)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)'
  },
  itemImageContainer: {
    flexShrink: 0,
    width: '80px',
    height: '80px',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '1px solid var(--gray-200)'
  },
  itemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--gray-100)',
    fontSize: '24px',
    color: 'var(--gray-400)'
  },
  itemInfo: {
    flex: 1,
    minWidth: 0
  },
  itemName: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-2)'
  },
  itemDetails: {
    display: 'flex',
    gap: 'var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)'
  },
  itemQuantity: {
    fontWeight: '500'
  },
  itemPrice: {
    fontWeight: '500'
  },
  itemTotal: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '700',
    color: 'var(--primary)',
    flexShrink: 0
  },
  addressCard: {
    padding: 'var(--space-4)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)'
  },
  addressContent: {
    fontSize: 'var(--font-size-base)',
    lineHeight: '1.6'
  },
  addressLine: {
    color: 'var(--gray-700)',
    marginBottom: 'var(--space-1)'
  },
  paymentCard: {
    padding: 'var(--space-4)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)'
  },
  paymentMethod: {
    fontSize: 'var(--font-size-base)',
    fontWeight: '600',
    color: 'var(--gray-700)'
  },
  summaryCard: {
    padding: 'var(--space-6)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-3)',
    fontSize: 'var(--font-size-base)',
    color: 'var(--gray-700)'
  },
  summaryDivider: {
    height: '1px',
    background: 'var(--gray-300)',
    margin: 'var(--space-4) 0'
  },
  summaryTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 'var(--font-size-xl)',
    fontWeight: '700',
    color: 'var(--gray-900)'
  }
}

export default OrderDetail