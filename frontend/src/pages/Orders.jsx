import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../services/api'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data } = await orderAPI.getUserOrders()
      setOrders(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PLACED: 'var(--info)',
      SHIPPED: 'var(--warning)',
      DELIVERED: 'var(--success)',
      CANCELLED: 'var(--danger)'
    }
    return colors[status] || 'var(--gray-500)'
  }

  const getPaymentStatusColor = (status) => {
    return status === 'PAID' ? 'var(--success)' : 'var(--warning)'
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div className="spinner" style={styles.spinner}></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📦 My Orders</h1>
        <p style={styles.subtitle}>Track and manage your orders</p>
      </div>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📦</div>
          <h2 style={styles.emptyTitle}>No Orders Yet</h2>
          <p style={styles.emptyText}>
            You haven't placed any orders yet. Start shopping to see your orders here!
          </p>
          <a href="/" className="btn-primary btn-lg" style={styles.shopButton}>
            Start Shopping
          </a>
        </div>
      ) : (
        <div style={styles.ordersGrid}>
          {orders.map(order => (
            <div 
              key={order._id} 
              style={styles.orderCard}
              onClick={() => navigate(`/orders/${order._id}`)}
            >
              <div style={styles.orderHeader}>
                <div>
                  <h3 style={styles.orderNumber}>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div style={styles.orderTotal}>₹{order.totalAmount.toFixed(2)}</div>
              </div>

              <div style={styles.statusRow}>
                <div style={styles.statusBadge}>
                  <span style={styles.statusLabel}>Order Status:</span>
                  <span style={{
                    ...styles.statusValue,
                    color: getStatusColor(order.orderStatus)
                  }}>
                    {order.orderStatus}
                  </span>
                </div>
                <div style={styles.statusBadge}>
                  <span style={styles.statusLabel}>Payment:</span>
                  <span style={{
                    ...styles.statusValue,
                    color: getPaymentStatusColor(order.paymentStatus)
                  }}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div style={styles.itemsSection}>
                <h4 style={styles.itemsTitle}>Items ({order.items.length})</h4>
                <div style={styles.itemsList}>
                  {order.items.map((item, idx) => {
                    const thumbnailUrl = item.thumbnailSnapshot || (item.productId?.thumbnail);
                    
                    return (
                      <div key={idx} style={styles.orderItem}>
                        <div style={styles.itemWithImage}>
                          <div style={styles.itemImageSmall}>
                            {thumbnailUrl ? (
                              <img 
                                src={thumbnailUrl} 
                                alt={item.titleSnapshot}
                                style={styles.itemImageSmallImg}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div style={{
                              ...styles.itemImagePlaceholder,
                              display: thumbnailUrl ? 'none' : 'flex'
                            }}>
                              📦
                            </div>
                          </div>
                          <div style={styles.itemInfo}>
                            <span style={styles.itemName}>{item.titleSnapshot}</span>
                            <span style={styles.itemQuantity}>x{item.quantity}</span>
                          </div>
                        </div>
                        <span style={styles.itemPrice}>₹{(item.priceSnapshot * item.quantity).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {order.ShippingAddress && (
                <div style={styles.addressSection}>
                  <h4 style={styles.addressTitle}>📍 Shipping Address</h4>
                  <p style={styles.addressText}>
                    {order.ShippingAddress.street}, {order.ShippingAddress.city}<br />
                    {order.ShippingAddress.state}, {order.ShippingAddress.country} {order.ShippingAddress.zipCode}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { 
    minHeight: 'calc(100vh - 64px)',
    background: 'var(--gray-50)',
    padding: 'var(--space-8) var(--space-6)'
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
  header: {
    maxWidth: '1200px',
    margin: '0 auto var(--space-8)',
    textAlign: 'center'
  },
  title: {
    fontSize: 'var(--font-size-4xl)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-2)'
  },
  subtitle: {
    fontSize: 'var(--font-size-lg)',
    color: 'var(--gray-600)'
  },
  emptyState: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    padding: 'var(--space-16)',
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow)'
  },
  emptyIcon: {
    fontSize: 'var(--font-size-5xl)',
    marginBottom: 'var(--space-6)',
    opacity: 0.5
  },
  emptyTitle: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-4)'
  },
  emptyText: {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-size-base)',
    marginBottom: 'var(--space-8)',
    lineHeight: '1.6'
  },
  shopButton: {
    textDecoration: 'none'
  },
  ordersGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gap: 'var(--space-6)',
    gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))'
  },
  orderCard: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--gray-200)',
    padding: 'var(--space-6)',
    transition: 'all var(--transition-base)',
    cursor: 'pointer'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'var(--space-4)',
    paddingBottom: 'var(--space-4)',
    borderBottom: '1px solid var(--gray-200)'
  },
  orderNumber: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-1)'
  },
  orderDate: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-500)'
  },
  orderTotal: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  statusRow: {
    display: 'flex',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-4)',
    flexWrap: 'wrap'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-2) var(--space-4)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-sm)'
  },
  statusLabel: {
    color: 'var(--gray-600)',
    fontWeight: '500'
  },
  statusValue: {
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 'var(--font-size-xs)'
  },
  itemsSection: {
    marginBottom: 'var(--space-4)'
  },
  itemsTitle: {
    fontSize: 'var(--font-size-base)',
    fontWeight: '600',
    color: 'var(--gray-700)',
    marginBottom: 'var(--space-3)'
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)'
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'var(--space-3)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-size-sm)'
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    flex: 1
  },
  itemWithImage: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    flex: 1
  },
  itemImageSmall: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    border: '1px solid var(--gray-200)',
    flexShrink: 0
  },
  itemImageSmallImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--gray-100)',
    fontSize: '16px',
    color: 'var(--gray-400)'
  },
  itemName: {
    color: 'var(--gray-900)',
    fontWeight: '500'
  },
  itemQuantity: {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-size-xs)',
    padding: 'var(--space-1) var(--space-2)',
    background: 'white',
    borderRadius: 'var(--radius)',
    fontWeight: '600'
  },
  itemPrice: {
    color: 'var(--gray-900)',
    fontWeight: '600'
  },
  addressSection: {
    marginTop: 'var(--space-4)',
    paddingTop: 'var(--space-4)',
    borderTop: '1px solid var(--gray-200)'
  },
  addressTitle: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: '600',
    color: 'var(--gray-700)',
    marginBottom: 'var(--space-2)'
  },
  addressText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)',
    lineHeight: '1.6'
  }
}

export default Orders
