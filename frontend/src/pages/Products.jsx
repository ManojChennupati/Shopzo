import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI } from '../services/api'
import Icon from '../components/Icon'

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
      <div className="products-loading">
        <Icon name="loader" size={40} />
        <p>Loading products...</p>
      </div>
    )
  }

  return (
    <div className="products-page">
      {/* Hero / Search */}
      <div className="products-hero">
        <h1 className="products-hero-title">Discover Amazing Products</h1>
        <p className="products-hero-subtitle">Find the best deals on quality products</p>
        <div className="products-search-bar">
          <span className="products-search-icon">
            <Icon name="search" size={18} />
          </span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="products-search-input"
            aria-label="Search products"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setCurrentPage(1) }}
              className="products-search-clear"
              aria-label="Clear search"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="products-body">
        {products.length === 0 ? (
          <div className="products-empty">
            <div className="products-empty-icon">
              <Icon name="search" size={36} />
            </div>
            <h3 className="products-empty-title">No products found</h3>
            <p className="products-empty-text">
              {search
                ? `No results for "${search}". Try a different search term.`
                : 'No products available at the moment.'}
            </p>
          </div>
        ) : (
          <>
            <div className="products-results-bar">
              <span className="products-count-chip">
                <Icon name="package" size={14} />
                {products.length} products &middot; Page {currentPage} of {totalPages}
              </span>
            </div>

            <div className="products-grid">
              {products.map(product => (
                <Link to={`/products/${product._id}`} key={product._id} className="product-card fade-in">
                  <div className="product-card-image-wrap">
                    {product.thumbnail ? (
                      <img src={product.thumbnail} alt={product.title} className="product-card-img" />
                    ) : (
                      <div className="product-card-placeholder">
                        <Icon name="package" size={52} />
                      </div>
                    )}
                    {product.discountPrice && (
                      <span className="product-discount-badge">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  <div className="product-card-body">
                    <h3 className="product-card-title">{product.title}</h3>
                    <p className="product-card-desc">
                      {(product.description?.length ?? 0) > 80
                        ? `${product.description.substring(0, 80)}...`
                        : (product.description || '')}
                    </p>
                    <div className="product-card-footer">
                      <div className="product-price-group">
                        <span className="product-price">₹{product.discountPrice || product.price}</span>
                        {product.discountPrice && (
                          <span className="product-old-price">₹{product.price}</span>
                        )}
                      </div>
                      <span
                        className="product-stock-badge"
                        style={{
                          background: product.stock > 10 ? '#10B981' : product.stock > 0 ? '#F59E0B' : '#EF4444'
                        }}
                      >
                        {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="products-pagination">
                <button
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <Icon name="arrowLeft" size={16} />
                  Previous
                </button>
                <span className="pagination-info">{currentPage} of {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                  <Icon name="arrowRight" size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Products
