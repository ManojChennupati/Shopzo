import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  const [message, setMessage] = useState('')

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
    try {
      const { data } = await cartAPI.add({ productId: id, quantity })
      updateCartCount(data.cart.totalItems)
      setMessage('Added to cart!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to cart')
    }
  }

  if (!product) return <div style={styles.container}>Loading...</div>

  return (
    <div style={styles.container}>
      <div style={styles.detail}>
        <h1>{product.title}</h1>
        <p>{product.description}</p>
        <p style={styles.price}>
          ${product.discountPrice || product.price}
          {product.discountPrice && <span style={styles.oldPrice}>${product.price}</span>}
        </p>
        <p>Stock: {product.stock}</p>
        <div style={styles.actions}>
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={styles.input}
          />
          <button onClick={handleAddToCart} style={styles.button}>Add to Cart</button>
        </div>
        {message && <p style={styles.message}>{message}</p>}
      </div>
      <div style={styles.reviews}>
        <h2>Reviews</h2>
        {reviews.length === 0 ? <p>No reviews yet</p> : reviews.map(review => (
          <div key={review._id} style={styles.review}>
            <p><strong>{review.userId.name}</strong> - {review.rating}/5</p>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  detail: { marginBottom: '2rem' },
  price: { fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' },
  oldPrice: { textDecoration: 'line-through', color: '#999', marginLeft: '0.5rem', fontSize: '1.25rem' },
  actions: { display: 'flex', gap: '1rem', marginTop: '1rem' },
  input: { width: '80px', padding: '0.5rem', fontSize: '1rem', border: '1px solid #ddd', borderRadius: '4px' },
  button: { padding: '0.5rem 1.5rem', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '1rem' },
  message: { marginTop: '1rem', color: '#27ae60' },
  reviews: { marginTop: '2rem' },
  review: { border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }
}

export default ProductDetail
