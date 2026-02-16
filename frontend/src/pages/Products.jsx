import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI } from '../services/api'

const Products = () => {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [search])

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getAll({ search })
      setProducts(data.products)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={styles.container}>Loading...</div>

  return (
    <div style={styles.container}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '0.5rem' }}>Discover Products</h1>
        <p style={{ color: 'var(--gray)', fontSize: '1.1rem' }}>Find the best deals on quality products</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />
      </div>
      <div style={styles.grid}>
        {products.map(product => (
          <Link to={`/products/${product._id}`} key={product._id} style={styles.card}>
            <div style={{ height: '180px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem' }}>📦</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--dark)' }}>{product.title}</h3>
            <p style={{ color: 'var(--gray)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.5' }}>{product.description.substring(0, 80)}...</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <p style={styles.price}>
                ${product.discountPrice || product.price}
                {product.discountPrice && <span style={styles.oldPrice}>${product.price}</span>}
              </p>
              <span style={{ background: product.stock > 10 ? 'var(--success)' : 'var(--danger)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>{product.stock} left</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '3rem 1.5rem', maxWidth: '1200px', margin: '0 auto', minHeight: 'calc(100vh - 80px)' },
  search: { width: '100%', maxWidth: '600px', padding: '1rem 1.5rem', fontSize: '1rem', marginBottom: '3rem', border: '2px solid var(--border)', borderRadius: '50px', background: 'white', boxShadow: 'var(--shadow)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' },
  card: { background: 'white', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow)', transition: 'all 0.3s ease', cursor: 'pointer' },
  price: { fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.75rem' },
  oldPrice: { textDecoration: 'line-through', color: 'var(--gray)', marginLeft: '0.75rem', fontSize: '1.1rem', fontWeight: '400' }
}

export default Products
