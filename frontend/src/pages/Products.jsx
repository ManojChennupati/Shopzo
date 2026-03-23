import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI } from '../services/api'
import Icon from '../components/Icon'

const Products = () => {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchProducts(1)
  }, [search])

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true)
      setError('')
      
      const { data } = await productAPI.getAll({ search, page, limit: 10 })
      setProducts(data.products)
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total
      })
    } catch (err) {
      setError('Failed to load products. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.pages && !loading) {
      fetchProducts(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const ProductCard = ({ product }) => (
    <Link to={`/products/${product._id}`} style={styles.card} className="product-card">
      <div style={styles.imageContainer}>
        <div style={styles.productImage}>
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.title} style={styles.thumbnailImg} />
          ) : (
            <div style={styles.productIcon}><Icon name="package" size={48} style={{ color: 'rgba(255,255,255,0.8)' }} /></div>
          )}
        </div>
        {product.discountPercentage > 0 && (
          <div style={styles.discountBadge}>
            <span style={styles.discountText}>{Math.round(product.discountPercentage)}% OFF</span>
          </div>
        )}
        <div style={styles.cardOverlay}>
          <div style={styles.quickActions}>
            <button style={styles.quickActionBtn} title="Quick View">
              <Icon name="eye" size={16} />
            </button>
            <button style={styles.quickActionBtn} title="Add to Wishlist">
              <Icon name="heart" size={16} />
            </button>
          </div>
        </div>
        {product.rating > 0 && (
          <div style={styles.ratingBadge}>
            <Icon name="star" size={12} style={{ color: '#FFD700' }} />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <div style={styles.cardContent}>
        {product.brand && (
          <p style={styles.brandName}>{product.brand}</p>
        )}
        <h3 style={styles.productTitle}>{product.title}</h3>
        <p style={styles.productDescription}>
          {product.description?.length > 80 
            ? `${product.description.substring(0, 80)}...` 
            : product.description
          }
        </p>
        
        <div style={styles.productFooter}>
          <div style={styles.priceContainer}>
            <span style={styles.currentPrice}>
              ₹{product.discountPercentage > 0 ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2) : product.price?.toFixed(2)}
            </span>
            {product.discountPercentage > 0 && (
              <span style={styles.originalPrice}>₹{product.price?.toFixed(2)}</span>
            )}
          </div>
          
          <div style={styles.stockContainer}>
            <div style={{
              ...styles.stockIndicator,
              ...(product.stock > 10 ? styles.stockHigh : product.stock > 0 ? styles.stockLow : styles.stockOut)
            }}></div>
            <span style={{
              ...styles.stockBadge,
              ...(product.stock > 10 ? styles.inStock : product.stock > 0 ? styles.lowStock : styles.outOfStock)
            }}>
              {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )

  const LoadingSkeleton = () => (
    <div style={styles.skeletonCard}>
      <div style={styles.skeletonImage}></div>
      <div style={styles.skeletonContent}>
        <div style={styles.skeletonTitle}></div>
        <div style={styles.skeletonText}></div>
        <div style={styles.skeletonText}></div>
        <div style={styles.skeletonFooter}>
          <div style={styles.skeletonPrice}></div>
          <div style={styles.skeletonBadge}></div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Discover Amazing Products</h1>
        <p style={styles.heroSubtitle}>
          Find the best deals on quality products from trusted sellers
        </p>
      </div>

      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <div style={styles.searchIcon}><Icon name="search" size={20} style={{ color: 'var(--gray-400)' }} /></div>
          <input
            type="text"
            placeholder="Search for products, brands, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
            aria-label="Search products"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={styles.clearButton}
              aria-label="Clear search"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
          <button onClick={() => fetchProducts(1)} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      <div style={styles.resultsSection}>
        {!loading && !error && (
          <div style={styles.resultsHeader}>
            <h2 style={styles.resultsTitle}>
              {search ? `Search Results for "${search}"` : 'All Products'}
            </h2>
            <span style={styles.resultsCount}>
              {products.length} of {pagination.total} {pagination.total === 1 ? 'product' : 'products'}
            </span>
          </div>
        )}

        <div style={styles.grid} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {loading ? (
            // Show loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))
          ) : products.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}><Icon name="search" size={64} style={{ color: 'var(--gray-300)' }} /></div>
              <h3 style={styles.emptyTitle}>
                {search ? 'No products found' : 'No products available'}
              </h3>
              <p style={styles.emptyText}>
                {search 
                  ? `We couldn't find any products matching "${search}". Try a different search term.`
                  : 'Check back later for new products.'
                }
              </p>
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="btn-primary"
                  style={styles.showAllButton}
                >
                  Show All Products
                </button>
              )}
            </div>
          ) : (
            <>
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </>
          )}
        </div>
        
        {/* Pagination Controls */}
        {!loading && !error && products.length > 0 && pagination.pages > 1 && (
          <div style={styles.paginationContainer}>
            <div style={styles.paginationInfo}>
              Showing {((pagination.page - 1) * 10) + 1}-{Math.min(pagination.page * 10, pagination.total)} of {pagination.total} products
            </div>
            
            <div style={styles.paginationControls}>
              <button 
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
                className="btn-secondary"
                style={styles.paginationButton}
              >
                <span style={styles.arrow}>←</span>
                Previous
              </button>
              
              <div style={styles.pageNumbers}>
                <span style={styles.currentPage}>{pagination.page}</span>
                <span style={styles.pageSeparator}>of</span>
                <span style={styles.totalPages}>{pagination.pages}</span>
              </div>
              
              <button 
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || loading}
                className="btn-primary"
                style={styles.paginationButton}
              >
                Next
                <span style={styles.arrow}>→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { 
    minHeight: 'calc(100vh - 64px)',
    background: 'var(--gray-50)'
  },
  hero: {
    textAlign: 'center',
    padding: 'var(--space-20) var(--space-6) var(--space-16)',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, #4338CA 100%)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden'
  },
  heroTitle: {
    fontSize: 'var(--font-size-6xl)',
    fontWeight: '900',
    marginBottom: 'var(--space-6)',
    lineHeight: '1.1',
    letterSpacing: '-0.04em',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E7FF 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'fadeIn 0.8s ease-out'
  },
  heroSubtitle: {
    fontSize: 'var(--font-size-2xl)',
    opacity: 0.95,
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: '1.4',
    fontWeight: '400',
    animation: 'fadeIn 0.8s ease-out 0.2s both'
  },
  searchSection: {
    padding: 'var(--space-12) var(--space-6)',
    background: 'white',
    borderBottom: '1px solid var(--gray-200)',
    position: 'relative'
  },
  searchContainer: {
    position: 'relative',
    maxWidth: '700px',
    margin: '0 auto'
  },
  searchIcon: {
    position: 'absolute',
    left: 'var(--space-5)',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    zIndex: 2
  },
  searchInput: {
    width: '100%',
    padding: 'var(--space-5) var(--space-16)',
    fontSize: 'var(--font-size-lg)',
    border: '2px solid var(--gray-300)',
    borderRadius: 'var(--radius-2xl)',
    background: 'white',
    boxShadow: 'var(--shadow-lg)',
    transition: 'all var(--transition-base)',
    fontWeight: '500',
    letterSpacing: '-0.011em'
  },
  clearButton: {
    position: 'absolute',
    right: 'var(--space-5)',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'var(--gray-200)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)',
    transition: 'all var(--transition-base)',
    zIndex: 2
  },
  resultsSection: {
    padding: 'var(--space-8) var(--space-6)',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-8)',
    flexWrap: 'wrap',
    gap: 'var(--space-4)'
  },
  resultsTitle: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: '700',
    color: 'var(--gray-900)'
  },
  resultsCount: {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-size-base)'
  },
  grid: {
    display: 'grid',
    gap: 'var(--space-6)'
  },
  card: {
    background: 'white',
    borderRadius: 'var(--radius-2xl)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--gray-200)',
    transition: 'all var(--transition-base)',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    height: '100%',
    position: 'relative',
    transformOrigin: 'center bottom'
  },
  imageContainer: {
    position: 'relative',
    height: '280px',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%)'
  },
  productImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-6)',
    transition: 'transform var(--transition-base)'
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transition: 'transform var(--transition-base)'
  },
  productIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6
  },
  discountBadge: {
    position: 'absolute',
    top: 'var(--space-4)',
    left: 'var(--space-4)',
    background: 'linear-gradient(135deg, var(--danger) 0%, #E6445A 100%)',
    color: 'white',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: '700',
    boxShadow: 'var(--shadow-md)',
    transform: 'rotate(-8deg)',
    zIndex: 2
  },
  discountText: {
    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'all var(--transition-base)',
    backdropFilter: 'blur(2px)'
  },
  quickActions: {
    display: 'flex',
    gap: 'var(--space-3)',
    transform: 'translateY(20px)',
    transition: 'transform var(--transition-base)'
  },
  quickActionBtn: {
    width: '48px',
    height: '48px',
    background: 'white',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
    boxShadow: 'var(--shadow-lg)',
    color: 'var(--gray-700)'
  },
  ratingBadge: {
    position: 'absolute',
    top: 'var(--space-4)',
    right: 'var(--space-4)',
    background: 'rgba(255, 255, 255, 0.95)',
    color: 'var(--gray-800)',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    boxShadow: 'var(--shadow-sm)',
    backdropFilter: 'blur(8px)'
  },
  cardContent: {
    padding: 'var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 280px)',
    justifyContent: 'space-between'
  },
  brandName: {
    color: 'var(--primary)',
    fontSize: 'var(--font-size-xs)',
    marginBottom: 'var(--space-2)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    margin: '0 0 var(--space-2) 0'
  },
  productTitle: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '600',
    marginBottom: 'var(--space-3)',
    color: 'var(--gray-900)',
    lineHeight: '1.3',
    margin: '0 0 var(--space-3) 0',
    letterSpacing: '-0.011em'
  },
  productDescription: {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-size-sm)',
    lineHeight: '1.5',
    marginBottom: 'auto',
    margin: '0 0 var(--space-5) 0',
    flex: '1'
  },
  productFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 'var(--space-3)',
    marginTop: 'var(--space-4)'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--space-2)',
    flexWrap: 'wrap'
  },
  currentPrice: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: '700',
    color: 'var(--primary)',
    letterSpacing: '-0.02em'
  },
  originalPrice: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--gray-500)',
    textDecoration: 'line-through',
    fontWeight: '500'
  },
  stockContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)'
  },
  stockIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: 'var(--radius-full)',
    flexShrink: 0
  },
  stockHigh: {
    background: 'var(--success)'
  },
  stockLow: {
    background: 'var(--warning)'
  },
  stockOut: {
    background: 'var(--danger)'
  },
  stockBadge: {
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  inStock: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: 'var(--success)'
  },
  lowStock: {
    background: 'rgba(255, 176, 32, 0.1)',
    color: 'var(--warning)'
  },
  outOfStock: {
    background: 'rgba(255, 82, 99, 0.1)',
    color: 'var(--danger)'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: 'var(--space-16) var(--space-6)',
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow)'
  },
  emptyIcon: {
    marginBottom: 'var(--space-6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyTitle: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-4)'
  },
  emptyText: {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-size-base)',
    marginBottom: 'var(--space-6)',
    maxWidth: '500px',
    margin: '0 auto var(--space-6)'
  },
  showAllButton: {
    marginTop: 'var(--space-4)'
  },
  retryButton: {
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    textDecoration: 'underline',
    cursor: 'pointer',
    marginLeft: 'var(--space-2)'
  },
  // Loading skeleton styles
  skeletonCard: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--gray-200)'
  },
  skeletonImage: {
    height: '200px',
    background: 'var(--gray-200)',
    animation: 'pulse 2s infinite'
  },
  skeletonContent: {
    padding: 'var(--space-6)'
  },
  skeletonTitle: {
    height: '20px',
    background: 'var(--gray-200)',
    borderRadius: 'var(--radius)',
    marginBottom: 'var(--space-3)',
    animation: 'pulse 2s infinite'
  },
  skeletonText: {
    height: '14px',
    background: 'var(--gray-200)',
    borderRadius: 'var(--radius)',
    marginBottom: 'var(--space-2)',
    animation: 'pulse 2s infinite'
  },
  skeletonFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--space-4)'
  },
  skeletonPrice: {
    height: '24px',
    width: '80px',
    background: 'var(--gray-200)',
    borderRadius: 'var(--radius)',
    animation: 'pulse 2s infinite'
  },
  skeletonBadge: {
    height: '20px',
    width: '60px',
    background: 'var(--gray-200)',
    borderRadius: 'var(--radius-full)',
    animation: 'pulse 2s infinite'
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--space-8)',
    paddingTop: 'var(--space-6)',
    borderTop: '1px solid var(--gray-200)',
    flexWrap: 'wrap',
    gap: 'var(--space-4)'
  },
  paginationInfo: {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)'
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)'
  },
  paginationButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-3) var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    minWidth: '100px',
    justifyContent: 'center'
  },
  pageNumbers: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: '0 var(--space-4)',
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-semibold)'
  },
  currentPage: {
    color: 'var(--primary)',
    fontSize: 'var(--font-size-lg)'
  },
  pageSeparator: {
    color: 'var(--gray-400)',
    fontSize: 'var(--font-size-sm)'
  },
  totalPages: {
    color: 'var(--gray-600)'
  },
  arrow: {
    fontSize: 'var(--font-size-base)',
    transition: 'transform var(--transition-base)'
  }
}

export default Products