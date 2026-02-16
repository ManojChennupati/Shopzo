import { useState, useEffect } from 'react'
import { orderAPI } from '../services/api'

const Orders = () => {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data } = await orderAPI.getUserOrders()
      setOrders(data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={styles.container}>
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orders.map(order => (
          <div key={order._id} style={styles.order}>
            <h3>Order #{order._id.slice(-6)}</h3>
            <p>Status: {order.orderStatus}</p>
            <p>Payment: {order.paymentStatus}</p>
            <p>Total: ${order.totalAmount}</p>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <div style={styles.items}>
              {order.items.map((item, idx) => (
                <div key={idx}>
                  {item.titleSnapshot} x {item.quantity} - ${item.priceSnapshot}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  order: { border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' },
  items: { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }
}

export default Orders
