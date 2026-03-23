import { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { cartAPI } from '../services/api'
import { CartContext } from '../context/CartContext'

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
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
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId, quantity) => {
    setUpdating(prev => ({ ...prev, [productId]: true }))
    try {
      const { data } = await cartAPI.update({ productId, quantity })
      setCart(data.cart)
      updateCartCount(data.cart.totalItems)
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }))
    }
  }

  const removeItem = async (productId) => {
    setUpdating(prev => ({ ...prev, [productId]: true }))
    try {
      const { data } = await cartAPI.remove(productId)
      setCart(data.cart)
      updateCartCount(data.cart.totalItems)
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }))
    }
  }

  const total = cart.items.reduce((sum, item) => sum + (item.priceAtAddTime * item.quantity), 0)

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner spinner-large" />
        <p style={styles.loadingText}>Loading cart...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛒 Shopping Cart</h1>
        <Link to="/" style={styles.continueShopping}>← Continue Shopping</Link>
      </div>

      {cart.items.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🛒</div>
          <h3 style={styles.emptyTitle}>Your cart is empty</h3>
          <p style={styles.emptyText}>Add some products to get started!</p>
          <Link to="/" style={styles.shopNowBtn}>
            Shop Now
          </Link>
        </div>
      ) : (
        <div style={styles.cartLayout}>
          <div style={styles.itemsSection}>
            <div style={styles.itemsHeader}>
              <h2 style={styles.itemsTitle}>Items ({cart.totalItems})</h2>
            </div>
            {cart.items.map(item => (
              <div key={item.productId._id} style={styles.item} className="fade-in">
                <Link to={`/products/${item.productId._id}`} style={styles.itemImage}>
                  <div style={styles.imagePlaceholder}>📦</div>
                </Link>
                
                <div style={styles.itemDetails}>
                  <Link to={`/products/${item.productId._id}`} style={styles.itemTitle}>
                    {item.productId.title}
                  </Link>
                  <p style={styles.itemPrice}>₹{item.priceAtAddTime.toFixed(2)} each</p>
                </div>

                <div style={styles.itemActions}>
                  <div style={styles.quantityControls}>
                    <button
                      onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating[item.productId._id]}
                      style={styles.quantityBtn}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span style={styles.quantityDisplay}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                      disabled={updating[item.productId._id]}
                      style={styles.quantityBtn}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div style={styles.itemTotal}>
                    ₹{(item.priceAtAddTime * item.quantity).toFixed(2)}
                  </div>

                  <button 
                    onClick={() => removeItem(item.productId._id)} 
                    disabled={updating[item.productId._id]}
                    style={styles.removeBtn}
                    aria-label="Remove item"
                  >
                    {updating[item.productId._id] ? <span className="spinner" /> : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.summarySection}>
            <div style={styles.summary}>
              <h2 style={styles.summaryTitle}>Order Summary</h2>
              
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Subtotal</span>
                <span style={styles.summaryValue}>₹{total.toFixed(2)}</span>
              </div>

              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Shipping</span>
                <span style={styles.summaryValue}>Calculated at checkout</span>
              </div>

              <div style={styles.summaryDivider} />

              <div style={styles.summaryRow}>
                <span style={styles.summaryTotalLabel}>Total</span>
                <span style={styles.summaryTotalValue}>₹{total.toFixed(2)}</span>
              </div>

              <button 
                onClick={() => navigate('/checkout')} 
                style={styles.checkoutBtn}
              >
                Proceed to Checkout →
              </button>

              <p style={styles.secureText}>🔒 Secure checkout</p>
            </div>
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
  cartLayout: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
    alignItems: 'flex-start'
  },
  itemsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  itemsHeader: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)'
  },
  itemsTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--dark)'
  },
  item: { 
    background: 'white', 
    border: '1px solid var(--border)', 
    padding: '1.5rem', 
    display: 'grid',
    gridTemplateColumns: '100px 1fr auto',
    gap: '1.5rem',
    alignItems: 'center', 
    borderRadius: 'var(--radius-lg)', 
    boxShadow: 'var(--shadow)',
    transition: 'var(--transition)'
  },
  itemImage: {
    width: '100px',
    height: '100px',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    color: 'white'
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  itemTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--dark)',
    transition: 'var(--transition)'
  },
  itemPrice: {
    color: 'var(--gray)',
    fontSize: '0.95rem'
  },
  itemActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '1rem'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'var(--light)',
    padding: '0.5rem',
    borderRadius: 'var(--radius-md)'
  },
  quantityBtn: {
    width: '32px',
    height: '32px',
    background: 'white',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'var(--transition)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  quantityDisplay: {
    minWidth: '40px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '1rem'
  },
  itemTotal: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  removeBtn: { 
    background: 'transparent',
    color: 'var(--danger)', 
    padding: '0.5rem',
    borderRadius: 'var(--radius-sm)', 
    fontWeight: '600',
    fontSize: '1.25rem',
    cursor: 'pointer',
    transition: 'var(--transition)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    minHeight: '40px'
  },
  summarySection: {
    position: 'sticky',
    top: '100px'
  },
  summary: {
    background: 'white',
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  summaryTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--dark)',
    marginBottom: '0.5rem'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryLabel: {
    color: 'var(--gray)',
    fontSize: '1rem'
  },
  summaryValue: {
    color: 'var(--dark)',
    fontWeight: '600',
    fontSize: '1rem'
  },
  summaryDivider: {
    height: '1px',
    background: 'var(--border)',
    margin: '0.5rem 0'
  },
  summaryTotalLabel: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--dark)'
  },
  summaryTotalValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  checkoutBtn: { 
    background: 'var(--success)', 
    color: 'white', 
    padding: '1.25rem', 
    borderRadius: 'var(--radius-md)', 
    fontSize: '1.1rem', 
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'var(--transition)',
    marginTop: '0.5rem'
  },
  secureText: {
    textAlign: 'center',
    color: 'var(--gray)',
    fontSize: '0.9rem',
    marginTop: '-0.5rem'
  }
}

export default Cart
