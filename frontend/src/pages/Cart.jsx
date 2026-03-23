import { useState, useEffect, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { cartAPI } from '../services/api'
import { CartContext } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import Icon from '../components/Icon'

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalItems: 0 })
  const [loading, setLoading] = useState(true)
  const [updatingItems, setUpdatingItems] = useState(new Set())
  const { updateCartCount } = useContext(CartContext)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const { data } = await cartAPI.get()
      // Ensure data structure is valid
      const validCart = {
        items: data?.items || [],
        totalItems: data?.totalItems || 0
      }
      setCart(validCart)
      updateCartCount(validCart.totalItems)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load cart')
      setCart({ items: [], totalItems: 0 })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return
    
    setUpdatingItems(prev => new Set(prev).add(productId))
    try {
      const { data } = await cartAPI.update({ productId, quantity })
      console.log('Cart update response:', data) // Debug log
      if (data.cart && data.cart.items) {
        setCart(data.cart)
        updateCartCount(data.cart.totalItems || 0)
      } else {
        throw new Error('Invalid cart data received')
      }
    } catch (err) {
      console.error('Update error:', err)
      toast.error(err.response?.data?.message || 'Failed to update quantity')
      fetchCart() // Refetch on error
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const removeItem = async (productId) => {
    setUpdatingItems(prev => new Set(prev).add(productId))
    try {
      const { data } = await cartAPI.remove(productId)
      setCart(data.cart || { items: [], totalItems: 0 })
      updateCartCount(data.cart?.totalItems || 0)
      toast.success('Item removed from cart')
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove item')
      fetchCart() // Refetch on error
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const total = cart.items?.reduce((sum, item) => {
    if (!item.productId) return sum
    return sum + (item.priceAtAddTime * item.quantity)
  }, 0) || 0
  
  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const CartItem = ({ item }) => {
    // Safety check for populated productId
    if (!item.productId || !item.productId._id) {
      return null
    }
    
    const isUpdating = updatingItems.has(item.productId._id)
    const thumbnail = item.productId.thumbnail || (item.productId.images && item.productId.images[0])
    const itemTotal = (item.priceAtAddTime * item.quantity).toFixed(2)
    const currentPrice = item.productId.discountPercentage > 0
      ? (item.productId.price * (1 - item.productId.discountPercentage / 100)).toFixed(2)
      : item.productId.price?.toFixed(2) || '0.00'
    const priceChanged = parseFloat(currentPrice) !== item.priceAtAddTime
    
    return (
      <div className="cart-item" style={isUpdating ? { opacity: 0.7, pointerEvents: 'none' } : {}}>
        <Link to={`/products/${item.productId._id}`} className="cart-item-image">
          {thumbnail ? (
            <img src={thumbnail} alt={item.productId.title} style={styles.productImg} />
          ) : (
            <div style={styles.itemIcon}><Icon name="package" size={32} style={{ color: 'var(--gray-400)' }} /></div>
          )}
        </Link>
        
        <div className="cart-item-details">
          <Link 
            to={`/products/${item.productId._id}`}
            className="cart-item-title"
          >
            {item.productId.title}
          </Link>
          <p className="cart-item-price">
            ₹{item.priceAtAddTime.toFixed(2)} each
          </p>
          {item.quantity > item.productId.stock && (
            <p className="cart-stock-warning">
              Only {item.productId.stock} available
            </p>
          )}
        </div>

        <div className="cart-item-actions">
          <div className="cart-quantity-controls">
            <button
              onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="cart-qty-btn"
              aria-label="Decrease quantity"
            >
              <Icon name="minus" size={16} />
            </button>
            <span className="cart-quantity">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
              disabled={isUpdating || item.quantity >= item.productId.stock}
              className="cart-qty-btn"
              aria-label="Increase quantity"
            >
              <Icon name="plus" size={16} />
            </button>
          </div>
          
          <div className="cart-item-total">
            ₹{itemTotal}
          </div>
          
          <button
            onClick={() => removeItem(item.productId._id)}
            disabled={isUpdating}
            className="cart-remove-btn"
            aria-label="Remove item"
          >
            {isUpdating ? <span className="spinner"></span> : <Icon name="trash" size={18} />}
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
        </div>
        <div className="cart-content">
          <div className="loading-container">
            <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
            <p>Loading your cart...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        {cart.items.length > 0 && (
          <p className="cart-subtitle">
            {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
          </p>
        )}
      </div>

      <div className="cart-content">
        {!cart.items || cart.items.length === 0 ? (
          <div className="cart-empty">
            <div className="empty-icon"><Icon name="cart" size={80} style={{ color: 'var(--gray-300)' }} /></div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/" className="btn-primary btn-lg">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {cart.items?.map((item, index) => {
                // Skip items with missing productId
                if (!item.productId || !item.productId._id) return null
                return <CartItem key={`${item.productId._id}-${index}`} item={item} />
              })}
            </div>

            <div className="cart-summary-wrapper">
              <div className="cart-summary">
                <h3>Order Summary</h3>
                
                <div className="summary-row">
                  <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Shipping</span>
                  <span style={{ color: 'var(--success)', fontWeight: '600' }}>FREE</span>
                </div>
                
                <div className="summary-divider"></div>
                
                <div className="summary-total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                
                <button 
                  onClick={() => navigate('/checkout')} 
                  className="btn-success btn-lg"
                  style={{ width: '100%', marginTop: 'var(--space-4)' }}
                >
                  Proceed to Checkout <Icon name="arrowRight" size={18} />
                </button>
                
                <Link to="/" className="continue-shopping">
                  <Icon name="arrowLeft" size={16} /> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  productImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'var(--radius)'
  },
  itemIcon: {
    fontSize: '2rem',
    color: 'var(--gray-400)'
  }
}

export default Cart