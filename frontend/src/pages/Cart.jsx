import { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { cartAPI } from '../services/api'
import { CartContext } from '../context/CartContext'
import Icon from '../components/Icon'

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
      <div className="cart-loading">
        <Icon name="loader" size={40} />
        <p>Loading cart...</p>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-inner">
        <div className="cart-page-header">
          <h1 className="cart-page-title">
            <Icon name="cart" size={28} />
            Shopping Cart
          </h1>
          <Link to="/" className="cart-back-link">
            <Icon name="arrowLeft" size={16} />
            Continue Shopping
          </Link>
        </div>

        {cart.items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <Icon name="cart" size={44} />
            </div>
            <h3 className="cart-empty-title">Your cart is empty</h3>
            <p className="cart-empty-text">Add some products to get started!</p>
            <Link to="/" className="cart-shop-btn">
              <Icon name="shoppingBag" size={18} />
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div className="cart-items-section">
              <div className="cart-items-heading">Items ({cart.totalItems})</div>
              {cart.items.map(item => (
                <div key={item.productId._id} className="cart-item-card fade-in">
                  <Link to={`/products/${item.productId._id}`} className="cart-item-thumbnail">
                    <div className="cart-item-thumbnail-placeholder">
                      <Icon name="package" size={28} />
                    </div>
                  </Link>

                  <div className="cart-item-info">
                    <Link to={`/products/${item.productId._id}`} className="cart-item-name">
                      {item.productId.title}
                    </Link>
                    <p className="cart-item-unit-price">₹{item.priceAtAddTime.toFixed(2)} each</p>
                  </div>

                  <div className="cart-item-controls">
                    <div className="cart-qty-controls">
                      <button
                        onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updating[item.productId._id]}
                        className="cart-qty-btn"
                        aria-label="Decrease quantity"
                      >−</button>
                      <span className="cart-qty-display">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                        disabled={updating[item.productId._id]}
                        className="cart-qty-btn"
                        aria-label="Increase quantity"
                      >+</button>
                    </div>

                    <div className="cart-item-subtotal">
                      ₹{(item.priceAtAddTime * item.quantity).toFixed(2)}
                    </div>

                    <button
                      onClick={() => removeItem(item.productId._id)}
                      disabled={updating[item.productId._id]}
                      className="cart-remove-btn"
                      aria-label="Remove item"
                    >
                      {updating[item.productId._id]
                        ? <Icon name="loader" size={16} />
                        : <Icon name="trash" size={16} />
                      }
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="cart-summary-card">
              <h2 className="cart-summary-title">Order Summary</h2>

              <div className="cart-summary-row">
                <span className="cart-summary-label">Subtotal</span>
                <span className="cart-summary-value">₹{total.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span className="cart-summary-label">Shipping</span>
                <span className="cart-summary-value">Calculated at checkout</span>
              </div>

              <div className="cart-summary-divider" />

              <div className="cart-summary-row">
                <span className="cart-summary-total-label">Total</span>
                <span className="cart-summary-total-value">₹{total.toFixed(2)}</span>
              </div>

              <button onClick={() => navigate('/checkout')} className="cart-checkout-btn">
                <Icon name="shoppingBag" size={20} />
                Proceed to Checkout
              </button>

              <p className="cart-secure-note">
                <Icon name="shield" size={14} />
                Secure checkout — your data is protected
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
