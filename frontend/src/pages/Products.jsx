import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI } from '../services/api'

const Products = () => {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [search, currentPage])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data } = await productAPI.getAll({ search, page: currentPage, limit: 18 })
      setProducts(data.products)
      setTotalPages(data.pages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner spinner-large" />
        <p style={styles.loadingText}>Loading products...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Discover Amazing Products</h1>
        <p style={styles.heroSubtitle}>Find the best deals on quality products</p>
      </div>

      <div style={styles.searchWrapper}>
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
            aria-label="Search products"
          />
          {search && (
            <button 
              onClick={() => setSearch('')} 
              style={styles.clearBtn}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h3 style={styles.emptyTitle}>No products found</h3>
          <p style={styles.emptyText}>
            {search ? `No results for "${search}". Try a different search term.` : 'No products available at the moment.'}
          </p>
        </div>
      ) : (
        <>
          <div style={styles.resultsInfo}>
            <p style={styles.resultsText}>
              Showing {products.length} products • Page {currentPage} of {totalPages}
            </p>
          </div>
          <div style={styles.grid}>
            {products.map(product => (
              <Link to={`/products/${product._id}`} key={product._id} style={styles.card} className="fade-in">
                <div style={styles.imageContainer}>
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
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{product.title}</h3>
                  <p style={styles.cardDescription}>
                    {product.description.length > 80 
                      ? `${product.description.substring(0, 80)}...` 
                      : product.description}
                  </p>
                  <div style={styles.cardFooter}>
                    <div style={styles.priceContainer}>
                      <span style={styles.price}>
                        ₹{product.discountPrice || product.price}
                      </span>
                      {product.discountPrice && (
                        <span style={styles.oldPrice}>₹{product.price}</span>
                      )}
                    </div>
                    <span style={{
                      ...styles.stockBadge,
                      background: product.stock > 10 ? 'var(--success)' : product.stock > 0 ? '#FFA500' : 'var(--danger)'
                    }}>
                      {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button 
                onClick={() => setCurrentPage(prev => prev - 1)} 
                disabled={currentPage === 1}
                style={{
                  ...styles.paginationBtn,
                  ...(currentPage === 1 && styles.paginationBtnDisabled)
                }}
              >
                <span style={styles.paginationArrow}>←</span>
                <span>Previous</span>
              </button>
              
              <div style={styles.paginationCenter}>
                <div style={styles.paginationInfo}>
                  <span style={styles.pageNumber}>{currentPage}</span>
                  <span style={styles.pageSeparator}>of</span>
                  <span style={styles.totalPages}>{totalPages}</span>
                </div>
                <div style={styles.pageDotsContainer}>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        ...styles.pageDot,
                        ...(currentPage === i + 1 && styles.pageDotActive)
                      }}
                      aria-label={`Go to page ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)} 
                disabled={currentPage === totalPages}
                style={{
                  ...styles.paginationBtn,
                  ...(currentPage === totalPages && styles.paginationBtnDisabled)
                }}
              >
                <span>Next</span>
                <span style={styles.paginationArrow}>→</span>
              </button>
            </div>
          )}
        </>
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
  hero: {
    textAlign: 'center',
    marginBottom: '3rem'
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'var(--dark)',
    marginBottom: '0.5rem'
  },
  heroSubtitle: {
    color: 'var(--gray)',
    fontSize: '1.1rem'
  },
  searchWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '3rem'
  },
  searchContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '1.5rem',
    fontSize: '1.2rem',
    pointerEvents: 'none'
  },
  search: { 
    width: '100%',
    padding: '1rem 3.5rem 1rem 3.5rem',
    fontSize: '1rem',
    border: '2px solid var(--border)',
    borderRadius: '50px',
    background: 'white',
    boxShadow: 'var(--shadow)',
    transition: 'var(--transition)'
  },
  clearBtn: {
    position: 'absolute',
    right: '1rem',
    background: 'var(--gray-light)',
    color: 'white',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: 'none',
    transition: 'var(--transition-fast)'
  },
  resultsInfo: {
    marginBottom: '1.5rem'
  },
  resultsText: {
    color: 'var(--gray)',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
    gap: '2rem' 
  },
  card: { 
    background: 'white', 
    border: '1px solid var(--border)', 
    borderRadius: 'var(--radius-lg)', 
    boxShadow: 'var(--shadow)', 
    transition: 'var(--transition)', 
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  imageContainer: {
    position: 'relative',
    height: '200px',
    background: 'var(--light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imagePlaceholder: {
    color: 'var(--gray)',
    fontSize: '4rem'
  },
  discountBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'var(--danger)',
    color: 'white',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    boxShadow: 'var(--shadow-md)'
  },
  cardContent: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  cardTitle: { 
    fontSize: '1.25rem', 
    fontWeight: '600', 
    marginBottom: '0.5rem', 
    color: 'var(--dark)',
    lineHeight: '1.3'
  },
  cardDescription: { 
    color: 'var(--gray)', 
    fontSize: '0.95rem', 
    marginBottom: '1rem', 
    lineHeight: '1.5',
    flex: 1
  },
  cardFooter: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: '1rem',
    borderTop: '1px solid var(--border)'
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  price: { 
    fontSize: '1.5rem', 
    fontWeight: '700', 
    color: 'var(--primary)'
  },
  oldPrice: { 
    textDecoration: 'line-through', 
    color: 'var(--gray)', 
    fontSize: '1rem', 
    fontWeight: '400' 
  },
  stockBadge: {
    color: 'white',
    padding: '0.35rem 0.85rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow)'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--dark)',
    marginBottom: '0.5rem'
  },
  emptyText: {
    color: 'var(--gray)',
    fontSize: '1rem'
  },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    marginTop: '4rem',
    padding: '2rem 3rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(102,126,234,0.3)'
  },
  paginationBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  },
  paginationBtnDisabled: {
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.1)',
    cursor: 'not-allowed',
    opacity: 0.4
  },
  paginationArrow: {
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  paginationCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem'
  },
  paginationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: 'white'
  },
  pageNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: 'white',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
  },
  pageSeparator: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500'
  },
  totalPages: {
    fontSize: '1.5rem',
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600'
  },
  pageDotsContainer: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  pageDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: 0
  },
  pageDotActive: {
    width: '16px',
    height: '16px',
    background: 'white',
    boxShadow: '0 0 15px rgba(255,255,255,0.8)'
  }
}

export default Products
