import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI } from '../services/api'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data } = await orderAPI.getUserOrders()
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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

  const getPaymentStatusColor = (status) => {
    const colors = {
      'PENDING': '#FFA500',
      'COMPLETED': 'var(--success)',
      'FAILED': 'var(--danger)'
    }
    return colors[status] || 'var(--gray)'
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner spinner-large" />
        <p style={styles.loadingText}>Loading orders...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📦 My Orders</h1>
        <Link to="/" style={styles.continueShopping}>← Continue Shopping</Link>
      </div>

      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📦</div>
          <h3 style={styles.emptyTitle}>No orders yet</h3>
          <p style={styles.emptyText}>Start shopping to see your orders here!</p>
          <Link to="/" style={styles.shopNowBtn}>
            Shop Now
          </Link>
        </div>
      ) : (
        <div style={styles.ordersList}>
          {orders.map(order => (
            <div key={order._id} style={styles.order} className="fade-in">
              <div style={styles.orderHeader}>
                <div style={styles.orderInfo}>
                  <h3 style={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p style={styles.orderDate}>
                    📅 {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div style={styles.orderBadges}>
                  <span style={{
                    ...styles.badge,
                    background: getStatusColor(order.orderStatus)
                  }}>
                    {order.orderStatus}
                  </span>
                  <span style={{
                    ...styles.badge,
                    background: getPaymentStatusColor(order.paymentStatus)
                  }}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div style={styles.orderBody}>
                <div style={styles.itemsList}>
                  <h4 style={styles.itemsTitle}>Items:</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={styles.orderItem}>
                      <div style={styles.itemIcon}>📦</div>
                      <div style={styles.itemInfo}>
                        <span style={styles.itemName}>{item.titleSnapshot}</span>
                        <span style={styles.itemQuantity}>Qty: {item.quantity}</span>
                      </div>
                      <span style={styles.itemPrice}>₹{item.priceSnapshot.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={styles.orderFooter}>
                  <div style={styles.shippingInfo}>
                    <span style={styles.shippingLabel}>📍 Shipping to:</span>
                    <span style={styles.shippingAddress}>
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </span>
                  </div>
                  <div style={styles.totalSection}>
                    <span style={styles.totalLabel}>Total Amount:</span>
                    <span style={styles.totalAmount}>₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: { 
    padding: '3rem 1.5rem', 
    maxWidth: '1000px', 
    margin: '0 auto',
    minHeight: 'calc(100vh - 80px)'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 80px)',
    gap: '1rem'
  },
  loadingText: {
    color: 'var(--gray)',
    fontSize: '1.1rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'var(--dark)'
  },
  continueShopping: {
    color: 'var(--primary)',
    fontWeight: '600',
    fontSize: '1rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)'
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1.5rem'
  },
  emptyTitle: {
    fontSize: '1.75rem',
    fontWeight: '600',
    color: 'var(--dark)',
    marginBottom: '0.75rem'
  },
  emptyText: {
    color: 'var(--gray)',
    fontSize: '1.1rem',
    marginBottom: '2rem'
  },
  shopNowBtn: {
    display: 'inline-block',
    padding: '1rem 2.5rem',
    background: 'var(--primary)',
    color: 'white',
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    fontSize: '1.05rem',
    transition: 'var(--transition)'
  },
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  order: { 
    background: 'white',
    border: '1px solid var(--border)', 
    borderRadius: 'var(--radius-lg)', 
    boxShadow: 'var(--shadow)',
    overflow: 'hidden',
    transition: 'var(--transition)'
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    background: 'var(--light)',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  orderInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  orderId: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--dark)'
  },
  orderDate: {
    color: 'var(--gray)',
    fontSize: '0.95rem'
  },
  orderBadges: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  badge: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  orderBody: {
    padding: '1.5rem'
  },
  itemsList: {
    marginBottom: '1.5rem'
  },
  itemsTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--dark)',
    marginBottom: '1rem'
  },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'var(--light)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '0.75rem'
  },
  itemIcon: {
    fontSize: '1.5rem'
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1
  },
  itemName: {
    fontWeight: '600',
    color: 'var(--dark)',
    fontSize: '0.95rem'
  },
  itemQuantity: {
    color: 'var(--gray)',
    fontSize: '0.85rem'
  },
  itemPrice: {
    fontWeight: '700',
    color: 'var(--primary)',
    fontSize: '1rem'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: '1.5rem',
    borderTop: '1px solid var(--border)',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  shippingInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  shippingLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--dark)'
  },
  shippingAddress: {
    fontSize: '0.9rem',
    color: 'var(--gray)'
  },
  totalSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem'
  },
  totalLabel: {
    fontSize: '0.9rem',
    color: 'var(--gray)'
  },
  totalAmount: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--primary)'
  }
}

export default Orders
