import { useState, useEffect } from 'react'
import { adminAPI, reviewAPI } from '../services/api'

const AdminDashboard = () => {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm, setEditForm] = useState({ price: '', discountPercentage: '', stock: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [view, setView] = useState('products')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedProductReviews, setSelectedProductReviews] = useState(null)
  const [productReviews, setProductReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [updatingRatings, setUpdatingRatings] = useState(false)

  useEffect(() => {
    fetchStats()
    if (view === 'products') {
      fetchProducts()
    } else if (view === 'orders') {
      fetchOrders()
    }
  }, [currentPage, searchQuery, view])

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getStats()
      setStats(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data } = await adminAPI.getAllProducts({ page: currentPage, limit: 10, search: searchQuery })
      setProducts(data.products)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data } = await adminAPI.getAllOrders()
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product._id)
    setEditForm({ 
      price: product.price, 
      discountPercentage: product.discountPercentage,
      stock: product.stock
    })
  }

  const saveEdit = async () => {
    try {
      await adminAPI.editProduct(editingProduct, editForm)
      setEditingProduct(null)
      fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  const fetchProductReviews = async (productId, productTitle) => {
    try {
      setReviewsLoading(true)
      const { data } = await reviewAPI.getAllByProduct(productId)
      setProductReviews(data)
      setSelectedProductReviews({ id: productId, title: productTitle })
    } catch (err) {
      console.error(err)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleUpdateAllRatings = async () => {
    if (!window.confirm('This will recalculate ratings for all products based on their reviews. Continue?')) {
      return
    }
    
    setUpdatingRatings(true)
    try {
      await adminAPI.updateAllProductRatings()
      // Refresh products to show updated ratings
      if (view === 'products') {
        fetchProducts()
      }
      alert('All product ratings updated successfully!')
    } catch (err) {
      console.error('Error updating ratings:', err)
      alert('Failed to update product ratings')
    } finally {
      setUpdatingRatings(false)
    }
  }

  const deleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return
    }
    
    try {
      await reviewAPI.delete(reviewId)
      // Refresh the reviews list
      fetchProductReviews(selectedProductReviews.id, selectedProductReviews.title)
    } catch (err) {
      console.error('Delete review error:', err)
    }
  }

  const approveReview = async (reviewId) => {
    try {
      await reviewAPI.approve(reviewId)
      fetchProductReviews(selectedProductReviews.id, selectedProductReviews.title)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚙️ Admin Dashboard</h1>
        <p style={styles.subtitle}>Manage products pricing and inventory</p>
      </div>

      <div style={styles.content}>
        <div style={styles.tabs}>
          <button 
            onClick={() => setView('products')}
            className={view === 'products' ? 'btn-primary' : 'btn-secondary'}
            style={styles.tab}
          >
            📦 Products
          </button>
          <button 
            onClick={() => setView('orders')}
            className={view === 'orders' ? 'btn-primary' : 'btn-secondary'}
            style={styles.tab}
          >
            📝 Orders
          </button>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📦</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.totalProducts}</h3>
              <p style={styles.statLabel}>Total Products</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📝</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>{stats.totalOrders}</h3>
              <p style={styles.statLabel}>Total Orders</p>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statContent}>
              <h3 style={styles.statNumber}>₹{stats.totalRevenue.toFixed(2)}</h3>
              <p style={styles.statLabel}>Total Revenue</p>
            </div>
          </div>
        </div>

        <div style={styles.adminActions}>
          <button 
            onClick={handleUpdateAllRatings}
            className="btn-primary"
            style={styles.updateRatingsButton}
            disabled={updatingRatings}
          >
            {updatingRatings ? 'Updating...' : '⭐ Update All Product Ratings'}
          </button>
        </div>

        {view === 'products' && !selectedProductReviews && (
        <div style={styles.productsSection}>
          <h2 style={styles.sectionTitle}>📦 Products Management ({products.length})</h2>
          
          <div style={styles.searchBar}>
            <input 
              type="text"
              placeholder="🔍 Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              style={styles.searchInput}
            />
          </div>
          
          {loading ? (
            <div style={styles.loadingContainer}>
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <div style={styles.productGrid}>
              {products.map(p => (
                <div key={p._id} style={styles.productCard}>
                  <h3 style={styles.productTitle}>{p.title}</h3>
                  <div style={styles.productDetails}>
                    <span style={styles.productPrice}>₹{p.price}</span>
                    {p.discountPercentage > 0 && (
                      <span style={styles.productDiscount}>{p.discountPercentage}% OFF</span>
                    )}
                  </div>
                  <div style={styles.productMeta}>
                    <span>🏷️ {p.brand || 'N/A'}</span>
                    <span>📊 {p.category || 'N/A'}</span>
                  </div>
                  <div style={styles.productMeta}>
                    <span>⭐ {p.rating}/5</span>
                    <span>📦 Stock: {p.stock}</span>
                  </div>
                  
                  {editingProduct === p._id ? (
                    <div style={styles.editForm}>
                      <div style={styles.editRow}>
                        <input 
                          type="number" 
                          placeholder="Price" 
                          value={editForm.price}
                          onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                          style={styles.editInput}
                        />
                        <input 
                          type="number" 
                          placeholder="Discount %" 
                          value={editForm.discountPercentage}
                          onChange={(e) => setEditForm({...editForm, discountPercentage: e.target.value})}
                          style={styles.editInput}
                        />
                        <input 
                          type="number" 
                          placeholder="Stock" 
                          value={editForm.stock}
                          onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                          style={styles.editInput}
                        />
                      </div>
                      <div style={styles.editButtons}>
                        <button onClick={saveEdit} className="btn-success btn-sm">Save</button>
                        <button onClick={() => setEditingProduct(null)} className="btn-secondary btn-sm">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.productActions}>
                      <button 
                        onClick={() => handleEdit(p)}
                        className="btn-primary btn-sm"
                        style={styles.actionButton}
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => fetchProductReviews(p._id, p.title)}
                        className="btn-secondary btn-sm"
                        style={styles.actionButton}
                      >
                        ⭐ Reviews
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary btn-sm"
              >
                Previous
              </button>
              <span style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
        )}

        {view === 'products' && selectedProductReviews && (
        <div style={styles.productsSection}>
          <div style={styles.detailHeader}>
            <button 
              onClick={() => setSelectedProductReviews(null)}
              style={styles.backButton}
            >
              ← Back to Products
            </button>
            <h2 style={styles.sectionTitle}>⭐ Reviews for "{selectedProductReviews.title}"</h2>
          </div>
          
          {reviewsLoading ? (
            <div style={styles.loadingContainer}>
              <div className="spinner"></div>
              <p>Loading reviews...</p>
            </div>
          ) : (
            <div style={styles.reviewsContainer}>
              {productReviews.length === 0 ? (
                <div style={styles.noReviews}>
                  <div style={styles.noReviewsIcon}>📝</div>
                  <h3 style={styles.noReviewsTitle}>No Reviews Yet</h3>
                  <p style={styles.noReviewsText}>This product hasn't received any reviews from customers yet.</p>
                </div>
              ) : (
                <div style={styles.reviewsList}>
                  <div style={styles.reviewsStats}>
                    <div style={styles.statItem}>
                      <span style={styles.statNumber}>{productReviews.length}</span>
                      <span style={styles.statLabel}>Total Reviews</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statNumber}>
                        {productReviews.length > 0 ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1) : '0'}
                      </span>
                      <span style={styles.statLabel}>Avg Rating</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statNumber}>
                        {productReviews.filter(r => r.rating >= 4).length}
                      </span>
                      <span style={styles.statLabel}>4+ Stars</span>
                    </div>
                    <div style={styles.statItem}>
                      <span style={styles.statNumber}>
                        {productReviews.filter(r => r.rating <= 2).length}
                      </span>
                      <span style={styles.statLabel}>Low Ratings</span>
                    </div>
                  </div>
                  
                  {productReviews.map(review => (
                    <div key={review._id} style={{
                      ...styles.reviewCard,
                      ...(review.isApproved ? {} : styles.reviewCardPending)
                    }}>
                      <div style={styles.reviewHeader}>
                        <div style={styles.reviewUser}>
                          <div style={styles.reviewAvatar}>👤</div>
                          <div style={styles.reviewUserInfo}>
                            <p style={styles.reviewUserName}>{review.userId?.name || 'Anonymous'}</p>
                            <p style={styles.reviewUserEmail}>{review.userId?.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div style={styles.reviewMeta}>
                          <div style={styles.reviewRating}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} style={{
                                ...styles.star,
                                color: i < review.rating ? '#FFD700' : '#E5E7EB'
                              }}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <p style={styles.reviewDate}>
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      {review.comment && (
                        <div style={styles.reviewComment}>
                          <p style={styles.reviewText}>{review.comment}</p>
                        </div>
                      )}
                      
                      <div style={styles.reviewFooter}>
                        <div style={styles.reviewStatus}>
                          <span style={{
                            ...styles.statusBadge,
                            background: '#10B981'
                          }}>
                            PUBLISHED
                          </span>
                        </div>
                        <div style={styles.reviewActions}>
                          <button
                            onClick={() => deleteReview(review._id)}
                            style={styles.deleteReviewButton}
                            title="Delete review"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {view === 'orders' && !selectedOrder && (
        <div style={styles.productsSection}>
          <h2 style={styles.sectionTitle}>📝 All Orders ({orders.length})</h2>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div className="spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : (
            <div style={styles.ordersGrid}>
              {orders.map(order => (
                <div 
                  key={order._id} 
                  style={styles.orderSummaryCard}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div style={styles.orderSummaryHeader}>
                    <h3 style={styles.orderNumber}>Order #{order._id.slice(-8).toUpperCase()}</h3>
                    <span style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div style={styles.orderSummaryContent}>
                    <div style={styles.customerSummary}>
                      <div style={styles.customerAvatar}>👤</div>
                      <div style={styles.customerInfo}>
                        <p style={styles.customerName}>{order.userId?.name || 'Unknown User'}</p>
                        <p style={styles.customerEmail}>{order.userId?.email || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div style={styles.orderSummaryMeta}>
                      <div style={styles.itemsCount}>
                        📦 {order.items?.length || 0} items
                      </div>
                      <div style={styles.orderAmount}>
                        ₹{order.totalAmount?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div style={styles.orderSummaryFooter}>
                    <div style={styles.statusBadges}>
                      <span style={{
                        ...styles.statusBadge, 
                        background: order.orderStatus === 'DELIVERED' ? '#10B981' : 
                                   order.orderStatus === 'SHIPPED' ? '#F59E0B' : '#3B82F6'
                      }}>
                        {order.orderStatus}
                      </span>
                      <span style={{
                        ...styles.statusBadge, 
                        background: order.paymentStatus === 'PAID' ? '#10B981' : '#EF4444'
                      }}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div style={styles.viewDetailsText}>
                      Click to view details →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
        {view === 'orders' && selectedOrder && (
        <div style={styles.productsSection}>
          <div style={styles.detailHeader}>
            <button 
              onClick={() => setSelectedOrder(null)}
              style={styles.backButton}
            >
              ← Back to Orders
            </button>
            <h2 style={styles.sectionTitle}>📋 Order Details - #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
          </div>
          
          <div style={styles.orderDetailCard}>
            <div style={styles.orderDetailHeader}>
              <div style={styles.orderInfo}>
                <h3 style={styles.orderTitle}>Order #{selectedOrder._id.slice(-8).toUpperCase()}</h3>
                <p style={styles.orderTimestamp}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div style={styles.orderTotalLarge}>
                ₹{selectedOrder.totalAmount?.toFixed(2)}
              </div>
            </div>

            <div style={styles.orderDetailContent}>
              {/* Customer Details */}
              <div style={styles.detailSection}>
                <h4 style={styles.sectionHeader}>👤 Customer Information</h4>
                <div style={styles.customerDetailCard}>
                  <div style={styles.customerDetailInfo}>
                    <div style={styles.customerDetailAvatar}>👤</div>
                    <div>
                      <p style={styles.customerDetailName}>{selectedOrder.userId?.name || 'Unknown User'}</p>
                      <p style={styles.customerDetailContact}>📧 {selectedOrder.userId?.email || 'N/A'}</p>
                      <p style={styles.customerDetailContact}>📞 {selectedOrder.userId?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.ShippingAddress && (
                <div style={styles.detailSection}>
                  <h4 style={styles.sectionHeader}>📍 Shipping Address</h4>
                  <div style={styles.addressDetailCard}>
                    <p style={styles.addressLine}>{selectedOrder.ShippingAddress.street}</p>
                    <p style={styles.addressLine}>
                      {selectedOrder.ShippingAddress.city}, {selectedOrder.ShippingAddress.state}
                    </p>
                    <p style={styles.addressLine}>
                      {selectedOrder.ShippingAddress.country} - {selectedOrder.ShippingAddress.zipCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Order Status */}
              <div style={styles.detailSection}>
                <h4 style={styles.sectionHeader}>📊 Order Status</h4>
                <div style={styles.statusDetailCard}>
                  <div style={styles.statusItem}>
                    <span style={styles.statusLabel}>Order Status:</span>
                    <span style={{
                      ...styles.statusValue,
                      color: selectedOrder.orderStatus === 'DELIVERED' ? '#10B981' : 
                             selectedOrder.orderStatus === 'SHIPPED' ? '#F59E0B' : '#3B82F6'
                    }}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div style={styles.statusItem}>
                    <span style={styles.statusLabel}>Payment Status:</span>
                    <span style={{
                      ...styles.statusValue,
                      color: selectedOrder.paymentStatus === 'PAID' ? '#10B981' : '#EF4444'
                    }}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <div style={styles.statusItem}>
                    <span style={styles.statusLabel}>Payment Method:</span>
                    <span style={styles.statusValue}>
                      {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div style={styles.detailSection}>
                <h4 style={styles.sectionHeader}>📦 Products ({selectedOrder.items?.length || 0})</h4>
                <div style={styles.productsDetailList}>
                  {selectedOrder.items?.map((item, idx) => {
                    const thumbnailUrl = item.thumbnailSnapshot || (item.productId?.thumbnail);
                    
                    return (
                      <div key={idx} style={styles.productDetailCard}>
                        <div style={styles.productDetailImage}>
                          {thumbnailUrl ? (
                            <img 
                              src={thumbnailUrl} 
                              alt={item.titleSnapshot || item.productId?.title}
                              style={styles.productDetailImg}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div style={{
                            ...styles.productDetailPlaceholder,
                            display: thumbnailUrl ? 'none' : 'flex'
                          }}>
                            📦
                          </div>
                        </div>
                        <div style={styles.productDetailInfo}>
                          <h5 style={styles.productDetailName}>{item.titleSnapshot || item.productId?.title}</h5>
                          <div style={styles.productDetailMeta}>
                            <span style={styles.productDetailQuantity}>Quantity: {item.quantity}</span>
                            <span style={styles.productDetailPrice}>₹{item.priceSnapshot?.toFixed(2)} each</span>
                          </div>
                        </div>
                        <div style={styles.productDetailTotal}>
                          ₹{(item.priceSnapshot * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
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
    background: 'var(--gray-50)',
    padding: 'var(--space-8) var(--space-6)'
  },
  header: {
    maxWidth: '1200px',
    margin: '0 auto var(--space-8)',
    textAlign: 'center'
  },
  title: {
    fontSize: 'var(--font-size-4xl)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-2)'
  },
  subtitle: {
    fontSize: 'var(--font-size-lg)',
    color: 'var(--gray-600)'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 'var(--space-6)',
    marginBottom: 'var(--space-8)'
  },
  adminActions: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 'var(--space-8)'
  },
  updateRatingsButton: {
    fontSize: 'var(--font-size-base)',
    padding: 'var(--space-3) var(--space-6)'
  },
  statCard: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow)',
    border: '1px solid var(--gray-200)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)'
  },
  statIcon: {
    fontSize: 'var(--font-size-4xl)',
    background: 'var(--primary-light)',
    borderRadius: 'var(--radius-full)',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statContent: {
    flex: 1
  },
  statNumber: {
    fontSize: 'var(--font-size-3xl)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-1)'
  },
  statLabel: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--gray-600)',
    fontWeight: '500'
  },
  productsSection: {
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow)',
    padding: 'var(--space-8)',
    border: '1px solid var(--gray-200)'
  },
  sectionTitle: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-6)'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-12)'
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 'var(--space-4)'
  },
  productCard: {
    padding: 'var(--space-4)',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--gray-50)',
    transition: 'all var(--transition-base)'
  },
  productTitle: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-3)'
  },
  productDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-2)'
  },
  productPrice: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  productDiscount: {
    fontSize: 'var(--font-size-xs)',
    fontWeight: '700',
    color: 'var(--danger)',
    background: '#FEF2F2',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius)'
  },
  productMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)',
    marginTop: 'var(--space-2)'
  },
  editButton: {
    width: '100%',
    marginTop: 'var(--space-3)'
  },
  productActions: {
    display: 'flex',
    gap: 'var(--space-2)',
    marginTop: 'var(--space-3)'
  },
  actionButton: {
    flex: 1
  },
  editForm: {
    marginTop: 'var(--space-3)',
    padding: 'var(--space-3)',
    background: 'white',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--gray-300)'
  },
  editRow: {
    display: 'flex',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-3)'
  },
  editInput: {
    flex: 1,
    padding: 'var(--space-2)',
    fontSize: 'var(--font-size-sm)',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius)'
  },
  editButtons: {
    display: 'flex',
    gap: 'var(--space-2)'
  },
  searchBar: {
    marginBottom: 'var(--space-6)'
  },
  searchInput: {
    width: '100%',
    padding: 'var(--space-3)',
    fontSize: 'var(--font-size-base)',
    border: '1px solid var(--gray-300)',
    borderRadius: 'var(--radius-lg)'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'var(--space-4)',
    marginTop: 'var(--space-6)',
    paddingTop: 'var(--space-6)',
    borderTop: '1px solid var(--gray-200)'
  },
  pageInfo: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)',
    fontWeight: '500'
  },
  tabs: {
    display: 'flex',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-8)',
    justifyContent: 'center'
  },
  tab: {
    minWidth: '150px'
  },
  ordersGrid: {
    display: 'grid',
    gap: 'var(--space-4)',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
  },
  orderSummaryCard: {
    background: 'white',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-base)'
  },
  orderSummaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-4)',
    paddingBottom: 'var(--space-3)',
    borderBottom: '1px solid var(--gray-200)'
  },
  orderSummaryContent: {
    marginBottom: 'var(--space-4)'
  },
  customerSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-4)'
  },
  customerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--font-size-lg)',
    flexShrink: 0
  },
  customerInfo: {
    flex: 1
  },
  customerName: {
    fontSize: 'var(--font-size-base)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-1)'
  },
  customerEmail: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)'
  },
  orderSummaryMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemsCount: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)',
    background: 'var(--gray-100)',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius-full)'
  },
  orderAmount: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  orderSummaryFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'var(--space-3)',
    borderTop: '1px solid var(--gray-200)'
  },
  statusBadges: {
    display: 'flex',
    gap: 'var(--space-2)'
  },
  viewDetailsText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-500)',
    fontStyle: 'italic'
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-6)'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: 'var(--font-size-base)',
    cursor: 'pointer',
    padding: 'var(--space-2) 0',
    fontWeight: '500'
  },
  orderDetailCard: {
    background: 'white',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden'
  },
  orderDetailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 'var(--space-6)',
    background: 'var(--gray-50)',
    borderBottom: '1px solid var(--gray-200)'
  },
  orderInfo: {
    flex: 1
  },
  orderTitle: {
    fontSize: 'var(--font-size-2xl)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-2)'
  },
  orderTimestamp: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--gray-600)'
  },
  orderTotalLarge: {
    fontSize: 'var(--font-size-3xl)',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  orderDetailContent: {
    padding: 'var(--space-6)'
  },
  detailSection: {
    marginBottom: 'var(--space-8)'
  },
  sectionHeader: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-4)',
    paddingBottom: 'var(--space-2)',
    borderBottom: '2px solid var(--primary-light)'
  },
  customerDetailCard: {
    background: 'var(--gray-50)',
    padding: 'var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)'
  },
  customerDetailInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)'
  },
  customerDetailAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--font-size-2xl)',
    flexShrink: 0
  },
  customerDetailName: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: '700',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-2)'
  },
  customerDetailContact: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--gray-600)',
    marginBottom: 'var(--space-1)'
  },
  addressDetailCard: {
    background: 'var(--gray-50)',
    padding: 'var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)'
  },
  addressLine: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--gray-700)',
    marginBottom: 'var(--space-2)',
    lineHeight: '1.5'
  },
  statusDetailCard: {
    background: 'var(--gray-50)',
    padding: 'var(--space-4)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'var(--space-4)'
  },
  statusItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)'
  },
  statusLabel: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)',
    fontWeight: '500'
  },
  statusValue: {
    fontSize: 'var(--font-size-base)',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  productsDetailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  },
  productDetailCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: 'var(--space-4)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-200)'
  },
  productDetailImage: {
    width: '80px',
    height: '80px',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    border: '1px solid var(--gray-200)',
    flexShrink: 0
  },
  productDetailImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  productDetailPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--gray-100)',
    fontSize: '24px',
    color: 'var(--gray-400)'
  },
  productDetailInfo: {
    flex: 1,
    minWidth: 0
  },
  productDetailName: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-2)'
  },
  productDetailMeta: {
    display: 'flex',
    gap: 'var(--space-4)',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)'
  },
  productDetailQuantity: {
    fontWeight: '500'
  },
  productDetailPrice: {
    fontWeight: '500'
  },
  productDetailTotal: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: '700',
    color: 'var(--primary)',
    flexShrink: 0
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-4)',
    paddingBottom: 'var(--space-4)',
    borderBottom: '1px solid var(--gray-200)'
  },
  orderNumber: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '700',
    color: 'var(--gray-900)'
  },
  orderDate: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-500)'
  },
  orderUser: {
    marginBottom: 'var(--space-4)',
    fontSize: 'var(--font-size-sm)'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-3)'
  },
  userAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--font-size-xl)',
    flexShrink: 0
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-1)'
  },
  userContact: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)',
    marginBottom: 'var(--space-1)'
  },
  shippingAddress: {
    background: 'var(--gray-50)',
    padding: 'var(--space-3)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--gray-200)'
  },
  addressTitle: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-700)',
    marginBottom: 'var(--space-1)'
  },
  addressText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)',
    lineHeight: '1.4'
  },
  orderProducts: {
    marginBottom: 'var(--space-4)'
  },
  productsTitle: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--gray-700)',
    marginBottom: 'var(--space-3)'
  },
  productsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)'
  },
  orderProduct: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--gray-200)'
  },
  productImageContainer: {
    width: '50px',
    height: '50px',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    border: '1px solid var(--gray-200)',
    flexShrink: 0
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--gray-100)',
    fontSize: '20px',
    color: 'var(--gray-400)'
  },
  productInfo: {
    flex: 1,
    minWidth: 0
  },
  productName: {
    fontSize: 'var(--font-size-sm)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    display: 'block',
    marginBottom: 'var(--space-1)'
  },
  productQuantity: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--gray-600)',
    background: 'white',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius)',
    fontWeight: '600'
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'var(--space-4)',
    borderTop: '1px solid var(--gray-200)'
  },
  orderTotal: {
    fontSize: 'var(--font-size-lg)',
    fontWeight: '700',
    color: 'var(--primary)'
  },
  orderStatus: {
    display: 'flex',
    gap: 'var(--space-2)'
  },
  statusBadge: {
    color: 'white',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: '600'
  },
  reviewsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)'
  },
  noReviews: {
    textAlign: 'center',
    padding: 'var(--space-16)',
    background: 'white',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--gray-200)'
  },
  noReviewsIcon: {
    fontSize: 'var(--font-size-5xl)',
    marginBottom: 'var(--space-4)',
    opacity: 0.5
  },
  noReviewsTitle: {
    fontSize: 'var(--font-size-xl)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-2)'
  },
  noReviewsText: {
    color: 'var(--gray-600)',
    fontSize: 'var(--font-size-base)'
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-6)'
  },
  reviewsStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-6)'
  },
  reviewCard: {
    background: 'white',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-sm)'
  },
  reviewCardPending: {
    borderLeft: '4px solid var(--warning)',
    background: '#FFFBEB'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'var(--space-4)'
  },
  reviewUser: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)'
  },
  reviewAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--font-size-xl)',
    flexShrink: 0
  },
  reviewUserInfo: {
    flex: 1
  },
  reviewUserName: {
    fontSize: 'var(--font-size-base)',
    fontWeight: '600',
    color: 'var(--gray-900)',
    marginBottom: 'var(--space-1)'
  },
  reviewUserEmail: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-600)'
  },
  reviewMeta: {
    textAlign: 'right'
  },
  reviewRating: {
    display: 'flex',
    gap: 'var(--space-1)',
    marginBottom: 'var(--space-2)'
  },
  star: {
    fontSize: 'var(--font-size-base)'
  },
  reviewDate: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--gray-500)'
  },
  reviewComment: {
    marginBottom: 'var(--space-4)',
    padding: 'var(--space-4)',
    background: 'var(--gray-50)',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--gray-200)'
  },
  reviewText: {
    fontSize: 'var(--font-size-base)',
    color: 'var(--gray-700)',
    lineHeight: '1.6',
    fontStyle: 'italic'
  },
  reviewFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'var(--space-4)',
    borderTop: '1px solid var(--gray-200)'
  },
  reviewStatus: {
    display: 'flex',
    alignItems: 'center'
  },
  reviewActions: {
    display: 'flex',
    gap: 'var(--space-2)'
  },
  deleteReviewButton: {
    background: 'var(--danger)',
    color: 'white',
    border: 'none',
    padding: 'var(--space-2) var(--space-3)',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--font-size-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-base)',
    fontWeight: '500'
  }
}

export default AdminDashboard
