import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productAPI, cartAPI, reviewAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import Icon from '../components/Icon'

/* Inline star SVG for pixel-perfect rating display */
const StarIcon = ({ filled, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? '#F59E0B' : 'none'}
    stroke={filled ? '#F59E0B' : '#D1D5DB'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const ProductDetail = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const { updateCartCount } = useContext(CartContext)
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data } = await productAPI.getById(id)
      setProduct(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data } = await reviewAPI.getByProduct(id)
      setReviews(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    setAddingToCart(true)
    try {
      const { data } = await cartAPI.add({ productId: id, quantity })
      updateCartCount(data.cart.totalItems)
      setMessage({ text: 'Added to cart successfully!', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to add to cart', type: 'error' })
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return }
    setBuyingNow(true)
    const discountedPrice = product.price * (1 - (product.discountPercentage || 0) / 100)
    navigate('/checkout', {
      state: {
        buyNow: true,
        product: { productId: product, quantity, priceAtAddTime: discountedPrice }
      }
    })
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setSubmittingReview(true)
    try {
      await reviewAPI.create({ productId: id, rating: reviewForm.rating, comment: reviewForm.comment })
      setMessage({ text: 'Review submitted successfully!', type: 'success' })
      setReviewForm({ rating: 5, comment: '' })
      fetchReviews()
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to submit review', type: 'error' })
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="pd-loading">
        <Icon name="loader" size={40} />
        <p>Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pd-not-found">
        <div className="pd-not-found-icon">
          <Icon name="package" size={36} />
        </div>
        <h2 className="pd-not-found-title">Product not found</h2>
        <Link to="/" className="pd-breadcrumb" style={{ marginTop: '16px' }}>
          <Icon name="arrowLeft" size={16} />
          Back to Products
        </Link>
      </div>
    )
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?'

  return (
    <div className="pd-page">
      <div className="pd-inner">
        <Link to="/" className="pd-breadcrumb">
          <Icon name="arrowLeft" size={16} />
          Back to Products
        </Link>

        {/* Product Main Section */}
        <div className="pd-main-section">
          {/* Image */}
          <div className="pd-image-area">
            {product.thumbnail ? (
              <img src={product.thumbnail} alt={product.title} className="pd-product-img" />
            ) : (
              <div className="pd-image-placeholder">
                <Icon name="package" size={80} />
              </div>
            )}
            {product.discountPrice && (
              <div className="pd-discount-badge">
                {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info-area">
            <h1 className="pd-title">{product.title}</h1>

            <div className="pd-rating-row">
              <div className="pd-stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <StarIcon key={star} filled={star <= Math.round(avgRating)} size={18} />
                ))}
              </div>
              <span className="pd-rating-text">
                <span className="pd-rating-number">
                  {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}
                </span>
                {' '}({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            <p className="pd-description">{product.description}</p>

            <div className="pd-price-box">
              <div className="pd-price-group">
                <span className="pd-price-current">₹{product.discountPrice || product.price}</span>
                {product.discountPrice && (
                  <span className="pd-price-original">₹{product.price}</span>
                )}
              </div>
              <span
                className="pd-stock-indicator"
                style={{
                  background: product.stock > 10 ? '#10B981' : product.stock > 0 ? '#F59E0B' : '#EF4444'
                }}
              >
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="pd-qty-section">
              <label htmlFor="quantity" className="pd-qty-label">Quantity:</label>
              <div className="pd-qty-controls">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="pd-qty-btn"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >−</button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                  className="pd-qty-input"
                  aria-label="Product quantity"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="pd-qty-btn"
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                >+</button>
              </div>
            </div>

            <div className="pd-btn-group">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="pd-add-cart-btn"
              >
                {addingToCart
                  ? <><Icon name="loader" size={18} /><span>Adding...</span></>
                  : <><Icon name="cart" size={18} /><span>Add to Cart</span></>
                }
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0 || buyingNow}
                className="pd-buy-now-btn"
              >
                {buyingNow
                  ? <><Icon name="loader" size={18} /><span>Loading...</span></>
                  : <><Icon name="zap" size={18} /><span>Buy Now</span></>
                }
              </button>
            </div>

            {message.text && (
              <div
                className={`pd-message ${message.type === 'success' ? 'pd-message-success' : 'pd-message-error'}`}
                role="alert"
              >
                <Icon name={message.type === 'success' ? 'check' : 'alert'} size={16} />
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pd-reviews-section">
          <h2 className="pd-reviews-title">
            <Icon name="star" size={22} />
            Customer Reviews ({reviews.length})
          </h2>

          {user && (
            <div className="pd-review-form-card">
              <h3 className="pd-review-form-title">
                <Icon name="edit" size={16} />
                Write a Review
              </h3>
              <form onSubmit={handleSubmitReview} className="pd-review-form">
                <div className="pd-star-rating-row">
                  <span className="pd-star-label">Your Rating:</span>
                  <div className="pd-stars-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="pd-star-btn"
                        aria-label={`Rate ${star} stars`}
                      >
                        <StarIcon filled={star <= (hoverRating || reviewForm.rating)} size={28} />
                      </button>
                    ))}
                  </div>
                  <span className="pd-rating-val">{reviewForm.rating}/5</span>
                </div>

                <textarea
                  id="comment"
                  placeholder="Share your experience with this product..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="pd-review-textarea"
                  required
                  rows="4"
                />

                <button
                  type="submit"
                  disabled={submittingReview || !reviewForm.comment.trim()}
                  className="pd-submit-review-btn"
                >
                  {submittingReview
                    ? <><Icon name="loader" size={16} /><span>Submitting...</span></>
                    : <><Icon name="check" size={16} /><span>Submit Review</span></>
                  }
                </button>
              </form>
            </div>
          )}

          <div className="pd-reviews-divider" />

          {reviews.length === 0 ? (
            <div className="pd-no-reviews">
              <div className="pd-no-reviews-icon">
                <Icon name="message" size={28} />
              </div>
              <p className="pd-no-reviews-text">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="pd-reviews-list">
              {reviews.map(review => (
                <div key={review._id} className="pd-review-card">
                  <div className="pd-review-head">
                    <div className="pd-review-author-row">
                      <div className="pd-reviewer-avatar">{getInitials(review.userId.name)}</div>
                      <div>
                        <div className="pd-reviewer-name">{review.userId.name}</div>
                        <div className="pd-review-stars">
                          {[1, 2, 3, 4, 5].map(s => (
                            <StarIcon key={s} filled={s <= review.rating} size={13} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="pd-review-date">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </div>
                  </div>
                  <p className="pd-review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
