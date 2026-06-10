import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderAPI } from '../services/api'
import Icon from '../components/Icon'

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
      'PLACED': '#F59E0B',
      'SHIPPED': '#3B82F6',
      'DELIVERED': '#10B981',
      'CANCELLED': '#EF4444'
    }
    return colors[status] || '#6B7280'
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      'PENDING': '#F59E0B',
      'COMPLETED': '#10B981',
      'FAILED': '#EF4444'
    }
    return colors[status] || '#6B7280'
  }

  if (loading) {
    return (
      <div className="orders-loading">
        <Icon name="loader" size={40} />
        <p>Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-inner">
        <div className="orders-page-header">
          <h1 className="orders-page-title">
            <Icon name="package" size={28} />
            My Orders
          </h1>
          <Link to="/" className="cart-back-link">
            <Icon name="arrowLeft" size={16} />
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <Icon name="package" size={44} />
            </div>
            <h3 className="orders-empty-title">No orders yet</h3>
            <p className="orders-empty-text">Start shopping to see your orders here!</p>
            <Link to="/" className="orders-shop-btn">
              <Icon name="shoppingBag" size={18} />
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div
                key={order._id}
                className="order-card fade-in"
                style={{ borderLeftColor: getStatusColor(order.orderStatus) }}
              >
                {/* Order Header */}
                <div className="order-card-head">
                  <div className="order-meta">
                    <div className="order-number">Order #{order._id.slice(-8).toUpperCase()}</div>
                    <div className="order-date-row">
                      <Icon name="calendar" size={13} />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="order-badges">
                    <span
                      className="order-status-pill"
                      style={{ background: getStatusColor(order.orderStatus) }}
                    >
                      {order.orderStatus}
                    </span>
                    <span
                      className="order-status-pill"
                      style={{ background: getPaymentStatusColor(order.paymentStatus) }}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order Body */}
                <div className="order-card-body">
                  <div className="order-items-label">Items</div>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <div className="order-item-icon-box">
                        <Icon name="package" size={16} />
                      </div>
                      <span className="order-item-name">{item.titleSnapshot}</span>
                      <span className="order-item-qty">×{item.quantity}</span>
                      <span className="order-item-price">₹{item.priceSnapshot.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="order-card-footer">
                  <div className="order-shipping-info">
                    <div className="order-shipping-label">
                      <Icon name="mapPin" size={12} />
                      Shipping to
                    </div>
                    <div className="order-shipping-address">
                      {order.ShippingAddress?.street}, {order.ShippingAddress?.city},{' '}
                      {order.ShippingAddress?.state} {order.ShippingAddress?.zipCode}
                    </div>
                  </div>
                  <div className="order-total-section">
                    <span className="order-total-label">Total Amount</span>
                    <span className="order-total-amount">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
