import { useState, useContext, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { orderAPI, cartAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const Checkout = () => {
  const { user } = useContext(AuthContext)
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [cart, setCart] = useState({ items: [], totalItems: 0 })
  const [buyNowItem, setBuyNowItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [verifyingAddress, setVerifyingAddress] = useState(false)
  const [form, setForm] = useState({
    shippingAddress: user?.address || { street: '', city: '', state: '', country: '', zipCode: '' },
    paymentMethod: 'cod'
  })

  useEffect(() => {
    if (location.state?.buyNow && location.state?.product) {
      setBuyNowItem(location.state.product)
      setLoading(false)
    } else {
      fetchCart()
    }
  }, [location.state])

  const fetchCart = async () => {
    try {
      const { data } = await cartAPI.get()
      if (!data.items || data.items.length === 0) {
        toast.warning('Your cart is empty')
        navigate('/cart')
        return
      }
      setCart(data)
    } catch (err) {
      toast.error('Failed to load cart')
      navigate('/cart')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Verify address before submitting
    const isAddressValid = await verifyAddress()
    if (!isAddressValid) {
      return
    }
    
    setSubmitting(true)
    
    try {
      if (buyNowItem) {
        // For Buy Now, create order with single item
        const productId = buyNowItem.productId._id || buyNowItem.productId
        const orderData = {
          ...form,
          items: [{
            productId: productId,
            quantity: buyNowItem.quantity,
            priceAtAddTime: buyNowItem.priceAtAddTime
          }]
        }
        console.log('Buy Now Order Data:', orderData)
        const { data } = await orderAPI.create(orderData)
        await orderAPI.processPayment({ orderId: data.order._id, provider: form.paymentMethod })
      } else {
        // For cart checkout
        const { data } = await orderAPI.create(form)
        await orderAPI.processPayment({ orderId: data.order._id, provider: form.paymentMethod })
      }
      toast.success('Order placed successfully!')
      setTimeout(() => navigate('/orders'), 1500)
    } catch (err) {
      console.error('Order Error:', err.response?.data || err.message)
      toast.error(err.response?.data?.message || 'Order failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddressChange = (field, value) => {
    setForm({ ...form, shippingAddress: { ...form.shippingAddress, [field]: value } })
  }

  const verifyAddress = async () => {
    const { street, city, state, country } = form.shippingAddress
    
    if (!street || !city || !state || !country) {
      toast.error('Please fill in all address fields')
      return false
    }

    setVerifyingAddress(true)
    try {
      // Try city, state, country first (more likely to succeed)
      const query = `${city}, ${state}, ${country}`
      const apiKey = 'pk.1cc505b2ffe76a7a378b4bcb0ecd6c1e'
      const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(query)}&format=json`
      
      console.log('Verifying address:', query)
      const response = await fetch(url)
      const data = await response.json()
      console.log('LocationIQ response:', data)
      
      if (data.error) {
        toast.warning('Could not verify exact address, but proceeding with order')
        return true
      }
      
      if (data.length > 0) {
        toast.success('Address verified successfully')
        return true
      } else {
        toast.warning('Could not verify address, but proceeding with order')
        return true
      }
    } catch (err) {
      console.error('Address verification error:', err)
      toast.warning('Could not verify address, but proceeding with order')
      return true
    } finally {
      setVerifyingAddress(false)
    }
  }

  const items = buyNowItem ? [buyNowItem] : cart.items
  const total = buyNowItem 
    ? buyNowItem.priceAtAddTime * buyNowItem.quantity
    : items.reduce((sum, item) => sum + (item.priceAtAddTime * item.quantity), 0)
  const itemCount = buyNowItem ? buyNowItem.quantity : items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading-container">
          <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <p>Complete your purchase</p>
      </div>

      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="checkout-section">
            <h2>Shipping Address</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="street" className="form-label">Street Address *</label>
                <input
                  id="street"
                  type="text"
                  placeholder="Enter your street address"
                  value={form.shippingAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  required
                  autoComplete="street-address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city" className="form-label">City *</label>
                <input
                  id="city"
                  type="text"
                  placeholder="City"
                  value={form.shippingAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  required
                  autoComplete="address-level2"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state" className="form-label">State *</label>
                <input
                  id="state"
                  type="text"
                  placeholder="State"
                  value={form.shippingAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  required
                  autoComplete="address-level1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country" className="form-label">Country *</label>
                <input
                  id="country"
                  type="text"
                  placeholder="Country"
                  value={form.shippingAddress.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  required
                  autoComplete="country"
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode" className="form-label">Zip Code *</label>
                <input
                  id="zipCode"
                  type="text"
                  placeholder="Zip Code"
                  value={form.shippingAddress.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  required
                  autoComplete="postal-code"
                />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h2>Payment Method</h2>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={form.paymentMethod === 'cod'}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                />
                <div className="payment-info">
                  <div className="payment-name">Cash on Delivery</div>
                  <div className="payment-desc">Pay when you receive your order</div>
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={form.paymentMethod === 'card'}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                />
                <div className="payment-info">
                  <div className="payment-name">Credit/Debit Card</div>
                  <div className="payment-desc">Pay securely with your card</div>
                </div>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting || verifyingAddress}
            className="btn-success btn-lg"
            style={{ width: '100%' }}
          >
            {verifyingAddress ? (
              <>
                <span className="spinner"></span>
                Verifying Address...
              </>
            ) : submitting ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              `Place Order - ₹${total.toFixed(2)}`
            )}
          </button>
        </form>

        <div className="order-summary-wrapper">
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-items">
              {items.map((item, index) => {
                const product = buyNowItem ? item.productId : item.productId
                const thumbnail = product.thumbnail || (product.images && product.images[0])
                const quantity = buyNowItem ? item.quantity : item.quantity
                const price = buyNowItem ? item.priceAtAddTime : item.priceAtAddTime
                return (
                  <div key={product._id || index} className="summary-item">
                    <div className="summary-item-image">
                      {thumbnail ? (
                        <img src={thumbnail} alt={product.title} />
                      ) : (
                        <div className="placeholder-icon">📦</div>
                      )}
                    </div>
                    <div className="summary-item-details">
                      <div className="summary-item-title">{product.title}</div>
                      <div className="summary-item-qty">Qty: {quantity}</div>
                    </div>
                    <div className="summary-item-price">
                      ₹{(price * quantity).toFixed(2)}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Subtotal ({itemCount} items)</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">FREE</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
