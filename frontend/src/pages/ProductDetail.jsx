import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productAPI, cartAPI, reviewAPI } from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const ProductDetail = () => {
  const { id } = useParams()
  const { user } = useContext(AuthContext)
  const { updateCartCount } = useContext(CartContext)
  const toast = useToast()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [canReview, setCanReview] = useState(true)

  useEffect(() => {
    fetchProduct()
    fetchReviews()
  }, [id])

  useEffect(() => {
    if (user) {
      // Always allow reviews for logged-in users
      setCanReview(true)
    } else {
      setCanReview(false)
    }
  }, [user])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const { data } = await productAPI.getById(id)
      setProduct(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load product details')
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



  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return
    }
    
    try {
      await reviewAPI.delete(reviewId)
      toast.success('Review deleted successfully!')
      // Refresh reviews to remove the deleted review
      await fetchReviews()
    } catch (err) {
      console.error('Delete review error:', err)
      if (err.response?.status === 403) {
        toast.error('You are not authorized to delete this review')
      } else {
        toast.error('Failed to delete review')
      }
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    
    setSubmittingReview(true)
    try {
      const reviewData = {
        productId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      }
      
      await reviewAPI.create(reviewData)
      toast.success('Review submitted successfully!')
      setShowReviewForm(false)
      setReviewForm({ rating: 5, comment: '' })
      // Refresh reviews to show the new review immediately
      await fetchReviews()
    } catch (err) {
      console.error('Review submission error:', err)
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
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
      toast.success('Added to cart successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    
    setBuyingNow(true)
    // Navigate to checkout with product data
    navigate('/checkout', { 
      state: { 
        buyNow: true,
        product: {
          productId: product,
          quantity: quantity,
          priceAtAddTime: getUnitPrice()
        }
      } 
    })
    setBuyingNow(false)
  }

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const calculateDiscount = () => {
    return product.discountPercentage || 0;
  };

  const getUnitPrice = () => {
    return product.discountPercentage > 0 
      ? product.price * (1 - product.discountPercentage / 100)
      : product.price;
  };

  const getTotalPrice = () => {
    return (getUnitPrice() * quantity).toFixed(2);
  };

  const getOriginalTotalPrice = () => {
    return (product.price * quantity).toFixed(2);
  };

  const getTotalSavings = () => {
    return ((product.price * product.discountPercentage / 100) * quantity).toFixed(2);
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div className="spinner" style={styles.spinner}></div>
          <p>Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>😞</div>
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <nav style={styles.breadcrumb}>
        <Link to="/" style={styles.breadcrumbLink}>Products</Link>
        <span style={styles.breadcrumbSeparator}>›</span>
        <span style={styles.breadcrumbCurrent}>{product.title}</span>
      </nav>

      <div style={styles.productContainer}>
        {/* Product Image */}
        <div style={styles.imageSection}>
          <div style={styles.productImage}>
            {product.thumbnail ? (
              <img src={product.thumbnail} alt={product.title} style={styles.thumbnailImg} />
            ) : (
              <span style={styles.productIcon}>📦</span>
            )}
          </div>
          {calculateDiscount() > 0 && (
            <div style={styles.discountBadge}>
              {Math.round(calculateDiscount())}% OFF
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={styles.infoSection}>
          <div style={styles.productHeader}>
            <h1 style={styles.productTitle}>{product.title}</h1>
            
            {/* Rating */}
            {reviews.length > 0 && (
              <div style={styles.ratingContainer}>
                <div style={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{
                      ...styles.star,
                      color: i < Math.floor(averageRating) ? '#F59E0B' : '#E5E7EB'
                    }}>
                      ★
                    </span>
                  ))}
                </div>
                <span style={styles.ratingText}>
                  {averageRating} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          <p style={styles.productDescription}>{product.description}</p>

          {/* Price */}
          <div style={styles.priceSection}>
            <div style={styles.priceHeader}>
              <span style={styles.priceLabel}>Unit Price:</span>
              <div style={styles.priceContainer}>
                <span style={styles.unitPrice}>
                  ₹{getUnitPrice().toFixed(2)}
                </span>
                {product.discountPercentage > 0 && (
                  <span style={styles.unitOriginalPrice}>₹{product.price.toFixed(2)}</span>
                )}
              </div>
            </div>
            
            <div style={styles.totalPriceSection}>
              <span style={styles.totalLabel}>Total Price:</span>
              <div style={styles.totalPriceContainer}>
                <span style={styles.totalPrice}>
                  ₹{getTotalPrice()}
                </span>
                {product.discountPercentage > 0 && (
                  <span style={styles.totalOriginalPrice}>₹{getOriginalTotalPrice()}</span>
                )}
              </div>
            </div>
            
            {calculateDiscount() > 0 && (
              <span style={styles.savings}>
                You save ₹{getTotalSavings()} ({Math.round(calculateDiscount())}% off)
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div style={styles.stockSection}>
            <span style={{
              ...styles.stockStatus,
              ...(product.stock > 10 ? styles.inStock : 
                  product.stock > 0 ? styles.lowStock : styles.outOfStock)
            }}>
              {product.stock > 10 ? '✅ In Stock' :
               product.stock > 0 ? `⚠️ Only ${product.stock} left` : '❌ Out of Stock'}
            </span>
          </div>

          {/* Quantity and Add to Cart */}
          {product.stock > 0 && (
            <div style={styles.purchaseSection}>
              <div style={styles.quantitySection}>
                <label htmlFor="quantity" style={styles.quantityLabel}>Quantity:</label>
                <div style={styles.quantityControls}>
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    style={styles.quantityButton}
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
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    style={styles.quantityInput}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    style={styles.quantityButton}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button 
                  onClick={handleAddToCart} 
                  disabled={addingToCart || buyingNow}
                  className="btn-primary btn-lg"
                  style={styles.addToCartButton}
                >
                  {addingToCart ? (
                    <>
                      <span className="spinner"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      🛒 Add to Cart
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleBuyNow} 
                  disabled={addingToCart || buyingNow}
                  className="btn-success btn-lg"
                  style={styles.buyNowButton}
                >
                  {buyingNow ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      ⚡ Buy Now
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div style={styles.reviewsSection}>
        <div style={styles.reviewsHeader}>
          <h2 style={styles.reviewsTitle}>
            Customer Reviews ({reviews.length})
          </h2>
          
          {user && (
            <button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="btn-primary"
              style={styles.writeReviewButton}
            >
              ✍️ Write a Review
            </button>
          )}
        </div>
        
        {/* Review Form */}
        {showReviewForm && (
          <div style={styles.reviewForm}>
            <h3 style={styles.reviewFormTitle}>Write Your Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div style={styles.ratingInput}>
                <label style={styles.ratingLabel}>Rating:</label>
                <div style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({...reviewForm, rating: star})}
                      style={{
                        ...styles.ratingStarButton,
                        color: star <= reviewForm.rating ? '#F59E0B' : '#E5E7EB'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={styles.commentInput}>
                <label htmlFor="comment" style={styles.commentLabel}>Comment:</label>
                <textarea
                  id="comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  placeholder="Share your experience with this product..."
                  style={styles.commentTextarea}
                  rows={4}
                  required
                />
              </div>
              
              <div style={styles.reviewFormButtons}>
                <button 
                  type="submit" 
                  disabled={submittingReview}
                  className="btn-primary"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowReviewForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {reviews.length === 0 ? (
          <div style={styles.noReviews}>
            <div style={styles.noReviewsIcon}>💬</div>
            <h3>No reviews yet</h3>
            <p>Be the first to review this product!</p>
          </div>
        ) : (
          <div style={styles.reviewsList}>
            {reviews.map(review => {
              const isUserReview = user && (review.userId._id === user.id || review.userId.email === user.email)
              const canDelete = user && (user.role === 'ADMIN' || isUserReview)
              
              // Debug logging
              console.log('Review check:', {
                reviewId: review._id,
                reviewUserId: review.userId._id,
                reviewUserEmail: review.userId.email,
                currentUserId: user?.id,
                currentUserEmail: user?.email,
                currentUserRole: user?.role,
                isUserReview,
                canDelete
              })
              
              return (
                <div key={review._id} style={styles.reviewCard}>
                  <div style={styles.reviewHeader}>
                    <div style={styles.reviewerInfo}>
                      <span style={styles.reviewerName}>
                        {review.userId.name}
                        {isUserReview && <span style={styles.youBadge}>(You)</span>}
                      </span>
                      <div style={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{
                            ...styles.reviewStar,
                            color: i < review.rating ? '#F59E0B' : '#E5E7EB'
                          }}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={styles.reviewActions}>
                      <span style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          style={styles.deleteButton}
                          title="Delete review"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={styles.reviewComment}>{review.comment}</p>
                </div>
              )
            })}}}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: 'var(--space-6)',
    minHeight: 'calc(100vh - 64px)'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: 'var(--space-4)'
  },
  spinner: {
    width: '40px',
    height: '40px'
  },
  errorContainer: {
    textAlign: 'center',
    padding: 'var(--space-16)',
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow)'
  },
  errorIcon: {
    fontSize: 'var(--font-size-5xl)',
    marginBottom: 'var(--space-4)'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-8)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)'
  },
  breadcrumbLink: {
    color: 'var(--primary)',
    textDecoration: 'none'
  },
  breadcrumbSeparator: {
    color: 'var(--gray-400)'
  },
  breadcrumbCurrent: {
    color: 'var(--gray-600)',
    fontWeight: '500'
  },
  productContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-12)',
    marginBottom: 'var(--space-16)',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: 'var(--space-8)'
    }
  },
  imageSection: {
    position: 'relative'
  },
  productImage: {
    width: '100%',
    height: '400px',
    background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)',
    borderRadius: 'var(--radius-xl)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden'
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  productIcon: {
    fontSize: '6rem',
    opacity: 0.8
  },
  discountBadge: {
    position: 'absolute',
    top: 'var(--space-4)',
    right: 'var(--space-4)',
    background: 'var(--danger)',
    color: 'white',
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: '700'
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)'
  },
  productHeader: {
    borderBottom: '1px solid var(--gray-200)',
    paddingBottom: 'var(--space-4)'
  },
  productTitle: {
    fontSize: 'var(--font-size-4xl)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-3)',
    lineHeight: '1.2'
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)'
  },
  stars: {
    display: 'flex',
    gap: 'var(--space-1)'
  },
  star: {
    fontSize: 'var(--font-size-lg)'
  },
  ratingText: {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-size-sm)'
  },
  productDescription: {
    fontSize: 'var(--font-size-lg)',
    lineHeight: '1.6',
    color: 'var(--gray-700)'
  },
  priceSection: {
    padding: 'var(--space-6)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--gray-200)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  },
  priceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 'var(--space-3)',
    borderBottom: '1px solid var(--gray-200)'
  },
  priceLabel: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)',
    fontWeight: '500'
  },
  unitPrice: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: '600',
    color: 'var(--gray-700)'
  },
  unitOriginalPrice: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--gray-500)',
    textDecoration: 'line-through'
  },
  totalPriceSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    fontSize: 'var(--font-size-lg)',
    color: 'var(--gray-900)',
    fontWeight: '700'
  },
  totalPriceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--space-3)'
  },
  totalPrice: {
    fontSize: 'var(--font-size-4xl)',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  totalOriginalPrice: {
    fontSize: 'var(--font-size-xl)',
    color: 'var(--gray-500)',
    textDecoration: 'line-through'
  },
  savings: {
    color: 'var(--success)',
    fontSize: 'var(--font-size-base)',
    fontWeight: '600'
  },
  stockSection: {
    display: 'flex',
    alignItems: 'center'
  },
  stockStatus: {
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: '600'
  },
  inStock: {
    background: '#ECFDF5',
    color: 'var(--success)'
  },
  lowStock: {
    background: '#FFFBEB',
    color: 'var(--warning)'
  },
  outOfStock: {
    background: '#FEF2F2',
    color: 'var(--danger)'
  },
  purchaseSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    padding: 'var(--space-6)',
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--gray-200)'
  },
  quantitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)'
  },
  quantityLabel: {
    fontSize: 'var(--font-size-base)',
    fontWeight: '600',
    color: 'var(--gray-700)'
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden'
  },
  quantityButton: {
    background: 'var(--gray-100)',
    border: 'none',
    padding: 'var(--space-3) var(--space-4)',
    cursor: 'pointer',
    fontSize: 'var(--font-size-lg)',
    fontWeight: '600',
    color: 'var(--gray-700)',
    transition: 'all var(--transition-base)'
  },
  quantityInput: {
    border: 'none',
    padding: 'var(--space-3) var(--space-4)',
    textAlign: 'center',
    width: '80px',
    fontSize: 'var(--font-size-base)',
    fontWeight: '600'
  },
  addToCartButton: {
    flex: 1
  },
  buyNowButton: {
    flex: 1
  },
  buttonGroup: {
    display: 'flex',
    gap: 'var(--space-3)',
    width: '100%'
  },
  reviewsSection: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-8)',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--gray-200)'
  },
  reviewsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-6)'
  },
  reviewsTitle: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: '700',
    color: 'var(--gray-900)'
  },
  writeReviewButton: {
    fontSize: 'var(--font-size-sm)'
  },
  reviewForm: {
    background: 'var(--gray-50)',
    padding: 'var(--space-6)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)',
    marginBottom: 'var(--space-6)'
  },
  reviewFormTitle: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-4)'
  },
  ratingInput: {
    marginBottom: 'var(--space-4)'
  },
  ratingLabel: {
    display: 'block',
    fontSize: 'var(--font-size-base)',
    fontWeight: '600',
    color: 'var(--gray-700)',
    marginBottom: 'var(--space-2)'
  },
  ratingStars: {
    display: 'flex',
    gap: 'var(--space-1)'
  },
  ratingStarButton: {
    background: 'none',
    border: 'none',
    fontSize: 'var(--font-size-2xl)',
    cursor: 'pointer',
    padding: 'var(--space-1)',
    transition: 'all var(--transition-base)'
  },
  commentInput: {
    marginBottom: 'var(--space-4)'
  },
  commentLabel: {
    display: 'block',
    fontSize: 'var(--font-size-base)',
    fontWeight: '600',
    color: 'var(--gray-700)',
    marginBottom: 'var(--space-2)'
  },
  commentTextarea: {
    width: '100%',
    padding: 'var(--space-3)',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  reviewFormButtons: {
    display: 'flex',
    gap: 'var(--space-3)'
  },
  noReviews: {
    textAlign: 'center',
    padding: 'var(--space-12)',
    color: 'var(--gray-600)'
  },
  noReviewsIcon: {
    fontSize: 'var(--font-size-5xl)',
    marginBottom: 'var(--space-4)',
    opacity: 0.5
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)'
  },
  reviewCard: {
    padding: 'var(--space-6)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'var(--space-3)'
  },
  reviewActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)'
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 'var(--font-size-sm)',
    padding: 'var(--space-1)',
    borderRadius: 'var(--radius)',
    transition: 'all var(--transition-base)',
    opacity: 0.7
  },
  reviewerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)'
  },
  reviewerName: {
    fontWeight: '600',
    color: 'var(--gray-900)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)'
  },
  youBadge: {
    fontSize: 'var(--font-size-xs)',
    background: 'var(--primary)',
    color: 'white',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-full)',
    fontWeight: '600'
  },
  reviewDate: {
    color: 'var(--gray-500)',
    fontSize: 'var(--font-size-sm)'
  },
  reviewRating: {
    display: 'flex',
    gap: 'var(--space-1)'
  },
  reviewStar: {
    fontSize: 'var(--font-size-base)'
  },
  reviewDate: {
    color: 'var(--gray-500)',
    fontSize: 'var(--font-size-sm)'
  },
  reviewComment: {
    color: 'var(--gray-700)',
    lineHeight: '1.6'
  }
}

export default ProductDetail