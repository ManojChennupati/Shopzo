import { useState, useContext, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { orderAPI, cartAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Icon from '../components/Icon'

const Checkout = () => {
  const { user } = useContext(AuthContext)
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [cart, setCart] = useState({ items: [], totalItems: 0 })
  const [buyNowItem, setBuyNowItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState({
    shippingAddress: user?.address || { street: '', city: '', state: '', country: '', zipCode: '' },
    paymentMethod: 'cod',
    cardDetails: { bank: '', cardNumber: '', expiryDate: '', cvv: '' }
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

  const handleNextStep = async () => {
    if (currentStep === 1) {
      // Validate address
      const { street, city, state, country } = form.shippingAddress
      if (!street || !city || !state || !country) {
        toast.error('Please fill in all address fields')
        return
      }
      setCurrentStep(2)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate card details if debit card is selected
    if (form.paymentMethod === 'debit') {
      const { bank, cardNumber, expiryDate, cvv } = form.cardDetails
      if (!bank || !cardNumber || !expiryDate || !cvv) {
        toast.error('Please fill in all card details')
        return
      }
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Please enter a valid 16-digit card number')
        return
      }
      if (cvv.length !== 3) {
        toast.error('Please enter a valid 3-digit CVV')
        return
      }
    }

    setSubmitting(true)
    
    try {
      if (buyNowItem) {
        // For Buy Now, create order with single item
        const productId = buyNowItem.productId._id || buyNowItem.productId
        const orderData = {
          shippingAddress: form.shippingAddress,
          paymentMethod: form.paymentMethod,
          items: [{
            productId: productId,
            quantity: buyNowItem.quantity,
            priceAtAddTime: buyNowItem.priceAtAddTime
          }]
        }
        console.log('Buy Now Order Data:', orderData)
        const { data } = await orderAPI.create(orderData)
        console.log('Order created:', data)
        await orderAPI.processPayment({ orderId: data.order._id, provider: form.paymentMethod })
        console.log('Payment processed')
      } else {
        // For cart checkout
        const orderData = {
          shippingAddress: form.shippingAddress,
          paymentMethod: form.paymentMethod
        }
        console.log('Cart Checkout Data:', orderData)
        const { data } = await orderAPI.create(orderData)
        console.log('Order created:', data)
        await orderAPI.processPayment({ orderId: data.order._id, provider: form.paymentMethod })
        console.log('Payment processed')
      }
      toast.success('🎉 Order placed successfully!')
      // Navigate to orders page after short delay
      setTimeout(() => {
        navigate('/orders', { replace: true })
      }, 2000)
    } catch (err) {
      console.error('Order Error:', err.response?.data || err.message)
      const errorMessage = err.response?.data?.message || 'Order failed. Please try again.'
      toast.error(errorMessage)
      setSubmitting(false)
    }
  }

  const handleAddressChange = (field, value) => {
    setForm({ ...form, shippingAddress: { ...form.shippingAddress, [field]: value } })
  }

  const items = buyNowItem ? [buyNowItem] : cart.items
  const total = buyNowItem 
    ? buyNowItem.priceAtAddTime * buyNowItem.quantity
    : items.reduce((sum, item) => sum + (item.priceAtAddTime * item.quantity), 0)
  const itemCount = buyNowItem ? buyNowItem.quantity : items.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="checkout-loading">
          <div className="spinner spinner-large"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      <div className="checkout-content">
        <div className="checkout-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <Icon name="arrowLeft" size={20} />
          </button>
          <div className="header-content">
            <h1>Secure Checkout</h1>
            <p className="header-subtitle">
              <Icon name="shield" size={16} />
              Your information is protected
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="checkout-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-circle">
              {currentStep > 1 ? <Icon name="check" size={18} /> : '1'}
            </div>
            <div className="step-label">Shipping</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <div className="step-label">Payment</div>
          </div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="checkout-step-content fade-in">
                <div className="section-header">
                  <div className="section-icon">
                    <Icon name="mapPin" size={24} />
                  </div>
                  <div>
                    <h2>Shipping Address</h2>
                    <p className="section-description">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="street" className="form-label">
                      <Icon name="home" size={16} />
                      Street Address *
                    </label>
                    <input
                      id="street"
                      type="text"
                      className="form-input"
                      placeholder="123 Main Street, Apt 4B"
                      value={form.shippingAddress.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      required
                      autoComplete="street-address"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city" className="form-label">
                      <Icon name="building" size={16} />
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      className="form-input"
                      placeholder="New York"
                      value={form.shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      required
                      autoComplete="address-level2"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="state" className="form-label">
                      <Icon name="map" size={16} />
                      State / Province *
                    </label>
                    <input
                      id="state"
                      type="text"
                      className="form-input"
                      placeholder="NY"
                      value={form.shippingAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      required
                      autoComplete="address-level1"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country" className="form-label">
                      <Icon name="globe" size={16} />
                      Country *
                    </label>
                    <input
                      id="country"
                      type="text"
                      className="form-input"
                      placeholder="United States"
                      value={form.shippingAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      required
                      autoComplete="country"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="zipCode" className="form-label">
                      <Icon name="hash" size={16} />
                      Postal Code *
                    </label>
                    <input
                      id="zipCode"
                      type="text"
                      className="form-input"
                      placeholder="10001"
                      value={form.shippingAddress.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      required
                      autoComplete="postal-code"
                    />
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleNextStep}
                  className="btn-continue"
                >
                  Continue to Payment
                  <Icon name="arrowRight" size={18} />
                </button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <form onSubmit={handleSubmit} className="checkout-step-content fade-in">
                <div className="section-header">
                  <div className="section-icon payment-icon">
                    <Icon name="creditCard" size={24} />
                  </div>
                  <div>
                    <h2>Payment Method</h2>
                    <p className="section-description">Choose how you want to pay</p>
                  </div>
                </div>

                <div className="payment-methods">
                  <label className={`payment-card ${form.paymentMethod === 'cod' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={form.paymentMethod === 'cod'}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    />
                    <div className="payment-card-content">
                      <div className="payment-icon-wrapper cod-icon">
                        <Icon name="dollarSign" size={24} />
                      </div>
                      <div className="payment-details">
                        <div className="payment-name">Cash on Delivery</div>
                        <div className="payment-desc">Pay when you receive your order</div>
                      </div>
                      <div className="payment-check">
                        {form.paymentMethod === 'cod' && <Icon name="checkCircle" size={24} />}
                      </div>
                    </div>
                  </label>

                  <label className={`payment-card ${form.paymentMethod === 'debit' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="debit"
                      checked={form.paymentMethod === 'debit'}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    />
                    <div className="payment-card-content">
                      <div className="payment-icon-wrapper debit-icon">
                        <Icon name="creditCard" size={24} />
                      </div>
                      <div className="payment-details">
                        <div className="payment-name">Debit Card</div>
                        <div className="payment-desc">Pay with your debit card</div>
                      </div>
                      <div className="payment-check">
                        {form.paymentMethod === 'debit' && <Icon name="checkCircle" size={24} />}
                      </div>
                    </div>
                  </label>

                  <label className={`payment-card ${form.paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={form.paymentMethod === 'card'}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    />
                    <div className="payment-card-content">
                      <div className="payment-icon-wrapper card-icon">
                        <Icon name="creditCard" size={24} />
                      </div>
                      <div className="payment-details">
                        <div className="payment-name">Credit Card</div>
                        <div className="payment-desc">Pay securely with credit card</div>
                      </div>
                      <div className="payment-check">
                        {form.paymentMethod === 'card' && <Icon name="checkCircle" size={24} />}
                      </div>
                    </div>
                  </label>
                </div>

                {/* Debit Card Details Form */}
                {form.paymentMethod === 'debit' && (
                  <div className="card-details-form fade-in">
                    <h3 className="card-form-title">
                      <Icon name="creditCard" size={20} />
                      Enter Debit Card Details
                    </h3>
                    
                    <div className="form-group">
                      <label htmlFor="bank" className="form-label">
                        <Icon name="building" size={16} />
                        Select Bank *
                      </label>
                      <select
                        id="bank"
                        className="form-input"
                        value={form.cardDetails.bank}
                        onChange={(e) => setForm({ ...form, cardDetails: { ...form.cardDetails, bank: e.target.value } })}
                        required
                      >
                        <option value="">Choose your bank</option>
                        <option value="sbi">State Bank of India (SBI)</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="pnb">Punjab National Bank (PNB)</option>
                        <option value="kotak">Kotak Mahindra Bank</option>
                        <option value="bob">Bank of Baroda</option>
                        <option value="canara">Canara Bank</option>
                        <option value="idbi">IDBI Bank</option>
                        <option value="yes">Yes Bank</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="cardNumber" className="form-label">
                        <Icon name="creditCard" size={16} />
                        Card Number *
                      </label>
                      <input
                        id="cardNumber"
                        type="text"
                        className="form-input"
                        placeholder="1234 5678 9012 3456"
                        value={form.cardDetails.cardNumber}
                        onChange={(e) => setForm({ ...form, cardDetails: { ...form.cardDetails, cardNumber: e.target.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim() } })}
                        maxLength="19"
                        required
                      />
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label htmlFor="expiryDate" className="form-label">
                          <Icon name="calendar" size={16} />
                          Expiry Date *
                        </label>
                        <input
                          id="expiryDate"
                          type="text"
                          className="form-input"
                          placeholder="MM/YY"
                          value={form.cardDetails.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '')
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4)
                            }
                            setForm({ ...form, cardDetails: { ...form.cardDetails, expiryDate: value } })
                          }}
                          maxLength="5"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="cvv" className="form-label">
                          <Icon name="lock" size={16} />
                          CVV *
                        </label>
                        <input
                          id="cvv"
                          type="password"
                          className="form-input"
                          placeholder="123"
                          value={form.cardDetails.cvv}
                          onChange={(e) => setForm({ ...form, cardDetails: { ...form.cardDetails, cvv: e.target.value.replace(/\D/g, '') } })}
                          maxLength="3"
                          required
                        />
                      </div>
                    </div>

                    <div className="card-security-info">
                      <Icon name="shield" size={16} />
                      <span>Your card details are encrypted and secure</span>
                    </div>
                  </div>
                )}

                <div className="checkout-actions">
                  <button 
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="btn-back"
                  >
                    <Icon name="arrowLeft" size={18} />
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="btn-place-order"
                  >
                    {submitting ? (
                      <>
                        <span className="spinner"></span>
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <Icon name="shoppingBag" size={18} />
                        Place Order - ₹{total.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="order-summary-sidebar">
            <div className="order-summary">
              <div className="summary-header">
                <Icon name="shoppingBag" size={20} />
                <h3>Order Summary</h3>
              </div>
            
              <div className="summary-items">
                {items.map((item, index) => {
                  const product = buyNowItem ? item.productId : item.productId
                  if (!product) return null
                  const thumbnail = product.thumbnail || (product.images && product.images[0])
                  const quantity = buyNowItem ? item.quantity : item.quantity
                  const price = buyNowItem ? item.priceAtAddTime : item.priceAtAddTime
                  return (
                    <div key={product._id || index} className="summary-item">
                      <div className="summary-item-image">
                        {thumbnail ? (
                          <img src={thumbnail} alt={product.title} />
                        ) : (
                          <div className="placeholder-icon">
                            <Icon name="package" size={24} />
                          </div>
                        )}
                        <span className="item-quantity-badge">{quantity}</span>
                      </div>
                      <div className="summary-item-info">
                        <div className="summary-item-title">{product.title}</div>
                        <div className="summary-item-price">₹{price.toFixed(2)} × {quantity}</div>
                      </div>
                      <div className="summary-item-total">
                        ₹{(price * quantity).toFixed(2)}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="summary-calculations">
                <div className="summary-row">
                  <span>
                    <Icon name="package" size={16} />
                    Subtotal ({itemCount} items)
                  </span>
                  <span className="summary-amount">₹{total.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>
                    <Icon name="truck" size={16} />
                    Shipping
                  </span>
                  <span className="free-badge">
                    <Icon name="gift" size={14} />
                    FREE
                  </span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-total">
                  <span>Total Amount</span>
                  <span className="total-amount">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="summary-benefits">
                <div className="benefit-item">
                  <Icon name="shield" size={18} />
                  <span>Secure Payment</span>
                </div>
                <div className="benefit-item">
                  <Icon name="truck" size={18} />
                  <span>Free Delivery</span>
                </div>
                <div className="benefit-item">
                  <Icon name="refreshCw" size={18} />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
