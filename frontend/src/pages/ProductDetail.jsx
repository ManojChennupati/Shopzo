import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productAPI, cartAPI, reviewAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'

const ProductDetail = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const { updateCartCount } = useContext(CartContext)
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState([])
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

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
    if (!user) {
      navigate('/login')
      return
    }
    setAddingToCart(true)
    try {
      const { data } = await cartAPI.add({ productId: id, quantity })
      updateCartCount(data.cart.totalItems)
      setMessage({ text: '✓ Added to cart successfully!', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 3000)
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to add to cart', type: 'error' })
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner spinner-large" />
        <p style={styles.loadingText}>Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>😕</div>
        <h2 style={styles.errorTitle}>Product not found</h2>
        <Link to="/" style={styles.backLink}>← Back to Products</Link>
      </div>
    )
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.breadcrumb}>← Back to Products</Link>

      <div style={styles.productSection}>
        <div style={styles.imageSection}>
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.title} style={styles.productImage} />
          ) : (
            <div style={styles.imagePlaceholder}>📦</div>
          )}
          {product.discountPrice && (
            <div style={styles.discountBadge}>
              {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
            </div>
          )}
        </div>

        <div style={styles.detailSection}>
          <h1 style={styles.title}>{product.title}</h1>
          
          <div style={styles.ratingSection}>
            <div style={styles.stars}>
              {'⭐'.repeat(Math.round(avgRating))}
              {'☆'.repeat(5 - Math.round(avgRating))}
            </div>
            <span style={styles.ratingText}>
              {avgRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <p style={styles.description}>{product.description}</p>

          <div style={styles.priceSection}>
            <div style={styles.priceContainer}>
              <span style={styles.price}>
                ₹{product.discountPrice || product.price}
              </span>
              {product.discountPrice && (
                <span style={styles.oldPrice}>₹{product.price}</span>
              )}
            </div>
            <div style={{
              ...styles.stockBadge,
              background: product.stock > 10 ? 'var(--success)' : product.stock > 0 ? '#FFA500' : 'var(--danger)'
            }}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>
          </div>

          <div style={styles.actions}>
            <div style={styles.quantitySection}>
              <label htmlFor="quantity" style={styles.quantityLabel}>Quantity:</label>
              <div style={styles.quantityControls}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={styles.quantityBtn}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
                  style={styles.quantityInput}
                  aria-label="Product quantity"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={styles.quantityBtn}
                  disabled={quantity >= product.stock}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button 
              onClick={handleAddToCart} 
              disabled={product.stock === 0 || addingToCart}
              style={{
                ...styles.addToCartBtn,
                ...(product.stock === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {})
              }}
            >
              {addingToCart ? <span className="spinner" /> : '🛒 Add to Cart'}
            </button>
          </div>

          {message.text && (
            <div style={{
              ...styles.message,
              background: message.type === 'success' ? '#E8F8F5' : '#FEE2E7',
              color: message.type === 'success' ? 'var(--success-dark)' : 'var(--danger)',
              border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`
            }} role="alert">
              {message.text}
            </div>
          )}
        </div>
      </div>

      <div style={styles.reviewsSection}>
        <h2 style={styles.reviewsTitle}>Customer Reviews</h2>
        {reviews.length === 0 ? (
          <div style={styles.noReviews}>
            <p style={styles.noReviewsText}>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div style={styles.reviewsList}>
            {reviews.map(review => (
              <div key={review._id} style={styles.review}>
                <div style={styles.reviewHeader}>
                  <div>
                    <div style={styles.reviewAuthor}>👤 {review.userId.name}</div>
                    <div style={styles.reviewStars}>
                      {'⭐'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                </div>
                <p style={styles.reviewComment}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { 
    padding: '2rem 1.5rem', 
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
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 80px)',
    gap: '1rem',
    textAlign: 'center'
  },
  errorIcon: {
    fontSize: '4rem'
  },
  errorTitle: {
    fontSize: '1.5rem',
    color: 'var(--dark)'
  },
  backLink: {
    color: 'var(--primary)',
    fontWeight: '600',
    fontSize: '1rem'
  },
  breadcrumb: {
    display: 'inline-block',
    color: 'var(--gray)',
    marginBottom: '2rem',
    fontWeight: '500',
    transition: 'var(--transition)'
  },
  productSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '3rem',
    marginBottom: '3rem',
    background: 'white',
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)'
  },
  imageSection: {
    position: 'relative',
    background: 'var(--light)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'var(--radius-lg)'
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: '1',
    background: 'var(--light)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8rem',
    color: 'var(--gray)'
  },
  discountBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'var(--danger)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '1rem',
    fontWeight: '700',
    boxShadow: 'var(--shadow-md)'
  },
  detailSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--dark)',
    lineHeight: '1.2'
  },
  ratingSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  stars: {
    fontSize: '1.2rem'
  },
  ratingText: {
    color: 'var(--gray)',
    fontSize: '0.95rem'
  },
  description: {
    fontSize: '1.05rem',
    lineHeight: '1.7',
    color: 'var(--gray)'
  },
  priceSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    background: 'var(--light)',
    borderRadius: 'var(--radius-md)'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  price: {
    fontSize: '2rem',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  oldPrice: {
    textDecoration: 'line-through',
    color: 'var(--gray)',
    fontSize: '1.25rem'
  },
  stockBadge: {
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  quantitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  quantityLabel: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--dark)'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  quantityBtn: {
    width: '40px',
    height: '40px',
    background: 'var(--light)',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '1.25rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'var(--transition)'
  },
  quantityInput: {
    width: '80px',
    padding: '0.75rem',
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: '600'
  },
  addToCartBtn: {
    padding: '1.25rem 2rem',
    background: 'var(--primary)',
    color: 'white',
    borderRadius: 'var(--radius-md)',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'var(--transition)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minHeight: '56px'
  },
  message: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: '600',
    textAlign: 'center'
  },
  reviewsSection: {
    background: 'white',
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)'
  },
  reviewsTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--dark)',
    marginBottom: '1.5rem'
  },
  noReviews: {
    textAlign: 'center',
    padding: '3rem',
    background: 'var(--light)',
    borderRadius: 'var(--radius-md)'
  },
  noReviewsText: {
    color: 'var(--gray)',
    fontSize: '1rem'
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  review: {
    padding: '1.5rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    transition: 'var(--transition)'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  reviewAuthor: {
    fontWeight: '600',
    color: 'var(--dark)',
    marginBottom: '0.25rem'
  },
  reviewStars: {
    fontSize: '1rem'
  },
  reviewComment: {
    color: 'var(--gray)',
    lineHeight: '1.6',
    fontSize: '0.95rem'
  }
}

export default ProductDetail
