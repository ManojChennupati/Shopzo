import { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { cartAPI } from '../services/api'
import { CartContext } from '../context/CartContext'

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalItems: 0 })
  const { updateCartCount } = useContext(CartContext)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const { data } = await cartAPI.get()
      setCart(data)
      updateCartCount(data.totalItems || 0)
    } catch (err) {
      console.error(err)
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await cartAPI.update({ productId, quantity })
      setCart(data.cart)
      updateCartCount(data.cart.totalItems)
    } catch (err) {
      console.error(err)
    }
  }

  const removeItem = async (productId) => {
    try {
      const { data } = await cartAPI.remove(productId)
      setCart(data.cart)
      updateCartCount(data.cart.totalItems)
    } catch (err) {
      console.error(err)
    }
  }

  const total = cart.items.reduce((sum, item) => sum + (item.priceAtAddTime * item.quantity), 0)

  return (
    <div style={styles.container}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem', color: 'var(--dark)' }}>Shopping Cart</h1>
      {cart.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--gray)', marginBottom: '1rem' }}>Your cart is empty</h3>
          <p style={{ color: 'var(--gray)' }}>Add some products to get started!</p>
        </div>
      ) : (
        <>
          {cart.items.map(item => (
            <div key={item.productId._id} style={styles.item}>
              <h3>{item.productId.title}</h3>
              <p>${item.priceAtAddTime}</p>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.productId._id, Number(e.target.value))}
                style={styles.input}
              />
              <button onClick={() => removeItem(item.productId._id)} style={styles.removeBtn}>Remove</button>
            </div>
          ))}
          <div style={styles.total}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem', color: 'var(--gray)' }}>Subtotal:</span>
              <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>${total.toFixed(2)}</span>
            </div>
            <button onClick={() => navigate('/checkout')} style={styles.checkoutBtn}>Proceed to Checkout →</button>
          </div>
        </>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' },
  item: { background: 'white', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px', boxShadow: 'var(--shadow)' },
  input: { width: '70px', padding: '0.6rem', border: '2px solid var(--border)', borderRadius: '6px', textAlign: 'center', fontSize: '1rem', fontWeight: '600' },
  removeBtn: { background: 'var(--danger)', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: '600' },
  total: { marginTop: '2rem', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow)' },
  checkoutBtn: { background: 'var(--success)', color: 'white', border: 'none', padding: '1.25rem 3rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '700', marginTop: '1rem', width: '100%' }
}

export default Cart
